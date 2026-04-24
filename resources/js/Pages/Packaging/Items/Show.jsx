import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Show({ auth, item }) {
    
    const getStatusBadge = (status) => {
        switch(status) {
            case 'draft': return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase tracking-wider border border-gray-200">Draft</span>;
            case 'in_review': return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold uppercase tracking-wider border border-yellow-200">In Review</span>;
            case 'approved': return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider border border-green-200">Approved</span>;
            case 'rejected': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider border border-red-200">Rejected</span>;
            case 'obsolete': return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider border border-orange-200">Obsolete</span>;
            default: return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
        }
    };

    const handleDelete = () => {
        if(confirm('Peringatan: Apakah Anda yakin ingin menghapus Master Kemasan ini secara permanen?')) {
            router.delete(route('packaging.items.destroy', item.id));
        }
    };

    const canManage = ['admin', 'rd'].includes(auth.user.role?.slug);

    return (
        <AuthenticatedLayout user={auth.user} header="Detail Master Kemasan">
            <Head title={`Packaging - ${item.code}`} />

            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Link href={route('packaging.items.index')} className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
                        &larr; Kembali ke Katalog
                    </Link>
                    
                    {canManage && (
                        <div className="flex flex-wrap gap-2">
                            <Link href={route('packaging.items.edit', item.id)} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                Update Spesifikasi
                            </Link>
                            <button onClick={handleDelete} className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
                                Hapus Item
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Data Spesifikasi */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-indigo-50/50 p-6 sm:p-8 flex items-start gap-5 border-b border-gray-100">
                                <div className={`w-20 h-20 rounded-2xl shadow-inner flex items-center justify-center font-bold text-xl border border-white/50 ${
                                    item.category === 'Primary' ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white' :
                                    item.category === 'Secondary' ? 'bg-gradient-to-br from-purple-400 to-purple-600 text-white' :
                                    item.category === 'Label' ? 'bg-gradient-to-br from-pink-400 to-pink-600 text-white' : 'bg-gradient-to-br from-gray-400 to-gray-600 text-white'
                                }`}>
                                    {item.category ? item.category.substring(0, 3).toUpperCase() : 'PKG'}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-1">{item.name}</h2>
                                            <p className="text-sm font-mono text-gray-500">{item.code}</p>
                                        </div>
                                        <div>{getStatusBadge(item.status)}</div>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-white border border-gray-200 text-gray-600 shadow-sm">
                                            Kategori: {item.category}
                                        </span>
                                        {item.material && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-white border border-gray-200 text-gray-600 shadow-sm">
                                                Material: {item.material}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 sm:p-8">
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6 pb-2 border-b border-gray-100">Spesifikasi Detail</h4>
                                
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                    <div className="sm:col-span-1">
                                        <dt className="text-xs font-medium text-gray-500 uppercase">Dimensi / Volume</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{item.dimensions || <span className="text-gray-400 italic">Belum diisi</span>}</dd>
                                    </div>
                                    <div className="sm:col-span-1">
                                        <dt className="text-xs font-medium text-gray-500 uppercase">Proyek Terkait</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {item.project ? (
                                                <Link href={route('projects.show', item.project_id)} className="text-indigo-600 hover:underline font-medium">
                                                    {item.project.code} - {item.project.title}
                                                </Link>
                                            ) : (
                                                <span className="text-gray-400 italic">Berdiri Sendiri (Independen)</span>
                                            )}
                                        </dd>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <dt className="text-xs font-medium text-gray-500 uppercase">Catatan & Keterangan</dt>
                                        <dd className="mt-2 text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 whitespace-pre-wrap">
                                            {item.notes || <span className="text-gray-400 italic">Tidak ada catatan.</span>}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Dokumen & Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                Technical Drawing
                            </h3>
                            
                            {item.drawing_url ? (
                                <a 
                                    href={item.drawing_url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="block w-full text-center px-4 py-3 border border-indigo-200 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors font-medium text-sm group"
                                >
                                    Buka Dokumen Desain
                                    <svg className="w-4 h-4 ml-2 inline-block transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </a>
                            ) : (
                                <div className="text-center p-4 border border-dashed border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-500">
                                    Belum ada file drawing/artwork yang dilampirkan.
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-800 mb-4">Meta Data Sistem</h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-gray-500">Pembuat Data</span>
                                    <span className="font-medium text-gray-800">{item.creator?.name || '-'}</span>
                                </li>
                                <li className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-gray-500">Tanggal Daftar</span>
                                    <span className="font-medium text-gray-800">{new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                                </li>
                                <li className="flex justify-between items-center py-2">
                                    <span className="text-gray-500">Revisi Terakhir</span>
                                    <span className="font-medium text-gray-800">{new Date(item.updated_at).toLocaleDateString('id-ID')}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
