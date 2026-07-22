<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Form Approval Bahan Kemas - {{ $approval->document_no }}</title>
    <style>
        body {
            font-family: "Times New Roman", Times, serif;
            font-size: 13px;
            margin: 0;
            padding: 30px;
            background-color: #fff;
            color: #000;
        }
        .header-logo-container {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }
        .header-logo-container img {
            height: 30px;
            margin-right: 15px;
            object-fit: contain;
        }
        .header-company {
            font-weight: bold;
            font-size: 14px;
            letter-spacing: 0.5px;
        }
        .form-title {
            text-align: center;
            font-weight: bold;
            font-size: 15px;
            margin-bottom: 25px;
            letter-spacing: 0.5px;
            text-decoration: underline;
        }
        .main-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .main-table td {
            border: 1px solid #000;
            padding: 8px 12px;
            vertical-align: middle;
        }
        .main-table td.label-col {
            font-weight: bold;
            width: 25%;
        }
        .main-table td.value-col {
            width: 75%;
        }
        .approval-container-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .approval-container-table td {
            border: 1px solid #000;
            padding: 0;
        }
        .approval-header {
            text-align: center;
            font-weight: bold;
            padding: 8px !important;
            background-color: #fff;
            border-bottom: 1px solid #000;
        }
        .approval-body-left {
            width: 40%;
            padding: 15px 12px !important;
            vertical-align: top;
            border-right: 1px solid #000;
        }
        .approval-body-right {
            width: 60%;
            padding: 12px !important;
            vertical-align: top;
        }
        .checkbox-item {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            font-size: 13px;
        }
        .checkbox-box {
            width: 16px;
            height: 16px;
            border: 1px solid #000;
            margin-right: 10px;
            display: inline-block;
            text-align: center;
            line-height: 16px;
            font-weight: bold;
            font-size: 12px;
        }
        .notes-title {
            font-weight: normal;
            margin-bottom: 6px;
        }
        .notes-content {
            min-height: 60px;
            font-size: 13px;
            white-space: pre-wrap;
            line-height: 1.4;
        }
        .signatures-section {
            width: 100%;
            margin-top: 30px;
        }
        .sig-row-top {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }
        .sig-box-two {
            width: 48%;
            border: 1px dashed #ccc; /* light border in doc, optional styling */
            padding: 10px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            min-height: 160px;
            justify-content: space-between;
        }
        .sig-box-three {
            width: 32%;
            border: 1px dashed #ccc;
            padding: 10px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            min-height: 160px;
            justify-content: space-between;
        }
        .sig-header {
            font-weight: normal;
            margin-bottom: 10px;
        }
        .sig-image-container {
            height: 70px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .sig-image-container img {
            max-height: 65px;
            max-width: 150px;
            object-fit: contain;
        }
        .sig-placeholder {
            height: 70px;
        }
        .sig-line {
            width: 85%;
            border-bottom: 1px solid #000;
            margin-top: 5px;
            margin-bottom: 5px;
        }
        .sig-name {
            font-size: 12px;
            font-weight: normal;
        }
        .sig-title {
            font-style: italic;
            font-size: 12px;
            font-weight: normal;
        }
        .sig-date {
            font-size: 10px;
            color: #555;
            margin-top: 2px;
        }
        .section-divider-title {
            text-align: center;
            font-weight: bold;
            margin-top: 25px;
            margin-bottom: 15px;
            font-size: 13px;
        }
        .footnote {
            font-size: 11px;
            font-style: italic;
            margin-top: 15px;
        }
        @media print {
            body {
                padding: 0;
            }
            .no-print {
                display: none;
            }
            @page {
                margin: 1.5cm;
                size: A4 portrait;
            }
        }
    </style>
</head>
<body onload="window.print()">

    <div class="no-print" style="margin-bottom: 25px; text-align: right; background: #f1f5f9; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <span style="float: left; line-height: 32px; font-weight: bold; font-family: sans-serif; font-size: 13px;">Mode Cetak Form Approval</span>
        <button onclick="window.print()" style="padding: 8px 16px; background-color: #4f46e5; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 12px;">Cetak Form</button>
        <button onclick="window.close()" style="padding: 8px 16px; background-color: #fff; color: #374151; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; margin-left: 10px; font-size: 12px;">Tutup</button>
    </div>

    <!-- Header Logo & Company -->
    <div class="header-logo-container">
        <img src="{{ asset('logo.png') }}" alt="Logo Priskila">
        <div class="header-company">PT PRISKILA PRIMA MAKMUR</div>
    </div>

    <!-- Title -->
    <div class="form-title">FORM APPROVAL BAHAN KEMAS</div>

    <!-- Main Table -->
    <table class="main-table">
        <tr>
            <td class="label-col">Document No.</td>
            <td class="value-col">{{ $approval->document_no }}</td>
        </tr>
        <tr>
            <td class="label-col">Nama Produk</td>
            <td class="value-col">{{ $approval->product_name }}</td>
        </tr>
        <tr>
            <td class="label-col">Jenis Bahan Kemas</td>
            <td class="value-col">
                <!-- Underline or cross the non-selected packaging type -->
                @php
                    $isPrimer = $approval->packaging_type === 'Primer';
                    $isSekunder = $approval->packaging_type === 'Sekunder';
                    $isTersier = $approval->packaging_type === 'Tersier';
                @endphp
                <span style="{{ $isPrimer ? 'font-weight: bold; text-decoration: underline;' : 'text-decoration: line-through; color: #888;' }}">Primer</span> /
                <span style="{{ $isSekunder ? 'font-weight: bold; text-decoration: underline;' : 'text-decoration: line-through; color: #888;' }}">Sekunder</span> /
                <span style="{{ $isTersier ? 'font-weight: bold; text-decoration: underline;' : 'text-decoration: line-through; color: #888;' }}">Tersier</span>*
            </td>
        </tr>
        <tr>
            <td class="label-col">Supplier</td>
            <td class="value-col">{{ $approval->supplier }}</td>
        </tr>
        <tr>
            <td class="label-col">Tanggal</td>
            <td class="value-col">{{ $approval->document_date ? $approval->document_date->format('d F Y') : '-' }}</td>
        </tr>
    </table>

    <!-- Approval Table Layout (Left: checkboxes, Right: Catatan) -->
    <table class="approval-container-table">
        <tr>
            <td class="approval-header" colspan="2">APPROVAL</td>
        </tr>
        <tr>
            <td class="approval-body-left">
                <div class="checkbox-item">
                    <span class="checkbox-box">{{ $approval->status_approval === 'accepted' ? '✓' : '' }}</span>
                    Sampel dapat diterima
                </div>
                <div class="checkbox-item">
                    <span class="checkbox-box">{{ $approval->status_approval === 'rejected' ? '✓' : '' }}</span>
                    Sampel tidak dapat diterima
                </div>
            </td>
            <td class="approval-body-right">
                <div class="notes-title">Catatan:</div>
                <div class="notes-content">{{ $approval->catatan_approval ?: '-' }}</div>
            </td>
        </tr>
    </table>

    <!-- Signatures -->
    <div class="signatures-section">
        <!-- Row 1: Dibuat Oleh & Diperiksa Oleh -->
        <div class="sig-row-top">
            <!-- Dibuat Oleh -->
            <div class="sig-box-two">
                <div class="sig-header">Dibuat Oleh,</div>
                <div class="sig-image-container">
                    @if($approval->ttd_packaging_dev && isset($approval->ttd_packaging_dev['signature']))
                        <img src="{{ $approval->ttd_packaging_dev['signature'] }}" alt="Tanda tangan Packaging Dev Staff">
                    @else
                        <div class="sig-placeholder"></div>
                    @endif
                </div>
                <div class="sig-line"></div>
                <div class="sig-name">{{ $approval->ttd_packaging_dev['name'] ?? '............................................' }}</div>
                <div class="sig-title">Packaging Development Staff</div>
                @if($approval->ttd_packaging_dev && isset($approval->ttd_packaging_dev['signed_at']))
                    <div class="sig-date">{{ date('d/m/Y H:i', strtotime($approval->ttd_packaging_dev['signed_at'])) }}</div>
                @endif
            </div>

            <!-- Diperiksa Oleh -->
            <div class="sig-box-two">
                <div class="sig-header">Diperiksa Oleh,</div>
                <div class="sig-image-container">
                    @if($approval->ttd_qc_supervisor && isset($approval->ttd_qc_supervisor['signature']))
                        <img src="{{ $approval->ttd_qc_supervisor['signature'] }}" alt="Tanda tangan QC Supervisor">
                    @else
                        <div class="sig-placeholder"></div>
                    @endif
                </div>
                <div class="sig-line"></div>
                <div class="sig-name">{{ $approval->ttd_qc_supervisor['name'] ?? '............................................' }}</div>
                <div class="sig-title">QC Supervisor</div>
                @if($approval->ttd_qc_supervisor && isset($approval->ttd_qc_supervisor['signed_at']))
                    <div class="sig-date">{{ date('d/m/Y H:i', strtotime($approval->ttd_qc_supervisor['signed_at'])) }}</div>
                @endif
            </div>
        </div>

        <!-- Row 2 Header -->
        <div class="section-divider-title">Disetujui Oleh,</div>

        <!-- Row 2: QC Manager, SCM Manager, QA Manager -->
        <div class="sig-row-top" style="margin-top: 10px;">
            <!-- QC Manager -->
            <div class="sig-box-three">
                <div class="sig-header">Disetujui Oleh,</div>
                <div class="sig-image-container">
                    @if($approval->ttd_qc_manager && isset($approval->ttd_qc_manager['signature']))
                        <img src="{{ $approval->ttd_qc_manager['signature'] }}" alt="Tanda tangan QC Manager">
                    @else
                        <div class="sig-placeholder"></div>
                    @endif
                </div>
                <div class="sig-line"></div>
                <div class="sig-name">{{ $approval->ttd_qc_manager['name'] ?? '............................................' }}</div>
                <div class="sig-title">Quality Control Manager</div>
                @if($approval->ttd_qc_manager && isset($approval->ttd_qc_manager['signed_at']))
                    <div class="sig-date">{{ date('d/m/Y H:i', strtotime($approval->ttd_qc_manager['signed_at'])) }}</div>
                @endif
            </div>

            <!-- SCM Manager -->
            <div class="sig-box-three">
                <div class="sig-header">Disetujui Oleh,</div>
                <div class="sig-image-container">
                    @if($approval->ttd_scm_manager && isset($approval->ttd_scm_manager['signature']))
                        <img src="{{ $approval->ttd_scm_manager['signature'] }}" alt="Tanda tangan SCM Manager">
                    @else
                        <div class="sig-placeholder"></div>
                    @endif
                </div>
                <div class="sig-line"></div>
                <div class="sig-name">{{ $approval->ttd_scm_manager['name'] ?? '............................................' }}</div>
                <div class="sig-title">SCM Manager</div>
                @if($approval->ttd_scm_manager && isset($approval->ttd_scm_manager['signed_at']))
                    <div class="sig-date">{{ date('d/m/Y H:i', strtotime($approval->ttd_scm_manager['signed_at'])) }}</div>
                @endif
            </div>

            <!-- QA Manager -->
            <div class="sig-box-three">
                <div class="sig-header">Disetujui Oleh,</div>
                <div class="sig-image-container">
                    @if($approval->ttd_qa_manager && isset($approval->ttd_qa_manager['signature']))
                        <img src="{{ $approval->ttd_qa_manager['signature'] }}" alt="Tanda tangan QA Manager">
                    @else
                        <div class="sig-placeholder"></div>
                    @endif
                </div>
                <div class="sig-line"></div>
                <div class="sig-name">{{ $approval->ttd_qa_manager['name'] ?? '............................................' }}</div>
                <div class="sig-title">QA Manager</div>
                @if($approval->ttd_qa_manager && isset($approval->ttd_qa_manager['signed_at']))
                    <div class="sig-date">{{ date('d/m/Y H:i', strtotime($approval->ttd_qa_manager['signed_at'])) }}</div>
                @endif
            </div>
        </div>
    </div>

    <!-- Footnote -->
    <div class="footnote">
        *) coret yang tidak sesuai
    </div>

</body>
</html>
