<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('master_packaging_specs', function (Blueprint $table) {
            $table->id();
            $table->string('item_code_fg')->nullable();
            $table->string('item_name_fg')->nullable();
            $table->string('item_code_rm')->nullable();
            $table->string('item_name_rm')->nullable();
            $table->string('supplier')->nullable();
            $table->string('bentuk')->nullable();
            $table->string('material')->nullable();
            $table->string('warna_dasar')->nullable();
            $table->string('warna_cetakan')->nullable();
            $table->string('panjang')->nullable();
            $table->string('lebar')->nullable();
            $table->string('tinggi')->nullable();
            $table->string('tebal')->nullable();
            $table->string('tinggi_leher')->nullable();
            $table->string('diameter_dalam_mulut')->nullable();
            $table->string('diameter_luar_mulut')->nullable();
            $table->string('diameter_dalam')->nullable();
            $table->string('diameter_luar')->nullable();
            $table->string('panjang_selang')->nullable();
            $table->string('berat')->nullable();
            $table->string('volume')->nullable();
            $table->string('barcode')->nullable();
            $table->string('pom_na')->nullable();
            $table->string('tipe')->nullable();
            $table->string('group')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_packaging_specs');
    }
};
