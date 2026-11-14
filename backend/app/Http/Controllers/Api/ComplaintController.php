<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\PetReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ComplaintController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pet_report_id' => ['required', 'integer', 'exists:pet_reports,id'],
            'subject' => [
                'required',
                Rule::in([
                    'Fraud or scam',
                    'Harassment or inappropriate contact',
                    'Spam or misleading information',
                    'Inaccurate pet information',
                    'Other',
                ]),
            ],
            'description' => ['required', 'string', 'min:10', 'max:5000'],
        ]);

        $report = PetReport::findOrFail($validated['pet_report_id']);
        if ((int) $report->user_id === (int) $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'You cannot report your own pet listing.',
            ], 422);
        }

        $complaint = Complaint::create([
            'user_id' => $request->user()->id,
            'pet_report_id' => $report->id,
            'reported_user_id' => $report->user_id,
            'subject' => $validated['subject'],
            'description' => $validated['description'],
            'status' => 'pending',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Your complaint has been sent to the moderation team.',
            'data' => $complaint,
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return $this->adminAccessDenied();
        }

        return response()->json([
            'status' => 'success',
            'data' => Complaint::with(['user', 'reportedUser', 'petReport'])->latest()->get(),
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return $this->adminAccessDenied();
        }

        $validated = $request->validate([
            'status' => ['required', Rule::in(['in_review', 'resolved', 'dismissed'])],
            'admin_notes' => [
                Rule::requiredIf(in_array($request->input('status'), ['resolved', 'dismissed'], true)),
                'nullable',
                'string',
                'max:5000',
            ],
        ]);

        $complaint = Complaint::findOrFail($id);
        $complaint->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Complaint case updated.',
            'data' => $complaint->load(['user', 'reportedUser', 'petReport']),
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