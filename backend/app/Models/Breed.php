<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Breed extends Model
{
    use HasFactory;

    protected $fillable = ['category_id', 'name', 'slug'];

    public function category(): BelongsTo
    {
        return $this->belongsTo(PetCategory::class, 'category_id');
    }

    public function petReports(): HasMany
    {
        return $this->hasMany(PetReport::class);
    }
}
