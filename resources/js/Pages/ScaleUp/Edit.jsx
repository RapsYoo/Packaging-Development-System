import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';

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

export default function Edit({ auth, scaleUp, projects, masterSpecs }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        project_id: scaleUp.project_id || '',
        master_spec_id: scaleUp.master_spec_id || '',
        packaging_category: scaleUp.packaging_category || 'Primer',
        material_name: scaleUp.material_name || '',
        material_type: scaleUp.material_type || '',
        description: scaleUp.description || '',
        bentuk: scaleUp.bentuk || '',
        warna_dasar: scaleUp.warna_dasar || '',
        warna_cetakan: scaleUp.warna_cetakan || '',
        tebal: scaleUp.tebal || '',
        diameter_dalam: scaleUp.diameter_dalam || '',
        diameter_luar: scaleUp.diameter_luar || '',
        panjang_selang: scaleUp.panjang_selang || '',
        berat: scaleUp.berat || '',
        test_kebocoran: scaleUp.test_kebocoran || 'Tidak Bocor',
        test_kekuatan: scaleUp.test_kekuatan || '',
        kesesuaian_desain: scaleUp.kesesuaian_desain || 'Sesuai Standar',
        kesesuaian_teks: scaleUp.kesesuaian_teks || '',
        proofprint_notes: scaleUp.proofprint_notes || '',
        proofprint_file: null,
        master_product_notes: scaleUp.master_product_notes || '',
        document_number: scaleUp.document_number || '',
        valid_date: scaleUp.valid_date ? scaleUp.valid_date.split('T')[0] : '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('scaleups.update', scaleUp.id), { forceFormData: true });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={`Edit Scale Up: ${scaleUp.code}`}>
            <Head title={`Edit Scale Up ${scaleUp.code}`} />

            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-gray-800">Edit Spesifikasi Bahan Pengemas</h3>
                            <p className="text-sm text-gray-500 mt-0.5">Kode: <span className="font-mono font-bold text-indigo-600">{scaleUp.code}</span></p>
                        </div>
                        <Link href={route('scaleups.show', scaleUp.id)} className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">&larr; Kembali</Link>
                    </div>

                    <form onSubmit={submit} className="p-6 sm:p-8 space-y-8" encType="multipart/form-data">
                        {/* Section 1 */}
                        <div className="space-y-5">
                            <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider border-b border-indigo-100 pb-2">1. Informasi Proyek & Kemasan</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Proyek Terkait <span className="text-red-500">*</span></label>
                                    <select value={data.project_id} onChange={e => setData('project_id', e.target.value)} className={`w-full rounded-lg text-sm ${errors.project_id ? 'border-red-300' : 'border-gray-200'} focus:ring-indigo-500`}>
                                        <option value="">-- Pilih Proyek --</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>[{p.code}] {p.title}</option>)}
                                    </select>
                                    {errors.project_id && <p className="mt-1 text-xs text-red-600">{errors.project_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Referensi Master Spec <span className="text-xs text-gray-400">(Opsional)</span></label>
                                    <select value={data.master_spec_id} onChange={e => setData('master_spec_id', e.target.value)} className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm">
                                        <option value="">-- Pilih Master Spec --</option>
                                        {masterSpecs.map(ms => <option key={ms.id} value={ms.id}>[{ms.item_code_rm}] {ms.item_name_rm} ({ms.material})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori Kemasan <span className="text-red-500">*</span></label>
                                    <select value={data.packaging_category} onChange={e => setData('packaging_category', e.target.value)} className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm">
                                        <option value="Primer">Primer</option>
                                        <option value="Sekunder">Sekunder</option>
                                        <option value="Tersier">Tersier</option>
                                    </select>
                                </div>
                                <InputField data={data} setData={setData} errors={errors} label="Nama Bahan Pengemas" name="material_name" required />
                                <InputField data={data} setData={setData} errors={errors} label="Jenis Material" name="material_type" />
                                <InputField data={data} setData={setData} errors={errors} label="Nomor Dokumen" name="document_number" />
                                <InputField data={data} setData={setData} errors={errors} label="Tanggal Berlaku" name="valid_date" type="date" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi Umum</label>
                                <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows="2" className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm"></textarea>
                            </div>
                        </div>

                        {/* Section 2 */}
                        <div className="space-y-5">
                            <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider border-b border-indigo-100 pb-2">2. Parameter Uji & Spesifikasi</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <InputField data={data} setData={setData} errors={errors} label="Bentuk" name="bentuk" />
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Warna Dasar</label>
                                    <textarea value={data.warna_dasar} onChange={e => setData('warna_dasar', e.target.value)} rows="2" className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm"></textarea>
                                </div>
                                <InputField data={data} setData={setData} errors={errors} label="Warna Cetakan" name="warna_cetakan" />
                            </div>
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                <h5 className="text-sm font-semibold text-gray-700 mb-4">Dimensi (mm) & Berat</h5>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <InputField data={data} setData={setData} errors={errors} label="Tebal" name="tebal" suffix="mm" />
                                    <InputField data={data} setData={setData} errors={errors} label="Diameter Dalam" name="diameter_dalam" suffix="mm" />
                                    <InputField data={data} setData={setData} errors={errors} label="Diameter Luar" name="diameter_luar" suffix="mm" />
                                    <InputField data={data} setData={setData} errors={errors} label="Panjang Selang" name="panjang_selang" suffix="mm" />
                                    <InputField data={data} setData={setData} errors={errors} label="Berat" name="berat" suffix="gram" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <InputField data={data} setData={setData} errors={errors} label="Test Kebocoran" name="test_kebocoran" />
                                <InputField data={data} setData={setData} errors={errors} label="Test Kekuatan" name="test_kekuatan" />
                                <InputField data={data} setData={setData} errors={errors} label="Kesesuaian Desain / Penandaan" name="kesesuaian_desain" />
                                <InputField data={data} setData={setData} errors={errors} label="Kesesuaian Teks / Cetakan" name="kesesuaian_teks" />
                            </div>
                        </div>

                        {/* Section 3 */}
                        <div className="space-y-5">
                            <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider border-b border-indigo-100 pb-2">3. Sampel Proofprint & Master Produk</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan Sampel Proofprint</label>
                                    <textarea value={data.proofprint_notes} onChange={e => setData('proofprint_notes', e.target.value)} rows="3" className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm"></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Upload File Proofprint (Opsional)</label>
                                    <input type="file" onChange={e => setData('proofprint_file', e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-gray-200 rounded-lg" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                                    {scaleUp.proofprint_file && <p className="text-xs text-gray-400 mt-1">File saat ini: {scaleUp.proofprint_file}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan Master Produk</label>
                                    <textarea value={data.master_product_notes} onChange={e => setData('master_product_notes', e.target.value)} rows="3" className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm"></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="pt-6 border-t border-gray-100 flex justify-end items-center gap-3 bg-gray-50/50 -mx-6 sm:-mx-8 px-6 sm:px-8 -mb-6 sm:-mb-8 py-5">
                            <Link href={route('scaleups.show', scaleUp.id)} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm">Batal</Link>
                            <button type="submit" disabled={processing} className="px-6 py-2.5 bg-indigo-600 border border-transparent text-white rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-md disabled:opacity-50 text-sm">
                                Perbarui Scale Up
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
