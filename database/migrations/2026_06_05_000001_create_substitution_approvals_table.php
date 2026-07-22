<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('substitution_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete();
            $table->string('document_no')->unique();
            
            // Step 1: General Info & SCM
            $table->string('product_name');
            $table->enum('packaging_type', ['Primer', 'Sekunder', 'Tersier']);
            $table->string('supplier');
            $table->date('document_date');
            
            $table->string('alasan_pengajuan');
            $table->text('alasan_lainnya')->nullable();
            $table->decimal('harga_penawaran', 15, 2)->nullable();
            $table->decimal('harga_existing', 15, 2)->nullable();
            $table->integer('estimasi_lead_time')->nullable();
            $table->json('attachment_files')->nullable();
            $table->text('notes')->nullable();
            
            // Step 2: Trial Analisa & Dimension Measurements
            $table->json('trial_analisa_data')->nullable(); // Table data
            $table->json('dimension_data')->nullable(); // Table data (for Primer)
            $table->enum('rekomendasi', ['MS', 'TMS'])->nullable();
            $table->text('catatan_rekomendasi')->nullable();
            
            // Step 2 Signatures
            $table->json('ttd_packaging_dev_laporan')->nullable(); // Dibuat Oleh
            $table->json('ttd_qc_manager_laporan')->nullable(); // Diperiksa Oleh
            
            // Step 3: Approval Decision & Circulation
            $table->enum('status_approval', ['accepted', 'rejected'])->nullable(); // Sampel dapat diterima / tidak
            $table->text('catatan_approval')->nullable();
            
            // Step 3 Signatures
            $table->json('ttd_packaging_dev')->nullable(); // Dibuat Oleh (Packaging Dev Staff)
            $table->json('ttd_qc_supervisor')->nullable(); // Diperiksa Oleh (QC Supervisor)
            $table->json('ttd_qc_manager')->nullable(); // Disetujui Oleh (QC Manager)
            $table->json('ttd_scm_manager')->nullable(); // Disetujui Oleh (SCM Manager)
            $table->json('ttd_qa_manager')->nullable(); // Disetujui Oleh (QA Manager)
            
            // Status of submission
            $table->enum('status', ['draft', 'submitted', 'in_review', 'approved', 'rejected'])->default('draft');
            
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('substitution_approvals');
    }
};
