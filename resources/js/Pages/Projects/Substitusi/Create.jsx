import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ auth, users }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        deadline: '',
        pic_id: '',
        notes: '',
        save_draft: false,
    });

    const submit = (e, isDraft = false) => {
        e.preventDefault();
        data.save_draft = isDraft;
        post(route('projects.substitusi.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Buat Pengajuan Proyek (Substitusi Bahan Kemas)">
            <Head title="Buat Project Brief Substitusi" />

            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <h3 className="font-bold text-gray-800">Formulir Substitusi Bahan Kemas</h3>
                        <Link href={route('projects.substitusi.index')} className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
                            &larr; Batal & Kembali
                        </Link>
                    </div>

                    <form className="p-6 sm:p-8 space-y-8">
                        {/* Section 1: Basic Info */}
                        <div className="space-y-6">
                            <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider border-b border-indigo-100 pb-2">1. Informasi Utama</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama/Judul Proyek Substitusi <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        value={data.title} 
                                        onChange={e => setData('title', e.target.value)}
                                        className={`w-full rounded-lg text-sm ${errors.title ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`}
                                        placeholder="Contoh: Substitusi Botol Parfum Varian X 100ml"
                                    />
                                    {errors.title && <p className="mt-1 text-xs text-red-600 font-medium">{errors.title}</p>}
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Batas Waktu (Deadline) <span className="text-red-500">*</span></label>
                                    <input 
                                        type="date" 
                                        value={data.deadline} 
                                        onChange={e => setData('deadline', e.target.value)}
                                        className={`w-full rounded-lg text-sm ${errors.deadline ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`}
                                    />
                                    {errors.deadline && <p className="mt-1 text-xs text-red-600 font-medium">{errors.deadline}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Assignment & Notes */}
                        <div className="space-y-6">
                            <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider border-b border-indigo-100 pb-2">2. Penugasan & Catatan</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Assign PIC (Penanggung Jawab)</label>
                                    <select 
                                        value={data.pic_id} 
                                        onChange={e => setData('pic_id', e.target.value)}
                                        className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm"
                                    >
                                        <option value="">-- Biarkan kosong jika belum ada --</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.role?.name || u.department})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Tambahan / Alasan Substitusi</label>
                                    <textarea 
                                        value={data.notes} 
                                        onChange={e => setData('notes', e.target.value)}
                                        rows="3"
                                        className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm"
                                        placeholder="Jelaskan alasan substitusi bahan kemas atau detail teknis lainnya..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50 -mx-6 sm:-mx-8 px-6 sm:px-8 -mb-6 sm:-mb-8 py-5">
                            <button 
                                type="button" 
                                onClick={(e) => submit(e, true)}
                                disabled={processing}
                                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 text-sm"
                            >
                                Simpan sebagai Draft
                            </button>
                            
                            <button 
                                type="button" 
                                onClick={(e) => submit(e, false)}
                                disabled={processing}
                                className="px-6 py-2.5 bg-indigo-600 border border-transparent text-white rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-md disabled:opacity-50 flex items-center text-sm"
                            >
                                <span>Ajukan Project &rarr;</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
