<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pet_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('pet_categories')->cascadeOnDelete();
            $table->foreignId('breed_id')->nullable()->constrained('breeds')->nullOnDelete();
            $table->foreignId('color_id')->nullable()->constrained('colors')->nullOnDelete();
            $table->string('secondary_color')->nullable();
            $table->enum('type', ['lost', 'found'])->index();
            $table->string('pet_name')->nullable();
            $table->string('age')->nullable();
            $table->enum('gender', ['male', 'female', 'unknown'])->default('unknown');
            $table->string('collar_description')->nullable();
            $table->string('microchip_id')->nullable();
            $table->date('event_date')->index();
            $table->string('event_time')->nullable();
            $table->foreignId('state_region_id')->constrained('states_regions')->cascadeOnDelete();
            $table->foreignId('township_id')->constrained('cities_townships')->cascadeOnDelete();
            $table->string('last_seen_or_found_location')->nullable();
            $table->text('description')->nullable();
            $table->string('reward_amount')->nullable();
            $table->string('physical_condition')->nullable();
            $table->string('safe_holding_location')->nullable();
            $table->string('contact_name');
            $table->string('contact_phone');
            $table->enum('status', ['pending', 'approved', 'rejected', 'reunited'])->default('pending')->index();
            $table->text('rejection_reason')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pet_reports');
    }
};
