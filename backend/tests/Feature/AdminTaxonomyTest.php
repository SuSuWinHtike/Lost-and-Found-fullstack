<?php

namespace Tests\Feature;

use App\Models\Breed;
use App\Models\CityTownship;
use App\Models\Color;
use App\Models\PetCategory;
use App\Models\PetReport;
use App\Models\StateRegion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTaxonomyTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_and_list_pet_types_breeds_and_colours(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $categoryResponse = $this->actingAs($admin)
            ->postJson('/api/admin/pet-categories', ['name' => 'Rabbit'])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Rabbit');

        $categoryId = $categoryResponse->json('data.id');

        $this->postJson('/api/admin/breeds', [
            'category_id' => $categoryId,
            'name' => 'Holland Lop',
        ])->assertCreated()
            ->assertJsonPath('data.name', 'Holland Lop');

        $this->postJson('/api/admin/colors', [
            'name' => 'Silver',
            'hex_code' => '#AABBCC',
        ])->assertCreated()
            ->assertJsonPath('data.hex_code', '#AABBCC');

        $this->getJson('/api/admin/taxonomies')
            ->assertOk()
            ->assertJsonPath('data.categories.0.name', 'Rabbit')
            ->assertJsonPath('data.categories.0.breeds.0.name', 'Holland Lop')
            ->assertJsonPath('data.colors.0.name', 'Silver');
    }

    public function test_non_admin_cannot_read_or_change_taxonomies(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($user)
            ->getJson('/api/admin/taxonomies')
            ->assertForbidden();

        $this->postJson('/api/admin/pet-categories', ['name' => 'Rabbit'])
            ->assertForbidden();
    }

    public function test_removing_a_breed_or_colour_preserves_reports(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $reporter = User::factory()->create();
        $category = PetCategory::create(['name' => 'Dog', 'slug' => 'dog']);
        $breed = Breed::create([
            'category_id' => $category->id,
            'name' => 'Beagle',
            'slug' => 'beagle',
        ]);
        $color = Color::create(['name' => 'Brown', 'hex_code' => '#654321']);
        $region = StateRegion::create(['name' => 'Yangon Region']);
        $township = CityTownship::create([
            'state_region_id' => $region->id,
            'name' => 'Kamayut Township',
        ]);
        $report = PetReport::create([
            'user_id' => $reporter->id,
            'category_id' => $category->id,
            'breed_id' => $breed->id,
            'color_id' => $color->id,
            'type' => 'lost',
            'event_date' => now()->toDateString(),
            'state_region_id' => $region->id,
            'township_id' => $township->id,
            'contact_name' => $reporter->name,
            'contact_phone' => '0912345678',
        ]);

        $this->actingAs($admin)
            ->deleteJson("/api/admin/breeds/{$breed->id}")
            ->assertOk();
        $this->deleteJson("/api/admin/colors/{$color->id}")
            ->assertOk();

        $this->assertDatabaseMissing('breeds', ['id' => $breed->id]);
        $this->assertDatabaseMissing('colors', ['id' => $color->id]);
        $this->assertDatabaseHas('pet_reports', [
            'id' => $report->id,
            'breed_id' => null,
            'color_id' => null,
        ]);
    }
}
