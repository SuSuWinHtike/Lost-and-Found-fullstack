<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PetReport extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'pet_reports';

    protected $fillable = [
        'user_id',
        'category_id',
        'breed_id',
        'color_id',
        'secondary_color',
        'type',
        'pet_name',
        'age',
        'gender',
        'collar_description',
        'microchip_id',
        'event_date',
        'event_time',
        'state_region_id',
        'township_id',
        'last_seen_or_found_location',
        'description',
        'reward_amount',
        'physical_condition',
        'safe_holding_location',
        'contact_name',
        'contact_phone',
        'status',
        'rejection_reason',
        'is_featured',
    ];

    protected $casts = [
        'event_date' => 'date',
        'is_featured' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(PetCategory::class, 'category_id');
    }

    public function breed(): BelongsTo
    {
        return $this->belongsTo(Breed::class, 'breed_id');
    }

    public function color(): BelongsTo
    {
        return $this->belongsTo(Color::class, 'color_id');
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
        return $this->hasMany(PetImage::class, 'pet_report_id');
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class, 'pet_report_id');
    }

    public function sightings(): HasMany
    {
        return $this->hasMany(Sighting::class, 'pet_report_id');
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class, 'pet_report_id');
    }
}
