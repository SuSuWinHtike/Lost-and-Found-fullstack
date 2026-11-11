<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => strtolower(trim($request->email)),
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => 'user',
            'status' => 'active',
            'state_region' => $request->state_region ?? 'Yangon Region',
            'township' => $request->township ?? 'Hlaing Township',
            'avatar' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        ]);

        $token = $user->createToken('petlove_auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Registration successful! Welcome to PetLove.',
            'token' => $token,
            'user' => $user,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $email = strtolower(trim($request->email));
        $user = User::where('email', $email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid email or password. Please try again.',
            ], 401);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'status' => 'error',
                'message' => "Your account is currently {$user->status}. Please contact the support team.",
            ], 403);
        }

        // Revoke older tokens if any to keep session clean
        $user->tokens()->delete();

        $token = $user->createToken('petlove_auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => "Welcome back, {$user->name}!",
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user) {
            $user->currentAccessToken()->delete();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'You have been signed out successfully.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated',
            ], 401);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'status' => 'error',
                'message' => "Your account is {$user->status}.",
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'user' => $user,
        ]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', strtolower(trim($request->email)))->first();

        if (! $user) {
            return response()->json([
                'status' => 'error',
                'message' => 'No account was found with that email address.',
            ], 404);
        }

        // Return a mock confirmation with token/link
        return response()->json([
            'status' => 'success',
            'message' => 'Password reset instructions have been sent to your email.',
        ]);
    }
}
