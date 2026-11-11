<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sighting extends Model
{
    use HasFactory;

    protected $fillable = [
        'pet_report_id',
        'user_id',
        'state_region_id',
        'township_id',
        'sighting_date',
        'sighting_time',
        'location_details',
        'witness_notes',
        'status',
    ];

    protected $casts = [
        'sighting_date' => 'date',
    ];

    public function petReport(): BelongsTo
    {
        return $this->belongsTo(PetReport::class, 'pet_report_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function stateRegion(): BelongsTo
    {
        return $this->belongsTo(StateRegion::class, 'state_region_id');
    }

    public function township(): BelongsTo
    {
        return $this->belongsTo(CityTownship::class, 'township_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(SightingImage::class, 'sighting_id');
    }
}
