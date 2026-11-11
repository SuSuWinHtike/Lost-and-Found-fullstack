<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PetMatch extends Model
{
    use HasFactory;

    protected $table = 'pet_matches';

    protected $fillable = [
        'lost_report_id',
        'found_report_id',
        'confidence_score',
        'matching_attributes',
        'status',
    ];

    protected $casts = [
        'confidence_score' => 'float',
        'matching_attributes' => 'array',
    ];

    public function lostReport(): BelongsTo
    {
        return $this->belongsTo(PetReport::class, 'lost_report_id');
    }

    public function foundReport(): BelongsTo
    {
        return $this->belongsTo(PetReport::class, 'found_report_id');
    }
}
