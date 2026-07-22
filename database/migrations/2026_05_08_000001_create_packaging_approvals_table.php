<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packaging_approvals', function (Blueprint $table) {
            $table->id();
            $table->string('document_no')->unique(); // Document No.
            
            // Exact form fields
            $table->string('product_name'); // Nama Produk
            $table->string('packaging_type'); // Jenis Bahan Kemas
            $table->string('supplier')->nullable(); // Supplier
            $table->date('document_date'); // Tanggal

            $table->string('attachment_file')->nullable(); // Lampiran pendukung

            // Status & Workflow
            $table->enum('status', ['draft', 'submitted', 'in_review', 'approved', 'rejected'])->default('draft');

            // Dibuat Oleh
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');

            // Diperiksa Oleh (R&D Manager)
            $table->foreignId('checked_by_rd')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('checked_at_rd')->nullable();
            $table->enum('decision_rd', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('notes_rd')->nullable();

            // Disetujui Oleh (Signatures)
            $table->foreignId('approved_by_brand')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at_brand')->nullable();

            $table->foreignId('approved_by_marketing')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at_marketing')->nullable();

            $table->foreignId('approved_by_commercial')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at_commercial')->nullable();

            $table->foreignId('approved_by_bod')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at_bod')->nullable();

            $table->text('rejection_reason')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packaging_approvals');
    }
};
