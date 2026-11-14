<?php

namespace Tests\Feature;

use App\Models\CityTownship;
use App\Models\Complaint;
use App\Models\PetCategory;
use App\Models\PetReport;
use App\Models\StateRegion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dashboard_returns_live_database_metrics(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $reporter = User::factory()->create();
        $category = PetCategory::create(['name' => 'Dog', 'slug' => 'dog']);
        $region = StateRegion::create(['name' => 'Yangon Region']);
        $township = CityTownship::create([
            'state_region_id' => $region->id,
            'name' => 'Kamayut Township',
        ]);

        PetReport::create([
            'user_id' => $reporter->id,
            'category_id' => $category->id,
            'type' => 'lost',
            'pet_name' => 'Milo',
            'event_date' => now()->toDateString(),
            'state_region_id' => $region->id,
            'township_id' => $township->id,
            'contact_name' => $reporter->name,
            'contact_phone' => '0912345678',
            'status' => 'pending',
        ]);

        Complaint::create([
            'user_id' => $reporter->id,
            'subject' => 'Test complaint',
            'description' => 'A test complaint for the dashboard.',
        ]);

        $response = $this->actingAs($admin)->getJson('/api/admin/dashboard-stats');

        $response->assertOk()
            ->assertJsonPath('data.totals.total_users', 2)
            ->assertJsonPath('data.totals.lost_reports', 1)
            ->assertJsonPath('data.totals.pending_reports', 1)
            ->assertJsonPath('data.totals.active_complaints', 1)
            ->assertJsonPath('data.pet_categories.0.name', 'Dog')
            ->assertJsonPath('data.pet_categories.0.value', 1);

        $this->assertContains([
            'month' => now()->format('M'),
            'Lost' => 1,
            'Found' => 0,
            'Reunited' => 0,
        ], $response->json('data.monthly_activity'));
    }

    public function test_non_admin_users_cannot_access_admin_dashboard_metrics(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($user)
            ->getJson('/api/admin/dashboard-stats')
            ->assertForbidden();
    }
}
