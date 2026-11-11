<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pet_matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lost_report_id')->constrained('pet_reports')->cascadeOnDelete();
            $table->foreignId('found_report_id')->constrained('pet_reports')->cascadeOnDelete();
            $table->decimal('confidence_score', 5, 2);
            $table->json('matching_attributes')->nullable();
            $table->enum('status', ['suggested', 'confirmed', 'dismissed'])->default('suggested');
            $table->timestamps();

            $table->unique(['lost_report_id', 'found_report_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pet_matches');
    }
};
