<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Breed;
use App\Models\CityTownship;
use App\Models\Color;
use App\Models\Notification;
use App\Models\PetCategory;
use App\Models\PetImage;
use App\Models\PetReport;
use App\Models\StateRegion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MyReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = PetReport::with(['category', 'breed', 'color', 'stateRegion', 'township', 'images'])
            ->where('user_id', $user->id);

        if ($request->filled('type') && in_array($request->type, ['lost', 'found'])) {
            $query->where('type', $request->type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $reports = $query->latest()->get();

        $counts = [
            'total' => PetReport::where('user_id', $user->id)->count(),
            'lost' => PetReport::where('user_id', $user->id)->where('type', 'lost')->count(),
            'found' => PetReport::where('user_id', $user->id)->where('type', 'found')->count(),
            'pending' => PetReport::where('user_id', $user->id)->where('status', 'pending')->count(),
            'approved' => PetReport::where('user_id', $user->id)->where('status', 'approved')->count(),
            'reunited' => PetReport::where('user_id', $user->id)->where('status', 'reunited')->count(),
        ];

        return response()->json([
            'status' => 'success',
            'data' => $reports,
            'counts' => $counts,
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $report = PetReport::where('id', $id)->where('user_id', $user->id)->first();

        if (! $report) {
            return response()->json([
                'status' => 'error',
                'message' => 'Report not found or you are not authorized to modify it.',
            ], 403);
        }

        // Auto-resolve category_id
        if ($request->filled('pet_type') || $request->filled('category') || $request->filled('species')) {
            $val = $request->pet_type ?: ($request->category ?: $request->species);
            $catId = PetCategory::where('name', 'like', "%{$val}%")->orWhere('slug', strtolower($val))->value('id');
            if ($catId) $request->merge(['category_id' => $catId]);
        }

        // Auto-resolve breed_id
        if ($request->filled('breed')) {
            $catId = $request->input('category_id', $report->category_id);
            $bId = Breed::where('name', $request->breed)->value('id');
            if (! $bId && $request->breed) {
                $newB = Breed::firstOrCreate(
                    ['name' => $request->breed, 'category_id' => $catId],
                    ['slug' => Str::slug($request->breed)]
                );
                $bId = $newB->id;
            }
            if ($bId) $request->merge(['breed_id' => $bId]);
        }

        // Auto-resolve color_id
        if ($request->filled('colour') || $request->filled('color')) {
            $cName = $request->colour ?: $request->color;
            $cId = Color::where('name', 'like', "%{$cName}%")->value('id');
            if (! $cId && $cName) {
                $newC = Color::firstOrCreate(['name' => $cName]);
                $cId = $newC->id;
            }
            if ($cId) $request->merge(['color_id' => $cId]);
        }

        // Auto-resolve state_region_id
        if ($request->filled('state_region') || $request->filled('region')) {
            $rName = $request->state_region ?: $request->region;
            $rId = StateRegion::where('name', 'like', "%{$rName}%")->value('id');
            if ($rId) $request->merge(['state_region_id' => $rId]);
        }

        // Auto-resolve township_id
        if ($request->filled('township')) {
            $tName = $request->township;
            $tId = CityTownship::where('name', 'like', "%{$tName}%")->value('id');
            if ($tId) $request->merge(['township_id' => $tId]);
        }

        // Format gender to lowercase
        if ($request->filled('gender')) {
            $request->merge(['gender' => strtolower($request->gender)]);
        }

        $validated = $request->validate([
            'type' => ['nullable', 'in:lost,found'],
            'category_id' => ['nullable', 'exists:pet_categories,id'],
            'breed_id' => ['nullable', 'exists:breeds,id'],
            'color_id' => ['nullable', 'exists:colors,id'],
            'secondary_color' => ['nullable', 'string', 'max:255'],
            'pet_name' => ['nullable', 'string', 'max:255'],
            'age' => ['nullable', 'string', 'max:100'],
            'gender' => ['nullable', 'in:male,female,unknown'],
            'collar_description' => ['nullable', 'string', 'max:255'],
            'microchip_id' => ['nullable', 'string', 'max:255'],
            'event_date' => ['nullable', 'date'],
            'event_time' => ['nullable', 'string', 'max:50'],
            'state_region_id' => ['nullable', 'exists:states_regions,id'],
            'township_id' => ['nullable', 'exists:cities_townships,id'],
            'last_seen_or_found_location' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'reward_amount' => ['nullable', 'string', 'max:100'],
            'physical_condition' => ['nullable', 'string', 'max:255'],
            'safe_holding_location' => ['nullable', 'string', 'max:255'],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:50'],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['file', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ]);

        $updateData = array_filter($validated, function ($val) {
            return ! is_null($val);
        });
        unset($updateData['images']);

        $report->update($updateData);

        // Upload new images if provided
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('pets', 'public');
                PetImage::create([
                    'pet_report_id' => $report->id,
                    'image_path' => Storage::url($path),
                    'is_primary' => false,
                ]);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Pet report updated successfully.',
            'data' => $report->load(['images', 'category', 'breed', 'color', 'stateRegion', 'township']),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $report = PetReport::where('id', $id)->where('user_id', $user->id)->first();

        if (! $report) {
            return response()->json([
                'status' => 'error',
                'message' => 'Report not found or you are not authorized to delete it.',
            ], 403);
        }

        $report->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Report deleted successfully.',
        ]);
    }

    public function markReunited(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $report = PetReport::where('id', $id)->where('user_id', $user->id)->first();

        if (! $report) {
            return response()->json([
                'status' => 'error',
                'message' => 'Report not found or unauthorized.',
            ], 403);
        }

        $report->status = 'reunited';
        $report->save();

        // Create notification for celebration
        Notification::create([
            'user_id' => $user->id,
            'type' => 'reunited',
            'title' => 'Pet Reunited! 🎉',
            'message' => "Congratulations! Your report for {$report->pet_name} has been marked as Reunited.",
            'action_url' => '/user/my-reports',
            'is_read' => false,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Congratulations! {$report->pet_name} has been marked as reunited.",
            'data' => $report,
        ]);
    }
}
