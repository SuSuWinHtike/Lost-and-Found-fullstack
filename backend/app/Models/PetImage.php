<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PetImage extends Model
{
    use HasFactory;

    protected $table = 'pet_images';

    protected $fillable = ['pet_report_id', 'image_path', 'is_primary'];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    public function petReport(): BelongsTo
    {
        return $this->belongsTo(PetReport::class, 'pet_report_id');
    }
}
