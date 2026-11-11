<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CityTownship extends Model
{
    use HasFactory;

    protected $table = 'cities_townships';

    protected $fillable = ['state_region_id', 'name', 'postal_code'];

    public function stateRegion(): BelongsTo
    {
        return $this->belongsTo(StateRegion::class, 'state_region_id');
    }

    public function petReports(): HasMany
    {
        return $this->hasMany(PetReport::class, 'township_id');
    }
}
