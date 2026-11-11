<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Favorite extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'pet_report_id'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function petReport(): BelongsTo
    {
        return $this->belongsTo(PetReport::class, 'pet_report_id');
    }
}
