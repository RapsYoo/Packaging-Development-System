import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Show({ auth, supplier }) {
    
    const handleDelete = () => {
        if(confirm('Peringatan: Apakah Anda yakin ingin menghapus Vendor ini? Riwayat kuotasi terkait mungkin akan terdampak.')) {
            router.delete(route('suppliers.destroy', supplier.id));
        }
    };

    const canManage = ['admin', 'scm'].includes(auth.user.role?.slug);

    // Bintang Rating Generator
    const renderStars = (rating) => {
        const num = Number(rating) || 0;
        return (
            <div className="flex items-center gap-1">
                <svg className={`w-5 h-5 ${num >= 1 ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                <span className="font-bold text-gray-800 ml-1">{num.toFixed(1)}</span>
                <span className="text-xs text-gray-500">/ 5.0</span>
            </div>
        );
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Profil Portofolio Vendor">
            <Head title={`Vendor - ${supplier.name}`} />

            <div className="max-w-6xl mx-auto space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Link href={route('suppliers.index')} className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
                        &larr; Kembali ke Direktori
                    </Link>
                    
                    {canManage && (
                        <div className="flex flex-wrap gap-2">
                            <Link href={route('suppliers.edit', supplier.id)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                                Update Data Vendor
                            </Link>
                            <button onClick={handleDelete} className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
                                Hapus Vendor
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Identitas Profil */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 rounded-full bg-white opacity-10"></div>
                                <div className="absolute bottom-0 right-16 w-24 h-24 rounded-full bg-white opacity-10"></div>
                                
                                <div className="flex items-start gap-6 relative z-10">
                                    <div className="w-24 h-24 rounded-2xl bg-white text-indigo-600 flex items-center justify-center font-black text-4xl shadow-lg border-4 border-indigo-400/30">
                                        {supplier.name.charAt(0)}
                                    </div>
                                    <div className="pt-2">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                supplier.status === 'active' ? 'bg-green-400 text-green-900' : 
                                                supplier.status === 'blacklisted' ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-800'
                                            }`}>
                                                {supplier.status}
                                            </span>
                                            <span className="text-indigo-200 font-mono text-sm">{supplier.code || 'Tanpa Kode'}</span>
                                        </div>
                                        <h2 className="text-3xl font-bold leading-tight mb-2">{supplier.name}</h2>
                                        <div className="flex items-center text-indigo-100 text-sm">
                                            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                            Kapabilitas: {supplier.capabilities || 'Belum dideskripsikan'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Kontak Perwakilan (PIC)</h4>
                                    <div className="flex items-center mb-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mr-3 shrink-0">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        </div>
                                        <span className="text-sm font-medium text-gray-800">{supplier.contact_person || '-'}</span>
                                    </div>
                                    <div className="flex items-center mb-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mr-3 shrink-0">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        </div>
                                        <a href={`mailto:${supplier.email}`} className="text-sm text-indigo-600 hover:underline">{supplier.email || '-'}</a>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mr-3 shrink-0">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        </div>
                                        <a href={`tel:${supplier.phone}`} className="text-sm text-indigo-600 hover:underline">{supplier.phone || '-'}</a>
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Alamat Pabrik / Kantor</h4>
                                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap border border-gray-100 min-h-[100px]">
                                        {supplier.address || <span className="italic text-gray-400">Belum ada informasi alamat.</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Supplier Portfolio / History Placeholder */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">Riwayat Quotation & Trial (Bidding)</h3>
                            <div className="text-center py-8">
                                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                <p className="text-sm text-gray-500">Belum ada riwayat pengajuan Quotation (Penawaran Harga) atau Trial dari vendor ini.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Rating & Stats */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 mt-4 mr-4 text-yellow-50 opacity-50 pointer-events-none">
                                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            </div>
                            
                            <h3 className="font-bold text-gray-800 mb-6 relative z-10">Evaluasi Performa (Vendor Rating)</h3>
                            
                            <div className="space-y-6 relative z-10">
                                <div>
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-xs font-semibold text-gray-500 uppercase">Technical Rating (R&D)</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                                            <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${(Number(supplier.rating) / 5) * 100 || 0}%` }}></div>
                                        </div>
                                        {renderStars(supplier.rating)}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">Kualitas sampel trial, keakuratan dimensi, stabilitas warna.</p>
                                </div>
                                
                                <div>
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-xs font-semibold text-gray-500 uppercase">Commercial Rating (SCM)</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                                            <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `0%` }}></div>
                                        </div>
                                        <span className="text-xs text-gray-400 italic">Belum dievaluasi</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">Ketepatan waktu pengiriman, negosiasi harga, termin pembayaran.</p>
                                </div>
                                
                                {canManage && (
                                    <button className="w-full mt-4 py-2 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors">
                                        + Lakukan Evaluasi Baru
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-800 mb-4">Informasi Sistem</h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-gray-500">Tanggal Terdaftar</span>
                                    <span className="font-medium text-gray-800">{new Date(supplier.created_at).toLocaleDateString('id-ID')}</span>
                                </li>
                                <li className="flex justify-between items-center py-2">
                                    <span className="text-gray-500">Update Terakhir</span>
                                    <span className="font-medium text-gray-800">{new Date(supplier.updated_at).toLocaleDateString('id-ID')}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
