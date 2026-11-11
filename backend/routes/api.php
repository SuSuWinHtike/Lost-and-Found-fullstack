<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MatchController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\MetadataController;
use App\Http\Controllers\Api\MyReportController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PetReportController;
use App\Http\Controllers\Api\SightingController;
use App\Http\Controllers\Api\UserProfileController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/locations', [MetadataController::class, 'locations']);
Route::get('/categories', [MetadataController::class, 'categories']);
Route::get('/colors', [MetadataController::class, 'colors']);

Route::get('/pet-reports', [PetReportController::class, 'index']);
Route::get('/pet-reports/{id}', [PetReportController::class, 'show']);
Route::get('/sightings', [SightingController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
});

/*
|--------------------------------------------------------------------------
| Authenticated User Routes (Sanctum Protected)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Auth session
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Pet Reports operations
    Route::post('/pet-reports', [PetReportController::class, 'store']);
    Route::post('/pet-reports/{id}/favorite', [PetReportController::class, 'toggleFavorite']);

    // My Submitted Reports
    Route::prefix('my-reports')->group(function () {
        Route::get('/', [MyReportController::class, 'index']);
        Route::put('/{id}', [MyReportController::class, 'update']);
        Route::delete('/{id}', [MyReportController::class, 'destroy']);
        Route::post('/{id}/reunited', [MyReportController::class, 'markReunited']);
    });

    // Possible Matches Engine
    Route::get('/matches', [MatchController::class, 'index']);

    // Community Sightings
    Route::post('/sightings', [SightingController::class, 'store']);

    // Direct Messaging
    Route::get('/conversations', [MessageController::class, 'conversations']);
    Route::post('/conversations/start', [MessageController::class, 'startConversation']);
    Route::get('/conversations/{id}/messages', [MessageController::class, 'messages']);
    Route::post('/conversations/{id}/messages', [MessageController::class, 'sendMessage']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);

    // Dashboard & Profile
    Route::get('/dashboard/stats', [UserProfileController::class, 'dashboardStats']);
    Route::put('/user/profile', [UserProfileController::class, 'updateProfile']);
    Route::post('/user/change-password', [UserProfileController::class, 'changePassword']);
    Route::post('/user/avatar', [UserProfileController::class, 'updateAvatar']);

    // User Management
    Route::get('/users', [UserProfileController::class, 'users']);
    Route::post('/users/{id}/toggle-status', [UserProfileController::class, 'toggleUserStatus']);
});
