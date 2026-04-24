import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, quotations }) {
    
    const getStatusStyle = (status) => {
        switch(status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Manajemen Quotation (Penawaran Harga)">
            <Head title="Quotations & Bidding" />

            <div className="max-w-7xl mx-auto space-y-6">
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Daftar Penawaran Harga (Bidding)</h3>
                            <p className="text-sm text-gray-500 mt-1">Lacak dan bandingkan harga yang diajukan oleh berbagai vendor.</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Dokumen</th>
                                    <th className="px-6 py-4">Vendor Pengaju</th>
                                    <th className="px-6 py-4">Proyek Terkait</th>
                                    <th className="px-6 py-4 text-right">Harga Satuan (Rp)</th>
                                    <th className="px-6 py-4">Status Evaluasi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {quotations?.data?.length > 0 ? quotations.data.map(q => (
                                    <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-indigo-600">QT-{q.id.toString().padStart(4, '0')}</div>
                                            <div className="text-xs text-gray-500">{new Date(q.created_at).toLocaleDateString('id-ID')}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-800">
                                            {q.supplier?.name || 'Unknown Vendor'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {q.project?.code || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                                            {Number(q.price).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(q.status)}`}>
                                                {q.status}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            Belum ada penawaran harga yang masuk ke dalam sistem.
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
