<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use App\Models\PetImage;
use App\Models\PetReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PetReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = auth('sanctum')->id();
        $query = PetReport::with(['user', 'category', 'breed', 'color', 'stateRegion', 'township', 'images'])
            ->whereIn('status', ['approved', 'reunited', 'pending']);

        // Type filter: lost, found, or all
        if ($request->filled('type') && in_array($request->type, ['lost', 'found'])) {
            $query->where('type', $request->type);
        }

        // Species/Category filter
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        } elseif ($request->filled('species')) {
            $speciesName = ucfirst(strtolower($request->species));
            $query->whereHas('category', function ($q) use ($speciesName) {
                $q->where('name', $speciesName);
            });
        }

        // Breed filter
        if ($request->filled('breed_id')) {
            $query->where('breed_id', $request->breed_id);
        } elseif ($request->filled('breed')) {
            $breedName = $request->breed;
            $query->whereHas('breed', function ($q) use ($breedName) {
                $q->where('name', 'like', "%{$breedName}%");
            });
        }

        // Color filter
        if ($request->filled('color_id')) {
            $query->where('color_id', $request->color_id);
        } elseif ($request->filled('color') || $request->filled('colour')) {
            $colorName = $request->color ?: $request->colour;
            $firstWord = trim(explode('/', explode('&', $colorName)[0])[0]);
            $query->where(function ($cq) use ($firstWord, $colorName) {
                $cq->whereHas('color', function ($q) use ($firstWord, $colorName) {
                    $q->where('name', 'like', "%{$colorName}%")
                      ->orWhere('name', 'like', "%{$firstWord}%");
                })->orWhere('secondary_color', 'like', "%{$firstWord}%");
            });
        }

        // State / Region filter
        if ($request->filled('state_region_id')) {
            $query->where('state_region_id', $request->state_region_id);
        } elseif ($request->filled('state_region')) {
            $query->whereHas('stateRegion', function ($q) use ($request) {
                $q->where('name', $request->state_region);
            });
        }

        // Township filter
        if ($request->filled('township_id')) {
            $query->where('township_id', $request->township_id);
        } elseif ($request->filled('township')) {
            $query->whereHas('township', function ($q) use ($request) {
                $q->where('name', $request->township);
            });
        }

        // Keyword search
        if ($request->filled('search')) {
            $keyword = trim($request->search);
            $query->where(function ($q) use ($keyword) {
                $q->where('pet_name', 'like', "%{$keyword}%")
                    ->orWhere('description', 'like', "%{$keyword}%")
                    ->orWhere('last_seen_or_found_location', 'like', "%{$keyword}%")
                    ->orWhereHas('breed', function ($bq) use ($keyword) {
                        $bq->where('name', 'like', "%{$keyword}%");
                    })
                    ->orWhereHas('township', function ($tq) use ($keyword) {
                        $tq->where('name', 'like', "%{$keyword}%");
                    });
            });
        }

        // Reward filter
        if ($request->boolean('has_reward')) {
            $query->whereNotNull('reward_amount')->where('reward_amount', '!=', '');
        }

        // Date filter
        if ($request->filled('date_from')) {
            $query->whereDate('event_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('event_date', '<=', $request->date_to);
        }

        // Sorting
        $sort = $request->get('sort', 'newest');
        switch ($sort) {
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'reward_high':
                $query->orderByRaw('CAST(REPLACE(REPLACE(reward_amount, ",", ""), " MMK", "") AS UNSIGNED) DESC');
                break;
            case 'newest':
            default:
                $query->orderBy('is_featured', 'desc')->orderBy('created_at', 'desc');
                break;
        }

        $perPage = $request->get('per_page', 12);
        $reports = $query->paginate($perPage);

        // Attach favorited state for authenticated user if available
        $userId = auth('sanctum')->id();
        $favoriteIds = [];
        if ($userId) {
            $favoriteIds = Favorite::where('user_id', $userId)->pluck('pet_report_id')->toArray();
        }

        $reports->getCollection()->transform(function ($report) use ($favoriteIds) {
            $report->is_favorited = in_array($report->id, $favoriteIds);
            return $report;
        });

        return response()->json([
            'status' => 'success',
            'data' => $reports->items(),
            'pagination' => [
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
                'per_page' => $reports->perPage(),
                'total' => $reports->total(),
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $report = PetReport::with([
            'user',
            'category',
            'breed',
            'color',
            'stateRegion',
            'township',
            'images',
            'sightings' => function ($q) {
                $q->with(['stateRegion', 'township', 'images', 'user'])->where('status', 'approved')->latest();
            },
        ])->find($id);

        if (! $report) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pet report not found.',
            ], 404);
        }

        $userId = auth('sanctum')->id();
        $report->is_favorited = $userId ? Favorite::where('user_id', $userId)->where('pet_report_id', $report->id)->exists() : false;

        return response()->json([
            'status' => 'success',
            'data' => $report,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        // Auto-resolve category_id from category name if needed
        if (!$request->filled('category_id') && ($request->filled('pet_type') || $request->filled('category') || $request->filled('species'))) {
            $val = $request->pet_type ?: ($request->category ?: $request->species);
            $catId = \App\Models\PetCategory::where('name', 'like', "%{$val}%")->orWhere('slug', strtolower($val))->value('id');
            if ($catId) $request->merge(['category_id' => $catId]);
        }
        if (!$request->filled('category_id')) {
            $request->merge(['category_id' => 1]);
        }

        // Auto-resolve breed_id from breed name if needed
        if (!$request->filled('breed_id') && $request->filled('breed')) {
            $bId = \App\Models\Breed::where('name', $request->breed)->value('id');
            if (!$bId && $request->breed) {
                $newB = \App\Models\Breed::firstOrCreate(
                    ['name' => $request->breed, 'category_id' => $request->category_id],
                    ['slug' => \Illuminate\Support\Str::slug($request->breed)]
                );
                $bId = $newB->id;
            }
            if ($bId) $request->merge(['breed_id' => $bId]);
        }

        // Auto-resolve color_id from color name if needed
        if (!$request->filled('color_id') && ($request->filled('colour') || $request->filled('color'))) {
            $cName = $request->colour ?: $request->color;
            $cId = \App\Models\Color::where('name', 'like', "%{$cName}%")->value('id');
            if (!$cId && $cName) {
                $newC = \App\Models\Color::firstOrCreate(['name' => $cName]);
                $cId = $newC->id;
            }
            if ($cId) $request->merge(['color_id' => $cId]);
        }

        // Auto-resolve state_region_id
        if (!$request->filled('state_region_id') && ($request->filled('state_region') || $request->filled('region'))) {
            $rName = $request->state_region ?: $request->region;
            $rId = \App\Models\StateRegion::where('name', 'like', "%{$rName}%")->value('id');
            if ($rId) $request->merge(['state_region_id' => $rId]);
        }
        if (!$request->filled('state_region_id')) {
            $request->merge(['state_region_id' => 1]);
        }

        // Auto-resolve township_id
        if (!$request->filled('township_id') && $request->filled('township')) {
            $tName = $request->township;
            $tId = \App\Models\CityTownship::where('name', 'like', "%{$tName}%")->value('id');
            if ($tId) $request->merge(['township_id' => $tId]);
        }
        if (!$request->filled('township_id')) {
            $tId = \App\Models\CityTownship::where('state_region_id', $request->state_region_id)->value('id') ?: 1;
            $request->merge(['township_id' => $tId]);
        }

        // Format gender to lowercase
        if ($request->filled('gender')) {
            $request->merge(['gender' => strtolower($request->gender)]);
        }

        $validated = $request->validate([
            'type' => ['required', 'in:lost,found'],
            'category_id' => ['required', 'exists:pet_categories,id'],
            'breed_id' => ['nullable', 'exists:breeds,id'],
            'color_id' => ['nullable', 'exists:colors,id'],
            'secondary_color' => ['nullable', 'string', 'max:255'],
            'pet_name' => ['nullable', 'string', 'max:255'],
            'age' => ['nullable', 'string', 'max:100'],
            'gender' => ['required', 'in:male,female,unknown'],
            'collar_description' => ['nullable', 'string', 'max:255'],
            'microchip_id' => ['nullable', 'string', 'max:255'],
            'event_date' => ['required', 'date'],
            'event_time' => ['nullable', 'string', 'max:50'],
            'state_region_id' => ['required', 'exists:states_regions,id'],
            'township_id' => ['required', 'exists:cities_townships,id'],
            'last_seen_or_found_location' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'reward_amount' => ['nullable', 'string', 'max:100'],
            'physical_condition' => ['nullable', 'string', 'max:255'],
            'safe_holding_location' => ['nullable', 'string', 'max:255'],
            'contact_name' => ['required', 'string', 'max:255'],
            'contact_phone' => ['required', 'string', 'max:50'],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['file', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ]);

        return DB::transaction(function () use ($request, $validated) {
            $user = $request->user();

            $report = PetReport::create([
                'user_id' => $user->id,
                'category_id' => $validated['category_id'],
                'breed_id' => $validated['breed_id'] ?? null,
                'color_id' => $validated['color_id'] ?? null,
                'secondary_color' => $validated['secondary_color'] ?? null,
                'type' => $validated['type'],
                'pet_name' => $validated['pet_name'] ?? ($validated['type'] === 'found' ? 'Unknown / Rescued' : null),
                'age' => $validated['age'] ?? null,
                'gender' => $validated['gender'],
                'collar_description' => $validated['collar_description'] ?? null,
                'microchip_id' => $validated['microchip_id'] ?? null,
                'event_date' => $validated['event_date'],
                'event_time' => $validated['event_time'] ?? null,
                'state_region_id' => $validated['state_region_id'],
                'township_id' => $validated['township_id'],
                'last_seen_or_found_location' => $validated['last_seen_or_found_location'] ?? null,
                'description' => $validated['description'] ?? null,
                'reward_amount' => $validated['reward_amount'] ?? null,
                'physical_condition' => $validated['physical_condition'] ?? null,
                'safe_holding_location' => $validated['safe_holding_location'] ?? null,
                'contact_name' => $validated['contact_name'],
                'contact_phone' => $validated['contact_phone'],
                'status' => 'approved', // Auto-approved so it is immediately visible in Pet Reports
                'is_featured' => false,
            ]);

            // Handle image uploads
            if ($request->hasFile('images')) {
                $isFirst = true;
                foreach ($request->file('images') as $file) {
                    $path = $file->store('pets', 'public');
                    PetImage::create([
                        'pet_report_id' => $report->id,
                        'image_path' => Storage::url($path),
                        'is_primary' => $isFirst,
                    ]);
                    $isFirst = false;
                }
            } else {
                // If no images uploaded, assign a clean placeholder
                $placeholder = $report->type === 'lost'
                    ? 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'
                    : 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80';
                PetImage::create([
                    'pet_report_id' => $report->id,
                    'image_path' => $placeholder,
                    'is_primary' => true,
                ]);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Your report has been submitted successfully and is currently under review by our moderators.',
                'data' => $report->load(['images', 'category', 'breed', 'color', 'stateRegion', 'township']),
            ], 201);
        });
    }

    public function toggleFavorite(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $report = PetReport::findOrFail($id);

        $fav = Favorite::where('user_id', $user->id)->where('pet_report_id', $report->id)->first();

        if ($fav) {
            $fav->delete();
            $isFavorited = false;
            $message = 'Pet removed from your favorites.';
        } else {
            Favorite::create([
                'user_id' => $user->id,
                'pet_report_id' => $report->id,
            ]);
            $isFavorited = true;
            $message = 'Pet added to your favorites!';
        }

        return response()->json([
            'status' => 'success',
            'message' => $message,
            'is_favorited' => $isFavorited,
        ]);
    }
}
