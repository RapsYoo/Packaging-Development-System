import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, inspections }) {
    
    const getResultStyle = (result) => {
        switch(result) {
            case 'pass': return 'bg-green-100 text-green-800 border-green-200';
            case 'fail': return 'bg-red-100 text-red-800 border-red-200';
            case 'conditional': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Riwayat Inspeksi & Quality Control">
            <Head title="Inspeksi QC" />

            <div className="max-w-7xl mx-auto space-y-6">
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Log Pengujian Kemasan (QC)</h3>
                            <p className="text-sm text-gray-500 mt-1">Catatan hasil uji fisik, fungsionalitas, dan transportasi (Transport Test).</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">No. Laporan</th>
                                    <th className="px-6 py-4">Item Kemasan</th>
                                    <th className="px-6 py-4">Vendor</th>
                                    <th className="px-6 py-4">Kesimpulan / Hasil</th>
                                    <th className="px-6 py-4">Petugas QC</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {inspections?.data?.length > 0 ? inspections.data.map(insp => (
                                    <tr key={insp.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-indigo-600">QC-{insp.id.toString().padStart(4, '0')}</div>
                                            <div className="text-xs text-gray-500">{new Date(insp.created_at).toLocaleDateString('id-ID')}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-800">
                                            {insp.master_spec?.item_name_rm || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {insp.supplier?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getResultStyle(insp.result)}`}>
                                                {insp.result === 'conditional' ? 'Pass with Note' : insp.result}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-xs">
                                            {insp.inspector?.name || 'Sistem'}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            Belum ada laporan inspeksi QC yang diterbitkan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
