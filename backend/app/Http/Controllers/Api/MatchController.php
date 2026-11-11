<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PetReport;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MatchController extends Controller
{
    /**
     * Compute and return dynamic weighted matches for the authenticated user's reports
     * or for all active lost vs found reports.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Retrieve active lost pets submitted by the authenticated user
        $userLostPets = PetReport::with(['category', 'breed', 'color', 'stateRegion', 'township', 'images', 'user'])
            ->where('user_id', $user->id)
            ->where('type', 'lost')
            ->whereIn('status', ['approved', 'pending'])
            ->get();

        $userFoundPetsCount = PetReport::where('user_id', $user->id)
            ->where('type', 'found')
            ->count();

        // If user has not posted any lost reports, return empty list with contextual metadata
        if ($userLostPets->isEmpty()) {
            return response()->json([
                'status' => 'success',
                'has_user_lost_reports' => false,
                'has_user_found_reports' => $userFoundPetsCount > 0,
                'total_lost_reports' => 0,
                'total_matches' => 0,
                'data' => [],
            ]);
        }

        // Retrieve all approved found pets in the system
        $foundPets = PetReport::with(['category', 'breed', 'color', 'stateRegion', 'township', 'images', 'user'])
            ->where('type', 'found')
            ->where('status', 'approved')
            ->get();

        $matches = [];

        foreach ($userLostPets as $lost) {
            foreach ($foundPets as $found) {
                // Must not be the same user and must never compare same types
                if ($lost->id === $found->id || $lost->type === $found->type) {
                    continue;
                }

                // Weighted matching calculation:
                // Total possible weight: 100 points
                // 1. Species / Category: 25 points (Mandatory: if species doesn't match, score is 0)
                if ($lost->category_id !== $found->category_id) {
                    continue;
                }
                $score = 25.0;
                $matchingAttributes = ['Species / Animal Type'];
                $differences = [];

                // 2. Breed: 25 points
                if ($lost->breed_id && $found->breed_id && $lost->breed_id === $found->breed_id) {
                    $score += 25.0;
                    $matchingAttributes[] = 'Breed (' . ($lost->breed->name ?? 'Matched') . ')';
                } elseif (! $lost->breed_id || ! $found->breed_id) {
                    // One is unspecified, award partial points
                    $score += 10.0;
                    $matchingAttributes[] = 'Breed (Likely Match)';
                } else {
                    $differences[] = 'Different Breed';
                }

                // 3. Dominant Color: 20 points
                if ($lost->color_id && $found->color_id && $lost->color_id === $found->color_id) {
                    $score += 20.0;
                    $matchingAttributes[] = 'Color (' . ($lost->color->name ?? 'Matched') . ')';
                } elseif ($lost->color && $found->color && stripos($lost->color->name, $found->color->name) !== false) {
                    $score += 15.0;
                    $matchingAttributes[] = 'Color shade match';
                } else {
                    $differences[] = 'Color variation';
                }

                // 4. Geographic Location (Region & Township): 20 points
                if ($lost->state_region_id === $found->state_region_id) {
                    if ($lost->township_id === $found->township_id) {
                        $score += 20.0;
                        $matchingAttributes[] = 'Same Township (' . ($lost->township->name ?? '') . ')';
                    } else {
                        $score += 10.0;
                        $matchingAttributes[] = 'Same Region (' . ($lost->stateRegion->name ?? '') . ')';
                        $differences[] = 'Different Township';
                    }
                } else {
                    $differences[] = 'Different Region';
                }

                // 5. Gender Proximity: 5 points
                if ($lost->gender === $found->gender && $lost->gender !== 'unknown') {
                    $score += 5.0;
                    $matchingAttributes[] = 'Gender (' . ucfirst($lost->gender) . ')';
                } elseif ($lost->gender === 'unknown' || $found->gender === 'unknown') {
                    $score += 2.5;
                } else {
                    $differences[] = 'Different Gender';
                }

                // 6. Date Proximity: 5 points (Found date is on or after lost date)
                $lostDate = Carbon::parse($lost->event_date);
                $foundDate = Carbon::parse($found->event_date);
                if ($foundDate->greaterThanOrEqualTo($lostDate)) {
                    $diffDays = $lostDate->diffInDays($foundDate);
                    if ($diffDays <= 7) {
                        $score += 5.0;
                        $matchingAttributes[] = 'Found within 7 days of disappearance';
                    } elseif ($diffDays <= 30) {
                        $score += 3.0;
                        $matchingAttributes[] = 'Found within 1 month';
                    }
                }

                // Only include if match score is >= 50%
                if ($score >= 50.0) {
                    $matches[] = [
                        'id' => "m_{$lost->id}_{$found->id}",
                        'confidence_score' => round($score, 1),
                        'matching_attributes' => $matchingAttributes,
                        'differences' => $differences,
                        'lost_pet' => $lost,
                        'found_pet' => $found,
                    ];
                }
            }
        }

        // Sort descending by highest confidence score
        usort($matches, fn ($a, $b) => $b['confidence_score'] <=> $a['confidence_score']);

        return response()->json([
            'status' => 'success',
            'has_user_lost_reports' => true,
            'has_user_found_reports' => $userFoundPetsCount > 0,
            'total_lost_reports' => $userLostPets->count(),
            'total_matches' => count($matches),
            'data' => $matches,
        ]);
    }
}
