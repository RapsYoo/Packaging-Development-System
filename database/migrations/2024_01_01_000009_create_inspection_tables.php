<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('packaging_item_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type', ['T0', 'T1', 'T2']);
            $table->json('checklist')->nullable();
            $table->enum('result', ['Pass', 'Fail', 'Pending'])->default('Pending');
            $table->text('notes')->nullable();
            $table->json('photos')->nullable();
            $table->foreignId('inspector_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('transport_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inspection_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
            $table->json('conditions')->nullable();
            $table->text('findings')->nullable();
            $table->text('recommendations')->nullable();
            $table->foreignId('tester_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transport_tests');
        Schema::dropIfExists('inspections');
    }
};
