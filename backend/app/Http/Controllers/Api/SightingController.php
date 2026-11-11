<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Notification;
use App\Models\PetReport;
use App\Models\Sighting;
use App\Models\SightingImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class SightingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Sighting::with(['petReport.images', 'user', 'stateRegion', 'township', 'images'])
            ->where('status', 'approved');

        if ($request->filled('pet_report_id')) {
            $query->where('pet_report_id', $request->pet_report_id);
        }

        if ($request->filled('township_id')) {
            $query->where('township_id', $request->township_id);
        }

        $sightings = $query->latest()->paginate(15);

        return response()->json([
            'status' => 'success',
            'data' => $sightings->items(),
            'pagination' => [
                'current_page' => $sightings->currentPage(),
                'last_page' => $sightings->lastPage(),
                'total' => $sightings->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        // Auto-clean pet_report_id
        if ($request->filled('pet_report_id')) {
            $rawId = $request->pet_report_id;
            $cleanPetId = is_numeric($rawId) ? (int)$rawId : (int)preg_replace('/\D/', '', $rawId);
            $request->merge(['pet_report_id' => $cleanPetId ?: 1]);
        }

        // Auto-resolve state_region_id
        if (!$request->filled('state_region_id') && ($request->filled('state_region') || $request->filled('region'))) {
            $rName = $request->state_region ?: $request->region;
            $rId = \App\Models\StateRegion::where('name', 'like', "%{$rName}%")->value('id');
            if ($rId) $request->merge(['state_region_id' => $rId]);
        }
        if (!$request->filled('state_region_id')) {
            $request->merge(['state_region_id' => 1]);
        }

        // Auto-resolve township_id
        if (!$request->filled('township_id') && $request->filled('township')) {
            $tName = $request->township;
            $tId = \App\Models\CityTownship::where('name', 'like', "%{$tName}%")->value('id');
            if ($tId) $request->merge(['township_id' => $tId]);
        }
        if (!$request->filled('township_id')) {
            $tId = \App\Models\CityTownship::where('state_region_id', $request->state_region_id)->value('id') ?: 1;
            $request->merge(['township_id' => $tId]);
        }

        // Support single file or 'image' field
        if ($request->hasFile('image') && !$request->hasFile('images')) {
            $request->merge(['images' => [$request->file('image')]]);
        }

        $validated = $request->validate([
            'pet_report_id' => ['required', 'exists:pet_reports,id'],
            'state_region_id' => ['required', 'exists:states_regions,id'],
            'township_id' => ['required', 'exists:cities_townships,id'],
            'sighting_date' => ['required', 'date'],
            'sighting_time' => ['nullable', 'string', 'max:50'],
            'location_details' => ['required', 'string', 'max:255'],
            'witness_notes' => ['nullable', 'string'],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['file', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ]);

        return DB::transaction(function () use ($request, $validated) {
            $user = $request->user();

            $sighting = Sighting::create([
                'pet_report_id' => $validated['pet_report_id'],
                'user_id' => $user->id,
                'state_region_id' => $validated['state_region_id'],
                'township_id' => $validated['township_id'],
                'sighting_date' => $validated['sighting_date'],
                'sighting_time' => $validated['sighting_time'] ?? null,
                'location_details' => $validated['location_details'],
                'witness_notes' => $validated['witness_notes'] ?? null,
                'status' => 'approved',
            ]);

            // Save photos if uploaded
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $file) {
                    $path = $file->store('sightings', 'public');
                    SightingImage::create([
                        'sighting_id' => $sighting->id,
                        'image_path' => Storage::url($path),
                    ]);
                }
            }

            // Notify pet owner & initiate/link chat conversation
            $pet = PetReport::find($validated['pet_report_id']);
            $conversationId = null;

            if ($pet && $pet->user_id !== $user->id) {
                Notification::create([
                    'user_id' => $pet->user_id,
                    'type' => 'sighting',
                    'title' => "New Sighting Reported for {$pet->pet_name}",
                    'message' => "A community member spotted your pet near {$sighting->location_details}.",
                    'action_url' => "/user/messages",
                    'data' => ['sighting_id' => $sighting->id, 'pet_id' => $pet->id],
                    'is_read' => false,
                ]);

                // Create or retrieve conversation between witness and pet owner
                $conversation = Conversation::where(function ($q) use ($user, $pet) {
                    $q->where('user_one_id', $user->id)->where('user_two_id', $pet->user_id);
                })->orWhere(function ($q) use ($user, $pet) {
                    $q->where('user_one_id', $pet->user_id)->where('user_two_id', $user->id);
                })->first();

                if (! $conversation) {
                    $conversation = Conversation::create([
                        'pet_report_id' => $pet->id,
                        'user_one_id' => $user->id,
                        'user_two_id' => $pet->user_id,
                        'last_message_at' => now(),
                    ]);
                } else {
                    $conversation->update([
                        'pet_report_id' => $pet->id,
                        'last_message_at' => now(),
                    ]);
                }

                $timeText = $sighting->sighting_time ? " at {$sighting->sighting_time}" : '';
                $notesText = $sighting->witness_notes ? " Notes: \"{$sighting->witness_notes}\"" : '';
                $msgBody = "📍 Community Sighting: I spotted {$pet->pet_name} near {$sighting->location_details} on {$sighting->sighting_date}{$timeText}.{$notesText}";

                Message::create([
                    'conversation_id' => $conversation->id,
                    'sender_id' => $user->id,
                    'recipient_id' => $pet->user_id,
                    'message_text' => $msgBody,
                    'is_read' => false,
                ]);

                $conversationId = $conversation->id;
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Thank you! Your sighting has been recorded and the pet owner has been alerted.',
                'conversation_id' => $conversationId,
                'data' => $sighting->load(['stateRegion', 'township', 'images', 'user', 'petReport.images']),
            ], 201);
        });
    }
}
