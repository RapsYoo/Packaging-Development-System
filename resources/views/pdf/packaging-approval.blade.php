<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Form Approval Bahan Kemas</title>
    <style>
        body {
            font-family: "Times New Roman", Times, serif;
            font-size: 12px;
            margin: 0;
            padding: 20px;
            background-color: #fff;
        }
        .header {
            margin-bottom: 20px;
        }
        .header-company {
            display: flex;
            align-items: center;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 5px;
        }
        .header-company img {
            height: 35px;
            margin-right: 15px;
            object-fit: contain;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;
        }
        .header-table td {
            border: 1px solid #000;
            padding: 5px 10px;
        }
        .header-logo {
            text-align: center;
            width: 20%;
        }
        .header-title {
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            text-decoration: underline;
            width: 50%;
        }
        .header-meta {
            width: 30%;
            font-size: 11px;
        }
        
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            border-top: none;
        }
        .info-table td {
            border: 1px solid #000;
            padding: 6px 10px;
        }
        .info-table td:first-child {
            font-weight: bold;
            width: 25%;
        }

        .approval-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
        }
        .approval-table th, .approval-table td {
            border: 1px solid #000;
            padding: 10px;
        }
        .approval-table th {
            text-align: center;
            font-weight: bold;
            background-color: #f9f9f9;
        }
        .checkbox-container {
            margin: 5px 0;
            display: flex;
            align-items: center;
        }
        .checkbox {
            display: inline-block;
            width: 12px;
            height: 12px;
            border: 1px solid #000;
            margin-right: 8px;
            text-align: center;
            line-height: 12px;
            font-size: 10px;
        }

        .signatures {
            width: 100%;
            text-align: center;
            margin-top: 20px;
        }
        .signatures-row {
            display: flex;
            justify-content: space-around;
            margin-bottom: 60px;
        }
        .signature-box {
            width: 30%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-end;
            min-height: 80px;
        }
        .signature-line {
            border-bottom: 1.5px dotted #000;
            width: 80%;
            margin-bottom: 5px;
        }
        .signature-name {
            font-weight: normal;
        }
        .signature-title {
            font-style: italic;
            font-size: 11px;
        }
        .approval-title {
            font-weight: bold;
            margin-bottom: 20px;
            display: block;
        }
        
        .signatures-bottom-row {
            display: flex;
            justify-content: space-between;
            margin-top: 60px;
        }
        .signatures-bottom-row .signature-box {
            width: 22%;
        }

        @media print {
            body { padding: 0; }
            @page { margin: 1.5cm; size: A4 portrait; }
            .no-print { display: none; }
        }
    </style>
