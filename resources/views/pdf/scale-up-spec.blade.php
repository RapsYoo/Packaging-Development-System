<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Spesifikasi Bahan Pengemas - {{ $scaleUp->code }}</title>
    <style>
        @page {
            margin: 15mm 15mm 20mm 15mm;
            size: A4 portrait;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Times New Roman', serif;
            font-size: 11pt;
            color: #000;
            line-height: 1.4;
        }
        @media screen {
            body {
                background: #e0e0e0;
                display: flex;
                justify-content: center;
                padding: 40px;
            }
            .document-container {
                background: white;
                width: 210mm;
                min-height: 297mm;
                padding: 15mm 15mm 20mm 15mm;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }
        }
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .document-container {
                width: 100%;
                min-height: auto;
                padding: 0;
                box-shadow: none;
            }
        }

        /* ─── Header ─── */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #000;
            margin-bottom: 8px;
        }
        .header-table td {
            padding: 4px 8px;
            vertical-align: middle;
        }
        .company-logo-cell {
            width: 150px;
            text-align: center;
            border-right: 2px solid #000;
            padding: 8px;
        }
        .company-name {
            font-size: 16pt;
            font-weight: bold;
            color: #8B0000;
            letter-spacing: 2px;
        }
        .company-tagline {
            font-size: 7pt;
            color: #8B0000;
            letter-spacing: 1px;
            font-style: italic;
        }
        .company-address {
            font-size: 7.5pt;
            text-align: center;
            margin-top: 2px;
        }
        .header-title-cell {
            text-align: center;
            border-right: 2px solid #000;
        }
        .header-title {
            font-size: 13pt;
            font-weight: bold;
            letter-spacing: 1px;
        }
        .header-dept {
            font-size: 9pt;
            margin-top: 6px;
        }
        .header-dept-table {
            width: 80%;
            margin: 4px auto 0;
            border-collapse: collapse;
        }
        .header-dept-table td {
            border: 1px solid #000;
            padding: 3px 6px;
            font-size: 8.5pt;
            text-align: center;
            font-weight: bold;
        }
        .header-meta-cell {
            width: 170px;
            font-size: 8.5pt;
        }
        .header-meta-table {
            width: 100%;
            border-collapse: collapse;
        }
        .header-meta-table td {
            padding: 2px 4px;
            border: none;
            font-size: 8.5pt;
        }
        .header-meta-table .label {
            width: 95px;
        }

        /* ─── Main Table ─── */
        .main-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #000;
            margin-bottom: 0;
        }
        .main-table th,
        .main-table td {
            border: 1px solid #000;
            padding: 5px 8px;
            font-size: 10pt;
            vertical-align: top;
        }
        .main-table th {
            background-color: #f0f0f0;
            font-weight: bold;
            text-align: center;
        }
        .label-cell {
            font-weight: bold;
            width: 160px;
            background-color: #fafafa;
        }
        .sub-label {
            padding-left: 20px !important;
            font-size: 9.5pt;
        }
        .method-cell {
            width: 120px;
            text-align: center;
            font-size: 9.5pt;
        }
        .section-header {
            background-color: #f5f5f5;
            font-weight: bold;
            text-align: left;
        }

        /* ─── Signature Table ─── */
        .signature-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #000;
            border-top: none;
            margin-top: 0;
        }
        .signature-table td {
            border: 1px solid #000;
            padding: 6px 10px;
            font-size: 9pt;
            text-align: center;
            vertical-align: top;
        }
        .signature-title {
            font-weight: bold;
            font-size: 9pt;
            margin-bottom: 2px;
        }
        .signature-name {
            font-weight: bold;
            font-size: 9.5pt;
            text-decoration: underline;
            margin-top: 40px;
        }
        .signature-role {
            font-size: 8pt;
            font-style: italic;
            color: #555;
        }
        .signature-date {
            font-size: 8pt;
            color: #555;
        }

        /* ─── Nama Bahan Pengemas ─── */
        .nama-bahan-row td {
            font-size: 9.5pt;
            line-height: 1.5;
        }
    </style>
</head>
<body>

