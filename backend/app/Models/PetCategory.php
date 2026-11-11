<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PetCategory extends Model
{
    use HasFactory;

    protected $table = 'pet_categories';

    protected $fillable = ['name', 'slug', 'icon'];

    public function breeds(): HasMany
    {
        return $this->hasMany(Breed::class, 'category_id');
    }

    public function petReports(): HasMany
    {
        return $this->hasMany(PetReport::class, 'category_id');
    }
}
