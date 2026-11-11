<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StateRegion extends Model
{
    use HasFactory;

    protected $table = 'states_regions';

    protected $fillable = ['name', 'code'];

    public function townships(): HasMany
    {
        return $this->hasMany(CityTownship::class, 'state_region_id');
    }

    public function petReports(): HasMany
    {
        return $this->hasMany(PetReport::class, 'state_region_id');
    }
}
