<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cities_townships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('state_region_id')->constrained('states_regions')->cascadeOnDelete();
            $table->string('name');
            $table->string('postal_code')->nullable();
            $table->timestamps();

            $table->unique(['state_region_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cities_townships');
    }
};
