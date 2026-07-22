<?php

namespace App\Exports;

use App\Models\Project;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ProjectReportExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    public function collection()
    {
        return Project::with('pic')->orderBy('created_at', 'desc')->get();
    }

    public function headings(): array
    {
        return [
            'ID Proyek',
            'Tipe',
            'Nama Produk',
            'Kode Produk',
            'PIC',
            'Status',
            'Target COGS',
            'Tanggal Dibuat',
            'Progres',
        ];
    }

    public function map($project): array
    {
        return [
            $project->id,
            strtoupper($project->type),
            $project->title,
            $project->product_code,
            $project->pic ? $project->pic->name : '-',
            ucfirst($project->status),
            $project->target_cogs,
            $project->created_at->format('Y-m-d'),
            $project->progress . '%',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
