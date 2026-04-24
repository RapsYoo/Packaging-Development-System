<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update enum to include 'all', 'own', 'read' (since frontend uses 'all' instead of 'full')
        DB::statement("ALTER TABLE role_permissions MODIFY access_level ENUM('all', 'own', 'read', 'full') DEFAULT 'all'");
        // And we update existing 'full' to 'all' so it matches frontend
        DB::statement("UPDATE role_permissions SET access_level = 'all' WHERE access_level = 'full'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE role_permissions MODIFY access_level ENUM('full', 'read') DEFAULT 'full'");
    }
};
