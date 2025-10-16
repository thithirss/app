<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Usuário admin
        if (!User::where('email', 'admin@travelrep.local')->exists()) {
            $admin = User::factory()->create([
                'name' => 'Admin',
                'email' => 'admin@travelrep.local',
            ]);
            $admin->is_admin = true;
            $admin->save();
        }

        // Usuário padrão
        if (!User::where('email', 'user@travelrep.local')->exists()) {
            $user = User::factory()->create([
                'name' => 'Usuário',
                'email' => 'user@travelrep.local',
            ]);
            // is_admin padrão é false (migration define default)
        }
    }
}