</head>
<body onload="window.print()">
    <div class="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="window.print()" style="padding: 8px 16px; cursor: pointer;">Print Dokumen</button>
        <button onclick="window.close()" style="padding: 8px 16px; cursor: pointer; margin-left: 10px;">Tutup</button>
    </div>

    <div class="header">
        <div class="header-company">
            <img src="{{ asset('logo.png') }}" alt="Logo">
            PT PRISKILA PRIMA MAKMUR
        </div>
        <table class="header-table">
            <tr>
                <td class="header-logo" rowspan="3" style="text-align: center; vertical-align: middle;">
                    <img src="{{ asset('logo.png') }}" alt="PRISKILA" style="max-height: 50px; max-width: 140px; object-fit: contain;">
                </td>
                <td class="header-title" rowspan="3">
                    FORM APPROVAL BAHAN KEMAS<br>
                    DEPARTEMEN R&D
                </td>
                <td class="header-meta">Nomor : FR/R&D/008/00</td>
            </tr>
            <tr>
                <td class="header-meta">Revisi : 00</td>
            </tr>
            <tr>
                <td class="header-meta">Tanggal Berlaku : 21 Oktober 2022</td>
            </tr>
        </table>
    </div>

    <table class="info-table">
        <tr>
            <td>Document No.</td>
            <td>{{ $approval->document_no }}</td>
        </tr>
        <tr>
            <td>Nama Produk</td>
            <td>{{ $approval->product_name ?: '-' }}</td>
        </tr>
        <tr>
            <td>Jenis Bahan Kemas</td>
            <td>{{ $approval->packaging_type ?: '-' }}</td>
        </tr>
        <tr>
            <td>Supplier</td>
            <td>{{ $approval->supplier ?: '-' }}</td>
        </tr>
        <tr>
            <td>Tanggal</td>
            <td>{{ $approval->document_date ? $approval->document_date->format('d F Y') : '-' }}</td>
        </tr>
    </table>

    <table class="approval-table">
        <tr>
            <th colspan="2">APPROVAL</th>
        </tr>
        <tr>
            <td style="width: 40%; vertical-align: top;">
                <div class="checkbox-container">
                    <div class="checkbox">{{ $approval->decision_rd === 'approved' ? '✓' : '' }}</div>
                    Sampel dapat diterima
                </div>
                <div class="checkbox-container">
                    <div class="checkbox">{{ $approval->decision_rd === 'rejected' ? '✓' : '' }}</div>
                    Sampel tidak dapat diterima
                </div>
            </td>
            <td style="width: 60%; vertical-align: top;">
                <div>Catatan:</div>
                <div style="margin-top: 5px; min-height: 40px;">
                    {{ $approval->notes_rd }}
                </div>
            </td>
        </tr>
    </table>

    <div class="signatures">
        <div class="signatures-row">
            <div class="signature-box" style="align-items: center;">
                <span style="margin-bottom: 40px; font-weight: bold;">Dibuat Oleh,</span>
                <div style="text-align: center; margin-bottom: 2px; min-height: 14px;">
                    @if($approval->creator)
                        {{ $approval->creator->name }}
                    @else
                        &nbsp;
                    @endif
                </div>
                <div class="signature-line"></div>
                <span class="signature-title">Packaging Development</span>
            </div>

            <div class="signature-box" style="align-items: center;">
                <span style="margin-bottom: 40px; font-weight: bold;">Diperiksa Oleh,</span>
                <div style="text-align: center; margin-bottom: 2px; min-height: 14px;">
                    @if($approval->approverRd)
                        {{ $approval->approverRd->name }}
                    @else
                        <span style="color:transparent;">Wulan Puspitosari</span>
                    @endif
                </div>
                <div class="signature-line"></div>
                <span class="signature-title">R&D Manager</span>
            </div>
        </div>

        <div style="text-align: center; font-weight: bold; margin-bottom: 40px;">Disetujui Oleh,</div>

        <div class="signatures-bottom-row">
            <div class="signature-box">
                <div style="text-align: center; margin-bottom: 2px; min-height: 14px;">
                    @if($approval->approverBrand)
                        {{ $approval->approverBrand->name }}
                    @else
                        &nbsp;
                    @endif
                </div>
                <div class="signature-line"></div>
                <span class="signature-title">Brand Innovation and</span>
                <span class="signature-title">Development Manager</span>
            </div>
            
            <div class="signature-box">
                <div style="text-align: center; margin-bottom: 2px; min-height: 14px;">
                    @if($approval->approverMarketing)
                        {{ $approval->approverMarketing->name }}
                    @else
                        <span style="color:transparent;">Risa Trisanti</span>
                    @endif
                </div>
                <div class="signature-line"></div>
                <span class="signature-title">Marketing Manager</span>
            </div>
            
            <div class="signature-box">
                <div style="text-align: center; margin-bottom: 2px; min-height: 14px;">
                    @if($approval->approverCommercial)
                        {{ $approval->approverCommercial->name }}
                    @else
                        <span style="color:transparent;">Roy</span>
                    @endif
                </div>
                <div class="signature-line"></div>
                <span class="signature-title">Commercial Director</span>
            </div>
            
            <div class="signature-box">
                <div style="text-align: center; margin-bottom: 2px; min-height: 14px;">
                    @if($approval->approverBod)
                        {{ $approval->approverBod->name }}
                    @else
                        <span style="color:transparent;">Ronny Liong</span>
                    @endif
                </div>
                <div class="signature-line"></div>
                <span class="signature-title">Board of Director</span>
            </div>
        </div>
    </div>

</body>
</html>
