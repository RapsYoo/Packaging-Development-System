<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add master_spec_id to scale_ups
        Schema::table('scale_ups', function (Blueprint $table) {
            $table->foreignId('master_spec_id')->nullable()->after('packaging_item_id')
                ->constrained('master_packaging_specs')->nullOnDelete();
        });

        // Add master_spec_id to inspections
        Schema::table('inspections', function (Blueprint $table) {
            $table->foreignId('master_spec_id')->nullable()->after('packaging_item_id')
                ->constrained('master_packaging_specs')->nullOnDelete();
        });

        // Add master_spec_id to color_standards
        Schema::table('color_standards', function (Blueprint $table) {
            $table->foreignId('master_spec_id')->nullable()->after('created_by')
                ->constrained('master_packaging_specs')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('scale_ups', function (Blueprint $table) {
            $table->dropConstrainedForeignId('master_spec_id');
        });

        Schema::table('inspections', function (Blueprint $table) {
            $table->dropConstrainedForeignId('master_spec_id');
        });

        Schema::table('color_standards', function (Blueprint $table) {
            $table->dropConstrainedForeignId('master_spec_id');
        });
    }
};
