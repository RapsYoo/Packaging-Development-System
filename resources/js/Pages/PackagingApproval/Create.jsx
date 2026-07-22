import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const InputField = ({ label, name, type = 'text', placeholder = '', required = false, suffix = '', data, setData, errors }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label} {required && <span className="text-red-500">*</span>}{suffix && <span className="text-xs text-gray-400 ml-1">({suffix})</span>}</label>
        <input
            type={type}
            value={data[name]}
            onChange={e => setData(name, e.target.value)}
            className={`w-full rounded-lg text-sm ${errors[name] ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`}
            placeholder={placeholder}
        />
        {errors[name] && <p className="mt-1 text-xs text-red-600">{errors[name]}</p>}
    </div>
);

export default function Create({ auth, projects, preselectedProject }) {
    const { data, setData, post, processing, errors } = useForm({
        project_id: preselectedProject || '',
        product_name: '',
        packaging_type: '',
        supplier: '',
        document_date: new Date().toISOString().split('T')[0], // Default today
        attachment_file: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('packaging-approvals.store'), { forceFormData: true });
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Buat Form Approval Bahan Kemas">
            <Head title="Buat Form Approval Bahan Kemas" />

            <div className="max-w-5xl mx-auto">
                {/* Global Error Banner */}
                {errors.error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{errors.error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-gray-800">Form Approval Bahan Kemas (Departemen R&D)</h3>
                        </div>
                        <Link href={route('packaging-approvals.index')} className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">&larr; Kembali</Link>
                    </div>

                    <form onSubmit={submit} className="p-6 sm:p-8 space-y-8" encType="multipart/form-data">
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Terkait Proyek <span className="text-red-500">*</span></label>
                                    <select
                                        value={data.project_id}
                                        onChange={e => setData('project_id', e.target.value)}
                                        className={`w-full rounded-lg text-sm ${errors.project_id ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`}
                                    >
                                        <option value="">-- Pilih Proyek --</option>
                                        {projects.map(project => (
                                            <option key={project.id} value={project.id}>
                                                [{project.code}] {project.title} - {project.type}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.project_id && <p className="mt-1 text-xs text-red-600">{errors.project_id}</p>}
                                </div>
                                <InputField data={data} setData={setData} errors={errors} label="Nama Produk" name="product_name" required placeholder="Contoh: Parfum X 100ml" />
                                <InputField data={data} setData={setData} errors={errors} label="Jenis Bahan Kemas" name="packaging_type" required placeholder="Contoh: Botol PET" />
                                <InputField data={data} setData={setData} errors={errors} label="Supplier" name="supplier" placeholder="PT. XYZ Packaging" />
                                <InputField data={data} setData={setData} errors={errors} label="Tanggal" name="document_date" type="date" required />
                            </div>
                        </div>

                        <div className="space-y-5">
                            <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider border-b border-indigo-100 pb-2">Lampiran Tambahan</h4>
                            <div className="grid grid-cols-1 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Lampiran Pendukung (Opsional)</label>
                                    <input type="file" onChange={e => setData('attachment_file', e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-gray-200 rounded-lg" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                                    {errors.attachment_file && <p className="mt-1 text-xs text-red-600">{errors.attachment_file}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end items-center gap-3 bg-gray-50/50 -mx-6 sm:-mx-8 px-6 sm:px-8 -mb-6 sm:-mb-8 py-5">
                            <Link href={route('packaging-approvals.index')} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm">Batal</Link>
                            <button type="submit" disabled={processing} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-md disabled:opacity-50 text-sm">
                                Simpan Form
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
