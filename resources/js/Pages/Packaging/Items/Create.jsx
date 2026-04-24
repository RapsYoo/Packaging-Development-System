import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ auth, projects }) {
    const { data, setData, post, processing, errors } = useForm({
        project_id: '',
        name: '',
        category: '',
        material: '',
        dimensions: '',
        drawing_url: '',
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('packaging.items.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Pendaftaran Master Kemasan">
            <Head title="Daftar Kemasan Baru" />

            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <h3 className="font-bold text-gray-800">Form Spesifikasi Kemasan</h3>
                        <Link href={route('packaging.items.index')} className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
                            &larr; Batal & Kembali
                        </Link>
                    </div>

                    <form onSubmit={submit} className="p-6 sm:p-8 space-y-8">
                        {/* Identitas Utama */}
                        <div className="space-y-6">
                            <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider border-b border-indigo-100 pb-2">Identitas Kemasan</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Komponen / Item <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        value={data.name} 
                                        onChange={e => setData('name', e.target.value)}
                                        className={`w-full rounded-lg text-sm ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`}
                                        placeholder="Contoh: Botol Kaca Kotak 50ml Frost"
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-600 font-medium">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Kategori Utama <span className="text-red-500">*</span></label>
                                    <select 
                                        value={data.category} 
                                        onChange={e => setData('category', e.target.value)}
                                        className={`w-full rounded-lg text-sm ${errors.category ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`}
                                    >
                                        <option value="">-- Pilih Kategori --</option>
                                        <option value="Primary">Primer (Botol, Tube, Pot)</option>
                                        <option value="Secondary">Sekunder (Box, Inner, Pouch)</option>
                                        <option value="Tertiary">Tersier (Karton, Masterbox)</option>
                                        <option value="Cap/Closure">Tutup (Cap, Pump, Spray)</option>
                                        <option value="Label">Label & Sticker</option>
                                    </select>
                                    {errors.category && <p className="mt-1 text-xs text-red-600 font-medium">{errors.category}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Material / Bahan Dasar</label>
                                    <input 
                                        type="text" 
                                        value={data.material} 
                                        onChange={e => setData('material', e.target.value)}
                                        className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm"
                                        placeholder="Contoh: Kaca, PET, PP, Kertas Ivory 300gsm"
                                    />
                                    {errors.material && <p className="mt-1 text-xs text-red-600 font-medium">{errors.material}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Spesifikasi Teknis */}
                        <div className="space-y-6">
                            <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider border-b border-indigo-100 pb-2">Spesifikasi Teknis & Relasi</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Terkait dengan Proyek (Opsional)</label>
                                    <select 
                                        value={data.project_id} 
                                        onChange={e => setData('project_id', e.target.value)}
                                        className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm"
                                    >
                                        <option value="">-- Independen (Tidak terikat proyek) --</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.code} - {p.title}</option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-gray-400 mt-1">Pilih jika item ini dibuat khusus untuk proyek tertentu.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Dimensi (P x L x T / Volume)</label>
                                    <input 
                                        type="text" 
                                        value={data.dimensions} 
                                        onChange={e => setData('dimensions', e.target.value)}
                                        className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm"
                                        placeholder="Contoh: 5 x 5 x 10 cm"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tautan Dokumen Drawing / Desain</label>
                                    <div className="flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-200 bg-gray-50 text-gray-500 sm:text-sm">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                        </span>
                                        <input 
                                            type="url" 
                                            value={data.drawing_url} 
                                            onChange={e => setData('drawing_url', e.target.value)}
                                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-200 focus:ring-indigo-500 text-sm"
                                            placeholder="https://drive.google.com/..."
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">URL menuju dokumen PDF technical drawing atau artwork.</p>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Khusus</label>
                                    <textarea 
                                        value={data.notes} 
                                        onChange={e => setData('notes', e.target.value)}
                                        rows="3"
                                        className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm"
                                        placeholder="Contoh: Tolerance thickness +- 0.5mm..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                            <button 
                                type="submit" 
                                disabled={processing}
                                className="px-6 py-2.5 bg-indigo-600 border border-transparent text-white rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-md disabled:opacity-50 text-sm"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Master Kemasan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
