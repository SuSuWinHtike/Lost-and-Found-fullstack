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

class ComplaintWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_submit_a_complaint_about_another_users_pet_report(): void
    {
        $reporter = User::factory()->create();
        $owner = User::factory()->create();
        $report = $this->createReport($owner);

        $this->actingAs($reporter)
            ->postJson('/api/complaints', [
                'pet_report_id' => $report->id,
                'subject' => 'Fraud or scam',
                'description' => 'This listing contains suspicious payment instructions.',
            ])
            ->assertCreated()
            ->assertJsonPath('data.user_id', $reporter->id)
            ->assertJsonPath('data.reported_user_id', $owner->id)
            ->assertJsonPath('data.pet_report_id', $report->id)
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('complaints', [
            'user_id' => $reporter->id,
            'reported_user_id' => $owner->id,
            'pet_report_id' => $report->id,
            'status' => 'pending',
        ]);
    }

    public function test_users_cannot_complain_about_their_own_post(): void
    {
        $owner = User::factory()->create();
        $report = $this->createReport($owner);

        $this->actingAs($owner)
            ->postJson('/api/complaints', [
                'pet_report_id' => $report->id,
                'subject' => 'Other',
                'description' => 'I want to report my own listing.',
            ])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'You cannot report your own pet listing.');
    }

    public function test_admin_can_review_and_resolve_complaints_but_non_admin_cannot(): void
    {
        $reporter = User::factory()->create();
        $admin = User::factory()->create(['role' => 'admin']);
        $complaint = Complaint::create([
            'user_id' => $reporter->id,
            'subject' => 'Spam or misleading information',
            'description' => 'This report has misleading details.',
        ]);

        $this->actingAs($admin)
            ->getJson('/api/admin/complaints')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->actingAs($admin)
            ->patchJson("/api/admin/complaints/{$complaint->id}", [
                'status' => 'in_review',
                'admin_notes' => 'Review started.',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'in_review');

        $this->actingAs($admin)
            ->patchJson("/api/admin/complaints/{$complaint->id}", [
                'status' => 'resolved',
                'admin_notes' => 'The listing was reviewed and corrected.',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'resolved');

        $this->actingAs($reporter)
            ->getJson('/api/admin/complaints')
            ->assertForbidden();

        $this->actingAs($reporter)
            ->patchJson("/api/admin/complaints/{$complaint->id}", [
                'status' => 'resolved',
                'admin_notes' => 'Unauthorized update.',
            ])
            ->assertForbidden();
    }

    private function createReport(User $owner): PetReport
    {
        $category = PetCategory::create(['name' => 'Dog', 'slug' => 'dog']);
        $region = StateRegion::create(['name' => 'Yangon Region']);
        $township = CityTownship::create([
            'state_region_id' => $region->id,
            'name' => 'Kamayut Township',
        ]);

        return PetReport::create([
            'user_id' => $owner->id,
            'category_id' => $category->id,
            'type' => 'lost',
            'pet_name' => 'Milo',
            'event_date' => now()->toDateString(),
            'state_region_id' => $region->id,
            'township_id' => $township->id,
            'contact_name' => $owner->name,
            'contact_phone' => '0912345678',
            'status' => 'approved',
        ]);
    }
}