<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SightingImage extends Model
{
    use HasFactory;

    protected $table = 'sighting_images';

    protected $fillable = ['sighting_id', 'image_path'];

    public function sighting(): BelongsTo
    {
        return $this->belongsTo(Sighting::class, 'sighting_id');
    }
}
