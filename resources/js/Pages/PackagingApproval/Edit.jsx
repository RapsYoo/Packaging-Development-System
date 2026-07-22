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

export default function Edit({ auth, approval }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        product_name: approval.product_name || '',
        packaging_type: approval.packaging_type || '',
        supplier: approval.supplier || '',
        document_date: approval.document_date ? approval.document_date.split('T')[0] : '',
        attachment_file: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('packaging-approvals.update', approval.id), { forceFormData: true });
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Edit Form Approval Bahan Kemas">
            <Head title={`Edit Form ${approval.document_no}`} />

            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-gray-800">Edit Form Approval Bahan Kemas</h3>
                            <p className="text-xs text-gray-500 mt-1">{approval.document_no}</p>
                        </div>
                        <Link href={route('packaging-approvals.show', approval.id)} className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">&larr; Kembali</Link>
                    </div>

                    <form onSubmit={submit} className="p-6 sm:p-8 space-y-8" encType="multipart/form-data">
                        {approval.status === 'rejected' && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                                <p className="text-sm text-amber-800 font-medium">⚠️ Menyimpan perubahan ini akan mereset status form menjadi Draft.</p>
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Ganti Lampiran (Opsional)</label>
                                    <input type="file" onChange={e => setData('attachment_file', e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-gray-200 rounded-lg" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                                    {approval.attachment_file && (
                                        <p className="mt-2 text-xs text-gray-500">
                                            Lampiran saat ini: <a href={`/storage/${approval.attachment_file}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Lihat Lampiran</a>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end items-center gap-3 bg-gray-50/50 -mx-6 sm:-mx-8 px-6 sm:px-8 -mb-6 sm:-mb-8 py-5">
                            <Link href={route('packaging-approvals.show', approval.id)} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm">Batal</Link>
                            <button type="submit" disabled={processing} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-md disabled:opacity-50 text-sm">
                                Simpan Perubahan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
