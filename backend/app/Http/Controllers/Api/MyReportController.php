<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\PetReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

        $validated = $request->validate([
            'pet_name' => ['nullable', 'string', 'max:255'],
            'age' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'reward_amount' => ['nullable', 'string', 'max:100'],
            'last_seen_or_found_location' => ['nullable', 'string', 'max:255'],
            'contact_name' => ['required', 'string', 'max:255'],
            'contact_phone' => ['required', 'string', 'max:50'],
        ]);

        $report->update($validated);

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
