<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sightings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pet_report_id')->constrained('pet_reports')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('state_region_id')->constrained('states_regions')->cascadeOnDelete();
            $table->foreignId('township_id')->constrained('cities_townships')->cascadeOnDelete();
            $table->date('sighting_date');
            $table->string('sighting_time')->nullable();
            $table->string('location_details');
            $table->text('witness_notes')->nullable();
            $table->enum('status', ['pending', 'approved'])->default('approved');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sightings');
    }
};
