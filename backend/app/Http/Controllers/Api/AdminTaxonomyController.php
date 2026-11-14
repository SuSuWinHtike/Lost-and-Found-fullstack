<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Breed;
use App\Models\Color;
use App\Models\PetCategory;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminTaxonomyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return $this->adminAccessDenied();
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'categories' => PetCategory::with(['breeds' => fn ($query) => $query->orderBy('name')])
                    ->orderBy('name')
                    ->get(),
                'colors' => Color::orderBy('name')->get(),
            ],
        ]);
    }

    public function storeCategory(Request $request): JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return $this->adminAccessDenied();
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:pet_categories,name'],
            'icon' => ['nullable', 'string', 'max:255'],
        ]);

        $slug = Str::slug($validated['name']);
        if ($slug === '') {
            $slug = 'category-'.Str::lower(Str::random(8));
        }

        if (PetCategory::where('slug', $slug)->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'A pet type with a similar name already exists.',
            ], 422);
        }

        $category = PetCategory::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'icon' => $validated['icon'] ?? 'paw-print',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Pet type added successfully.',
            'data' => $category->load('breeds'),
        ], 201);
    }

    public function storeBreed(Request $request): JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return $this->adminAccessDenied();
        }

        $validated = $request->validate([
            'category_id' => ['required', 'integer', 'exists:pet_categories,id'],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('breeds', 'name')->where(
                    fn (Builder $query) => $query->where('category_id', $request->input('category_id'))
                ),
            ],
        ]);

        $breed = Breed::create([
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']) ?: 'breed-'.Str::lower(Str::random(8)),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Breed added successfully.',
            'data' => $breed->load('category'),
        ], 201);
    }

    public function destroyBreed(Request $request, int $id): JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return $this->adminAccessDenied();
        }

        Breed::findOrFail($id)->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Breed removed. Existing reports are preserved.',
        ]);
    }

    public function storeColor(Request $request): JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return $this->adminAccessDenied();
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:colors,name'],
            'hex_code' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        $color = Color::create([
            'name' => $validated['name'],
            'hex_code' => $validated['hex_code'] ?? null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Pet colour added successfully.',
            'data' => $color,
        ], 201);
    }

    public function destroyColor(Request $request, int $id): JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return $this->adminAccessDenied();
        }

        Color::findOrFail($id)->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Pet colour removed. Existing reports are preserved.',
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
