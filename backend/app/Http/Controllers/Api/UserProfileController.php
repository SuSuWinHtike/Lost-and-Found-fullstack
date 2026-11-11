<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\PetReport;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class UserProfileController extends Controller
{
    public function dashboardStats(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $activeLost = PetReport::where('user_id', $userId)
            ->where('type', 'lost')
            ->whereIn('status', ['approved', 'pending'])
            ->count();

        $activeFound = PetReport::where('user_id', $userId)
            ->where('type', 'found')
            ->whereIn('status', ['approved', 'pending'])
            ->count();

        $reunited = PetReport::where('user_id', $userId)
            ->where('status', 'reunited')
            ->count();

        // Count potential matches using our match engine logic
        $userLostCount = PetReport::where('user_id', $userId)->where('type', 'lost')->count();
        $potentialMatches = $userLostCount > 0
            ? PetReport::where('type', 'found')->where('status', 'approved')->count()
            : 0;

        $recentReports = PetReport::with(['category', 'breed', 'color', 'township', 'images'])
            ->where('user_id', $userId)
            ->latest()
            ->limit(5)
            ->get();

        $recentNotifications = Notification::where('user_id', $userId)
            ->latest()
            ->limit(5)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'active_lost_reports' => $activeLost,
                'active_found_reports' => $activeFound,
                'potential_matches' => $potentialMatches,
                'reunited_pets' => $reunited,
                'recent_reports' => $recentReports,
                'recent_notifications' => $recentNotifications,
            ],
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => ['required', 'string', 'max:50'],
            'state_region' => ['nullable', 'string', 'max:255'],
            'township' => ['nullable', 'string', 'max:255'],
        ]);

        $user->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Profile details updated successfully.',
            'user' => $user->fresh(),
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Your current password does not match our records.',
            ], 422);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Password changed successfully.',
        ]);
    }

    public function updateAvatar(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'avatar' => ['required', 'file', 'image', 'mimes:jpeg,png,jpg,webp', 'max:3072'],
        ]);

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->avatar = Storage::url($path);
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Profile picture updated successfully.',
            'avatar' => $user->avatar,
            'user' => $user->fresh(),
        ]);
    }

    public function users(): JsonResponse
    {
        $users = User::latest()->get();

        return response()->json([
            'status' => 'success',
            'data' => $users,
        ]);
    }

    public function toggleUserStatus(int $id): JsonResponse
    {
        $targetUser = User::findOrFail($id);
        $targetUser->status = ($targetUser->status === 'active') ? 'suspended' : 'active';
        $targetUser->save();

        return response()->json([
            'status' => 'success',
            'message' => "User status changed to {$targetUser->status}.",
            'user' => $targetUser,
        ]);
    }
}
