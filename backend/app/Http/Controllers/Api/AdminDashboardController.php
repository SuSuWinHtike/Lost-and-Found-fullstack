<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\PetCategory;
use App\Models\PetReport;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class AdminDashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Administrator access is required.',
            ], 403);
        }

        $now = now();
        $monthStart = $now->copy()->startOfMonth()->subMonths(5);
        $monthKeys = collect(range(0, 5))
            ->map(fn (int $offset) => $monthStart->copy()->addMonths($offset)->format('Y-m'));

        $monthlyActivity = $monthKeys->mapWithKeys(fn (string $key) => [
            $key => ['Lost' => 0, 'Found' => 0, 'Reunited' => 0],
        ])->all();

        $reports = PetReport::query()
            ->where(function ($query) use ($monthStart) {
                $query->where('created_at', '>=', $monthStart)
                    ->orWhere(function ($query) use ($monthStart) {
                        $query->where('status', 'reunited')
                            ->where('updated_at', '>=', $monthStart);
                    });
            })
            ->get(['type', 'status', 'created_at', 'updated_at']);

        foreach ($reports as $report) {
            $createdMonth = Carbon::parse($report->created_at)->format('Y-m');
            if (isset($monthlyActivity[$createdMonth])) {
                $monthlyActivity[$createdMonth][ucfirst($report->type)]++;
            }

            if ($report->status === 'reunited') {
                $reunitedMonth = Carbon::parse($report->updated_at)->format('Y-m');
                if (isset($monthlyActivity[$reunitedMonth])) {
                    $monthlyActivity[$reunitedMonth]['Reunited']++;
                }
            }
        }

        $recentActivities = $this->recentActivities();

        return response()->json([
            'status' => 'success',
            'data' => [
                'totals' => [
                    'total_users' => User::query()->count(),
                    'users_this_month' => User::query()
                        ->where('created_at', '>=', $now->copy()->startOfMonth())
                        ->count(),
                    'lost_reports' => PetReport::query()->where('type', 'lost')->count(),
                    'found_reports' => PetReport::query()->where('type', 'found')->count(),
                    'reunited_pets' => PetReport::query()->where('status', 'reunited')->count(),
                    'pending_reports' => PetReport::query()->where('status', 'pending')->count(),
                    'active_complaints' => Complaint::query()
                        ->whereIn('status', ['pending', 'in_review'])
                        ->count(),
                ],
                'monthly_activity' => $monthKeys->map(fn (string $key) => [
                    'month' => Carbon::createFromFormat('Y-m', $key)->format('M'),
                    ...$monthlyActivity[$key],
                ])->values(),
                'pet_categories' => PetCategory::query()
                    ->select(['id', 'name'])
                    ->withCount('petReports')
                    ->orderByDesc('pet_reports_count')
                    ->get()
                    ->map(fn (PetCategory $category) => [
                        'name' => $category->name,
                        'value' => $category->pet_reports_count,
                    ])
                    ->values(),
                'recent_activities' => $recentActivities,
            ],
        ]);
    }

    private function recentActivities(): Collection
    {
        $activities = collect();

        PetReport::query()->latest()->limit(8)->get(['id', 'pet_name', 'type', 'created_at'])
            ->each(fn (PetReport $report) => $activities->push([
                'id' => "report-{$report->id}",
                'action' => 'Pet report submitted',
                'target' => $report->pet_name ?: ucfirst($report->type).' pet report',
                'created_at' => $report->created_at,
                'type' => 'report',
            ]));

        User::query()->latest()->limit(8)->get(['id', 'name', 'created_at'])
            ->each(fn (User $user) => $activities->push([
                'id' => "user-{$user->id}",
                'action' => 'User registered',
                'target' => $user->name,
                'created_at' => $user->created_at,
                'type' => 'user',
            ]));

        Complaint::query()->latest()->limit(8)->get(['id', 'subject', 'created_at'])
            ->each(fn (Complaint $complaint) => $activities->push([
                'id' => "complaint-{$complaint->id}",
                'action' => 'Complaint filed',
                'target' => $complaint->subject,
                'created_at' => $complaint->created_at,
                'type' => 'complaint',
            ]));

        return $activities
            ->sortByDesc('created_at')
            ->take(8)
            ->values()
            ->map(fn (array $activity) => [
                'id' => $activity['id'],
                'action' => $activity['action'],
                'target' => $activity['target'],
                'time' => Carbon::parse($activity['created_at'])->diffForHumans(),
                'type' => $activity['type'],
            ]);
    }
}
