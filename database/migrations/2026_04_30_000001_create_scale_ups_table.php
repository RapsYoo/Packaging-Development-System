<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scale_ups', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // SU-2026-001
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('packaging_item_id')->nullable()->constrained()->nullOnDelete();

            // Informasi Scale Up
            $table->enum('packaging_category', ['Primer', 'Sekunder', 'Tersier']);
            $table->string('material_name'); // Nama Bahan Pengemas
            $table->string('material_type')->nullable(); // PP-LDPE, PET, dll
            $table->text('description')->nullable();

            // Spesifikasi Parameter Uji
            $table->string('bentuk')->nullable(); // Silinder, Kotak, dll
            $table->string('warna_dasar')->nullable();
            $table->string('warna_cetakan')->nullable();
            $table->string('tebal')->nullable(); // mm range: 1.05 - 1.56
            $table->string('diameter_dalam')->nullable(); // mm
            $table->string('diameter_luar')->nullable(); // mm
            $table->string('panjang_selang')->nullable(); // mm
            $table->string('berat')->nullable(); // gram range
            $table->string('test_kebocoran')->nullable(); // Tidak Bocor
            $table->string('test_kekuatan')->nullable();
            $table->string('kesesuaian_desain')->nullable();
            $table->string('kesesuaian_teks')->nullable();

            // Metode Analisa
            $table->string('metode_bentuk')->default('Visual');
            $table->string('metode_warna')->default('Visual');
            $table->string('metode_dimensi')->default('Alat caliper');
            $table->string('metode_berat')->default('Timbangan digital');
            $table->string('metode_kebocoran')->default('Vacum');
            $table->string('metode_kekuatan')->default('Test tekanan');
            $table->string('metode_kesesuaian')->default('Visual');

            // Proofprint & Master
            $table->text('proofprint_notes')->nullable();
            $table->string('proofprint_file')->nullable(); // Upload sampel proofprint
            $table->text('master_product_notes')->nullable();

            // Status & Workflow
            $table->enum('status', ['draft', 'in_review', 'approved', 'rejected', 'published'])->default('draft');
            $table->string('document_number')->nullable(); // QC/BP.013/04
            $table->date('valid_date')->nullable(); // Tanggal berlaku

            // Approval Signatures
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('checked_by')->nullable()->constrained('users')->nullOnDelete(); // Diperiksa oleh
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete(); // Disetujui oleh
            $table->timestamp('checked_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scale_ups');
    }
};
