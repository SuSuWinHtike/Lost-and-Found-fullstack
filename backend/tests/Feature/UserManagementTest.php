<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_load_and_update_users_from_the_database(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();

        $this->actingAs($admin)
            ->getJson('/api/users')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $this->actingAs($admin)
            ->putJson("/api/users/{$user->id}", [
                'name' => 'Updated Member',
                'phone' => '0912345678',
                'township' => 'Kamayut Township',
                'state_region' => 'Yangon Region',
            ])
            ->assertOk()
            ->assertJsonPath('user.name', 'Updated Member');

        $this->actingAs($admin)
            ->postJson("/api/users/{$user->id}/toggle-status")
            ->assertOk()
            ->assertJsonPath('user.status', 'suspended');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Member',
            'phone' => '0912345678',
            'township' => 'Kamayut Township',
            'state_region' => 'Yangon Region',
            'status' => 'suspended',
        ]);
    }

    public function test_non_admin_users_cannot_manage_user_accounts(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $target = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/users')
            ->assertForbidden();

        $this->actingAs($user)
            ->putJson("/api/users/{$target->id}", [
                'name' => 'Unauthorized Change',
            ])
            ->assertForbidden();

        $this->actingAs($user)
            ->postJson("/api/users/{$target->id}/toggle-status")
            ->assertForbidden();
    }
}
