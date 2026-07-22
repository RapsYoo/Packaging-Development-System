<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packaging_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Add category_id FK to packaging_items
        Schema::table('packaging_items', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('code')->constrained('packaging_categories')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('packaging_items', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');
        });

        Schema::dropIfExists('packaging_categories');
    }
};