<div class="document-container">
    {{-- ═══ HEADER ═══ --}}
    <table class="header-table">
        <tr>
            <td class="company-logo-cell" rowspan="2">
                <div class="company-name">PRISKILA</div>
                <div class="company-tagline">THE PERFUME COMPANY</div>
                <div class="company-address" style="margin-top:6px; font-size:7pt;">
                    Jl. SEJAHTERA NO.8, LEUWINUTUG, CITEUREUP - BOGOR 16810, INDONESIA<br>
                    Phone: +62 21-87953504 | Fax: +62 21-87953505
                </div>
            </td>
            <td class="header-title-cell" rowspan="2">
                <div class="header-title">SPESIFIKASI BAHAN PENGEMAS</div>
                <table class="header-dept-table" style="margin-top:8px;">
                    <tr>
                        <td style="width:50%;">BAGIAN<br>MANAJEMEN MUTU</td>
                        <td style="width:50%;">SEKSI<br>QUALITY CONTROL</td>
                    </tr>
                </table>
            </td>
            <td class="header-meta-cell">
                <table class="header-meta-table">
                    <tr><td class="label">Halaman</td><td>: 1 dari 1</td></tr>
                    <tr><td class="label">Nomor</td><td>: {{ $scaleUp->document_number ?: '-' }}</td></tr>
                    <tr><td class="label">Tanggal Berlaku</td><td>: {{ $scaleUp->valid_date ? $scaleUp->valid_date->format('d F Y') : '-' }}</td></tr>
                </table>
            </td>
        </tr>
        <tr>
            <td class="header-meta-cell">
                <table class="header-meta-table">
                    <tr><td class="label">Mengganti Nomor</td><td>: -</td></tr>
                    <tr><td class="label">Tanggal</td><td>: -</td></tr>
                </table>
            </td>
        </tr>
    </table>

    {{-- ═══ APPROVAL SIGNATURES ═══ --}}
    <table class="signature-table" style="border-top: 2px solid #000; margin-bottom: 8px;">
        <tr>
            <td style="width:8%; font-weight:bold; font-size:9pt;">PT. PRISKILA<br>PRIMA MAKMUR</td>
            <td style="width:30.6%;">
                <div class="signature-title">Disusun oleh :</div>
                @if($scaleUp->creator)
                    <div class="signature-name" style="margin-top:10px;">{{ $scaleUp->creator->name }}</div>
                    <div class="signature-role">({{ $scaleUp->creator->role->name ?? 'Staff' }})</div>
                    <div class="signature-date">Tanggal: {{ $scaleUp->created_at->format('d F Y') }}</div>
                @else
                    <div style="height: 50px;"></div>
                @endif
            </td>
            <td style="width:30.6%;">
                <div class="signature-title">Diperiksa oleh :</div>
                @if($scaleUp->checker)
                    <div class="signature-name" style="margin-top:10px;">{{ $scaleUp->checker->name }}</div>
                    <div class="signature-role">({{ $scaleUp->checker->role->name ?? 'Manager QC' }})</div>
                    <div class="signature-date">Tanggal: {{ $scaleUp->checked_at ? $scaleUp->checked_at->format('d F Y') : '-' }}</div>
                @else
                    <div style="height: 50px;"></div>
                @endif
            </td>
            <td style="width:30.6%;">
                <div class="signature-title">Disetujui oleh :</div>
                @if($scaleUp->approver)
                    <div class="signature-name" style="margin-top:10px;">{{ $scaleUp->approver->name }}</div>
                    <div class="signature-role">({{ $scaleUp->approver->role->name ?? 'Manager QA' }})</div>
                    <div class="signature-date">Tanggal: {{ $scaleUp->approved_at ? $scaleUp->approved_at->format('d F Y') : '-' }}</div>
                @else
                    <div style="height: 50px;"></div>
                @endif
            </td>
        </tr>
    </table>

    {{-- ═══ MAIN SPECIFICATION TABLE ═══ --}}
    <table class="main-table">
        {{-- Nama Bahan Pengemas --}}
        <tr class="nama-bahan-row">
            <td class="label-cell" colspan="2" style="font-weight:bold; font-size: 10pt;">NAMA BAHAN PENGEMAS</td>
            <td colspan="2" style="font-size:9.5pt;">: {{ $scaleUp->description ?: $scaleUp->material_name }}</td>
        </tr>

        {{-- Jenis Material --}}
        <tr>
            <td class="label-cell" colspan="2" style="font-weight:bold;">JENIS MATERIAL</td>
            <td colspan="2">: {{ $scaleUp->material_type ?: '-' }}</td>
        </tr>

        {{-- Table Header --}}
        <tr>
            <th colspan="2" style="width:40%;">PARAMETER UJI</th>
            <th style="width:40%;">SPESIFIKASI</th>
            <th class="method-cell" style="width:20%;">METODE ANALISA</th>
        </tr>

        {{-- Bentuk --}}
        <tr>
            <td class="label-cell" colspan="2">Bentuk</td>
            <td>{{ $scaleUp->bentuk ?: '-' }}</td>
            <td class="method-cell">{{ $scaleUp->metode_bentuk }}</td>
        </tr>

        {{-- Pemeriksaan Fisik Section --}}
        <tr>
            <td class="label-cell" rowspan="2">Pemeriksaan<br>Fisik</td>
            <td class="sub-label">Warna Dasar</td>
            <td style="font-size:9pt;">{{ $scaleUp->warna_dasar ?: '-' }}</td>
            <td class="method-cell" rowspan="2">{{ $scaleUp->metode_warna }}</td>
        </tr>
        <tr>
            <td class="sub-label">Warna Cetakan</td>
            <td>{{ $scaleUp->warna_cetakan ?: '-' }}</td>
        </tr>

        {{-- Dimensi Section --}}
        <tr>
            <td class="label-cell" rowspan="4">Dimensi (mm)</td>
            <td class="sub-label">Tebal</td>
            <td>{{ $scaleUp->tebal ?: '-' }}</td>
            <td class="method-cell" rowspan="4">{{ $scaleUp->metode_dimensi }}</td>
        </tr>
        <tr>
            <td class="sub-label">Diameter Dalam</td>
            <td>{{ $scaleUp->diameter_dalam ?: '-' }}</td>
        </tr>
        <tr>
            <td class="sub-label">Diameter Luar</td>
            <td>{{ $scaleUp->diameter_luar ?: '-' }}</td>
        </tr>
        <tr>
            <td class="sub-label">Panjang Selang</td>
            <td>{{ $scaleUp->panjang_selang ?: '-' }}</td>
        </tr>

        {{-- Berat --}}
        <tr>
            <td class="label-cell" colspan="2">Berat (g)</td>
            <td>{{ $scaleUp->berat ?: '-' }}</td>
            <td class="method-cell">{{ $scaleUp->metode_berat }}</td>
        </tr>

        {{-- Test Kebocoran --}}
        <tr>
            <td class="label-cell" colspan="2">Test Kebocoran</td>
            <td>{{ $scaleUp->test_kebocoran ?: '-' }}</td>
            <td class="method-cell">{{ $scaleUp->metode_kebocoran }}</td>
        </tr>

        {{-- Test Kekuatan --}}
        <tr>
            <td class="label-cell" colspan="2">Test Kekuatan</td>
            <td>{{ $scaleUp->test_kekuatan ?: '-' }}</td>
            <td class="method-cell">{{ $scaleUp->metode_kekuatan }}</td>
        </tr>

        {{-- Kesesuaian Desain --}}
        <tr>
            <td class="label-cell" rowspan="2">Kesesuaian<br>Desain<br>Penandaan</td>
            <td class="sub-label">Kesesuaian<br>Desain / Cetakan</td>
            <td>{{ $scaleUp->kesesuaian_desain ?: '-' }}</td>
            <td class="method-cell" rowspan="2">{{ $scaleUp->metode_kesesuaian }}</td>
        </tr>
        <tr>
            <td class="sub-label">Kesesuaian<br>Teks/ Cetakan</td>
            <td>{{ $scaleUp->kesesuaian_teks ?: '-' }}</td>
        </tr>
    </table>
</div>

@if(isset($printMode) && $printMode)
<script>
    window.onload = function() {
        setTimeout(function() {
            window.print();
        }, 500);
    }
</script>
@endif

</body>
</html>
