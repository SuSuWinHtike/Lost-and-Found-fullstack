<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CityTownship;
use App\Models\Color;
use App\Models\PetCategory;
use App\Models\StateRegion;
use Illuminate\Http\JsonResponse;

class MetadataController extends Controller
{
    public function locations(): JsonResponse
    {
        $regions = StateRegion::with('townships')->orderBy('name')->get();

        return response()->json([
            'status' => 'success',
            'data' => $regions,
        ]);
    }

    public function categories(): JsonResponse
    {
        $categories = PetCategory::with('breeds')->get();

        return response()->json([
            'status' => 'success',
            'data' => $categories,
        ]);
    }

    public function colors(): JsonResponse
    {
        $colors = Color::orderBy('name')->get();

        return response()->json([
            'status' => 'success',
            'data' => $colors,
        ]);
    }
}
