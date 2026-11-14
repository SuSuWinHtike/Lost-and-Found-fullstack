<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PetReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminPetReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return $this->adminAccessDenied();
        }

        $validated = $request->validate([
            'type' => ['required', Rule::in(['lost', 'found'])],
        ]);

        $reports = PetReport::with([
            'user',
            'category',
            'breed',
            'color',
            'stateRegion',
            'township',
            'images',
        ])
            ->where('type', $validated['type'])
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $reports,
        ]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return $this->adminAccessDenied();
        }

        $validated = $request->validate([
            'status' => ['required', Rule::in(['approved', 'rejected'])],
        ]);

        $report = PetReport::findOrFail($id);
        $report->update(['status' => $validated['status']]);

        return response()->json([
            'status' => 'success',
            'message' => 'Pet report status updated.',
            'data' => $report->load([
                'user',
                'category',
                'breed',
                'color',
                'stateRegion',
                'township',
                'images',
            ]),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return $this->adminAccessDenied();
        }

        PetReport::findOrFail($id)->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Pet report removed.',
        ]);
    }

    private function adminAccessDenied(): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'message' => 'Administrator access is required.',
        ], 403);
    }
}
