<?php

namespace Tests\Feature;

use App\Models\CityTownship;
use App\Models\PetCategory;
use App\Models\PetReport;
use App\Models\StateRegion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminPetReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_all_report_statuses_and_moderate_reports(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $reporter = User::factory()->create();
        $pendingReport = $this->createReport($reporter, 'lost', 'pending');
        $rejectedReport = $this->createReport($reporter, 'lost', 'rejected');
        $this->createReport($reporter, 'found', 'approved');

        $this->actingAs($admin)
            ->getJson('/api/admin/pet-reports?type=lost')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment(['id' => $pendingReport->id, 'status' => 'pending'])
            ->assertJsonFragment(['id' => $rejectedReport->id, 'status' => 'rejected']);

        $this->actingAs($admin)
            ->patchJson("/api/admin/pet-reports/{$pendingReport->id}/status", ['status' => 'approved'])
            ->assertOk()
            ->assertJsonPath('data.status', 'approved');

        $this->actingAs($admin)
            ->deleteJson("/api/admin/pet-reports/{$rejectedReport->id}")
            ->assertOk();

        $this->assertDatabaseHas('pet_reports', [
            'id' => $pendingReport->id,
            'status' => 'approved',
        ]);
        $this->assertSoftDeleted('pet_reports', ['id' => $rejectedReport->id]);
    }

    public function test_non_admin_users_cannot_access_admin_report_endpoints(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $report = $this->createReport($user, 'lost', 'pending');

        $this->actingAs($user)
            ->getJson('/api/admin/pet-reports?type=lost')
            ->assertForbidden();

        $this->actingAs($user)
            ->patchJson("/api/admin/pet-reports/{$report->id}/status", ['status' => 'approved'])
            ->assertForbidden();

        $this->actingAs($user)
            ->deleteJson("/api/admin/pet-reports/{$report->id}")
            ->assertForbidden();
    }

    private function createReport(User $user, string $type, string $status): PetReport
    {
        $category = PetCategory::firstOrCreate(
            ['name' => 'Dog'],
            ['slug' => 'dog'],
        );
        $region = StateRegion::firstOrCreate(['name' => 'Yangon Region']);
        $township = CityTownship::firstOrCreate([
            'state_region_id' => $region->id,
            'name' => 'Kamayut Township',
        ]);

        return PetReport::create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'type' => $type,
            'pet_name' => ucfirst($type).' Pet',
            'event_date' => now()->toDateString(),
            'state_region_id' => $region->id,
            'township_id' => $township->id,
            'contact_name' => $user->name,
            'contact_phone' => '0912345678',
            'status' => $status,
        ]);
    }
}
