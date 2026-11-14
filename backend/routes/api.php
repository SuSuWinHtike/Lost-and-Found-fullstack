<?php

use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AdminPetReportController;
use App\Http\Controllers\Api\AdminTaxonomyController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ComplaintController;
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
    Route::post('/complaints', [ComplaintController::class, 'store']);

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
    Route::get('/admin/dashboard-stats', [AdminDashboardController::class, 'index']);
    Route::put('/user/profile', [UserProfileController::class, 'updateProfile']);
    Route::post('/user/change-password', [UserProfileController::class, 'changePassword']);
    Route::post('/user/avatar', [UserProfileController::class, 'updateAvatar']);

    // User Management
    Route::get('/users', [UserProfileController::class, 'users']);
    Route::put('/users/{id}', [UserProfileController::class, 'updateUser']);
    Route::post('/users/{id}/toggle-status', [UserProfileController::class, 'toggleUserStatus']);

    // Admin Pet Report Moderation
    Route::get('/admin/pet-reports', [AdminPetReportController::class, 'index']);
    Route::patch('/admin/pet-reports/{id}/status', [AdminPetReportController::class, 'updateStatus']);
    Route::delete('/admin/pet-reports/{id}', [AdminPetReportController::class, 'destroy']);

    // Complaint Management
    Route::get('/admin/complaints', [ComplaintController::class, 'index']);
    Route::patch('/admin/complaints/{id}', [ComplaintController::class, 'update']);

    // Taxonomy Management
    Route::get('/admin/taxonomies', [AdminTaxonomyController::class, 'index']);
    Route::post('/admin/pet-categories', [AdminTaxonomyController::class, 'storeCategory']);
    Route::post('/admin/breeds', [AdminTaxonomyController::class, 'storeBreed']);
    Route::delete('/admin/breeds/{id}', [AdminTaxonomyController::class, 'destroyBreed']);
    Route::post('/admin/colors', [AdminTaxonomyController::class, 'storeColor']);
    Route::delete('/admin/colors/{id}', [AdminTaxonomyController::class, 'destroyColor']);
});
