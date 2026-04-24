import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ auth, project, users }) {
    const { data, setData, put, processing, errors } = useForm({
        title: project.title || '',
        concept: project.concept || '',
        target_cogs: project.target_cogs || '',
        target_market: project.target_market || '',
        deadline: project.deadline ? project.deadline.split('T')[0] : '', // format to YYYY-MM-DD
        pic_id: project.pic_id || '',
        notes: project.notes || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('projects.update', project.id));
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Edit Project Brief">
            <Head title={`Edit Project: ${project.code}`} />

            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-gray-800">Ubah Detail Proyek</h3>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">{project.code} &bull; {project.type}</p>
                        </div>
                        <Link href={route('projects.show', project.id)} className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
                            &larr; Batal & Kembali
                        </Link>
                    </div>

                    <form onSubmit={submit} className="p-6 sm:p-8 space-y-8">
                        {/* Section 1: Basic Info */}
                        <div className="space-y-6">
                            <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider border-b border-indigo-100 pb-2">1. Informasi Utama</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama/Judul Proyek <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        value={data.title} 
                                        onChange={e => setData('title', e.target.value)}
                                        className={`w-full rounded-lg text-sm ${errors.title ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`}
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

                        {/* Section 2: Marketing & Concept */}
                        <div className="space-y-6">
                            <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider border-b border-indigo-100 pb-2">2. Detail Konsep & Target</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Konsep Kemasan</label>
                                    <textarea 
                                        value={data.concept} 
                                        onChange={e => setData('concept', e.target.value)}
                                        rows="4"
                                        className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Target COGS (Rp)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">Rp</span>
                                        </div>
                                        <input 
                                            type="number" 
                                            value={data.target_cogs} 
                                            onChange={e => setData('target_cogs', e.target.value)}
                                            className="w-full rounded-lg border-gray-200 pl-10 focus:ring-indigo-500 text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Market / Demografi</label>
                                    <input 
                                        type="text" 
                                        value={data.target_market} 
                                        onChange={e => setData('target_market', e.target.value)}
                                        className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Assignment & Notes */}
                        <div className="space-y-6">
                            <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider border-b border-indigo-100 pb-2">3. Penugasan & Catatan</h4>
                            
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Tambahan</label>
                                    <textarea 
                                        value={data.notes} 
                                        onChange={e => setData('notes', e.target.value)}
                                        rows="2"
                                        className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm"
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
                                {processing ? 'Menyimpan...' : 'Perbarui Project'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
