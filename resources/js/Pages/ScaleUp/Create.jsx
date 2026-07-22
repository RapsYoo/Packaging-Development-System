import React, { useState } from 'react';
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

export default function Create({ auth, projects, masterSpecs, preselectedProject }) {
    const [selectedSpecId, setSelectedSpecId] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        project_id: preselectedProject || '',
        master_spec_id: '',
        packaging_category: 'Primer',
        material_name: '',
        material_type: '',
        description: '',
        bentuk: '',
        warna_dasar: '',
        warna_cetakan: '',
        tebal: '',
        diameter_dalam: '',
        diameter_luar: '',
        panjang_selang: '',
        berat: '',
        test_kebocoran: 'Tidak Bocor',
        test_kekuatan: '',
        kesesuaian_desain: 'Sesuai Standar',
        kesesuaian_teks: '',
        proofprint_notes: '',
        proofprint_file: null,
        master_product_notes: '',
        document_number: '',
        valid_date: '',
    });

    const selectedProject = projects.find(p => String(p.id) === String(data.project_id));
    const gatingBlocked = selectedProject && !selectedProject.gating_allowed;

    const submit = (e) => {
        e.preventDefault();
        if (gatingBlocked) return;
        post(route('scaleups.store'), { forceFormData: true });
    };

    const handleSpecChange = (e) => {
        const specId = e.target.value;
        setSelectedSpecId(specId);
        if (specId) {
            const spec = masterSpecs.find(s => String(s.id) === String(specId));
            if (spec) {
                setData(prevData => ({
                    ...prevData,
                    master_spec_id: specId,
                    material_name: spec.item_name_rm || '',
                    material_type: spec.material || '',
                    bentuk: spec.bentuk || '',
                    warna_dasar: spec.warna_dasar || '',
                    warna_cetakan: spec.warna_cetakan || '',
                    tebal: spec.tebal || '',
                    diameter_dalam: spec.diameter_dalam || '',
                    diameter_luar: spec.diameter_luar || '',
                    panjang_selang: spec.panjang_selang || '',
                    berat: spec.berat || '',
                }));
            }
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Buat Scale Up Baru">
            <Head title="Buat Scale Up" />

            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <h3 className="font-bold text-gray-800">Formulir Spesifikasi Bahan Pengemas (Scale Up)</h3>
                        <Link href={route('scaleups.index')} className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">&larr; Kembali</Link>
                    </div>

                    <form onSubmit={submit} className="p-6 sm:p-8 space-y-8" encType="multipart/form-data">
                        {/* Section 1: Informasi Proyek */}
                        <div className="space-y-5">
                            <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider border-b border-indigo-100 pb-2">1. Informasi Proyek & Kemasan</h4>
                            
                            {/* Gating Warning */}
                            {gatingBlocked && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                                    <svg className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <div>
                                        <p className="text-sm font-bold text-amber-800">Prasyarat Belum Terpenuhi</p>
                                        <p className="text-sm text-amber-700 mt-1">{selectedProject.gating_reason}</p>
                                        <p className="text-xs text-amber-600 mt-2">Selesaikan tahapan sebelumnya pada halaman detail proyek terlebih dahulu.</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Proyek Terkait <span className="text-red-500">*</span></label>
                                    <select value={data.project_id} onChange={e => setData('project_id', e.target.value)} className={`w-full rounded-lg text-sm ${errors.project_id ? 'border-red-300' : 'border-gray-200'} focus:ring-indigo-500`}>
                                        <option value="">-- Pilih Proyek --</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>[{p.code}] {p.title} {!p.gating_allowed ? '⚠️' : '✅'}</option>)}
                                    </select>
                                    {errors.project_id && <p className="mt-1 text-xs text-red-600">{errors.project_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Referensi Master Spec <span className="text-xs text-gray-400">(Opsional, auto-fill)</span></label>
                                    <select value={selectedSpecId} onChange={handleSpecChange} className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm">
                                        <option value="">-- Pilih Master Spec --</option>
                                        {masterSpecs.map(ms => <option key={ms.id} value={ms.id}>[{ms.item_code_rm}] {ms.item_name_rm} ({ms.material})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori Kemasan <span className="text-red-500">*</span></label>
                                    <select value={data.packaging_category} onChange={e => setData('packaging_category', e.target.value)} className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm">
                                        <option value="Primer">Primer (Botol, Crimp pump, dll)</option>
                                        <option value="Sekunder">Sekunder (Sticker, Kotak)</option>
                                        <option value="Tersier">Tersier (Inner, Partisi, Master Box)</option>
                                    </select>
                                </div>

                                <InputField data={data} setData={setData} errors={errors} label="Nama Bahan Pengemas" name="material_name" required placeholder="Contoh: Serov Mist Pump Casablanca" />
                                <InputField data={data} setData={setData} errors={errors} label="Jenis Material" name="material_type" placeholder="PP-LDPE, PET, Karton, dll" />
                                <InputField data={data} setData={setData} errors={errors} label="Nomor Dokumen" name="document_number" placeholder="QC/BP.013/04" />
                                <InputField data={data} setData={setData} errors={errors} label="Tanggal Berlaku" name="valid_date" type="date" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi Umum</label>
                                <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows="2" className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm" placeholder="Deskripsi singkat mengenai bahan pengemas ini..."></textarea>
                            </div>
                        </div>

                        {/* Section 2: Parameter Uji */}
                        <div className="space-y-5">
                            <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider border-b border-indigo-100 pb-2">2. Parameter Uji & Spesifikasi</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <InputField data={data} setData={setData} errors={errors} label="Bentuk" name="bentuk" placeholder="Silinder, Kotak, dll" />
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Warna Dasar</label>
                                    <textarea value={data.warna_dasar} onChange={e => setData('warna_dasar', e.target.value)} rows="2" className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm" placeholder="Biru Tua (Ambitious/M5), Merah (Intense Love/M1), dll..."></textarea>
                                </div>
                                <InputField data={data} setData={setData} errors={errors} label="Warna Cetakan" name="warna_cetakan" placeholder="-" />
                            </div>

                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                <h5 className="text-sm font-semibold text-gray-700 mb-4">Dimensi (mm) & Berat</h5>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <InputField data={data} setData={setData} errors={errors} label="Tebal" name="tebal" placeholder="1.05 - 1.56" suffix="mm" />
                                    <InputField data={data} setData={setData} errors={errors} label="Diameter Dalam" name="diameter_dalam" placeholder="20.00 - 20.48" suffix="mm" />
                                    <InputField data={data} setData={setData} errors={errors} label="Diameter Luar" name="diameter_luar" placeholder="21.88 - 23.40" suffix="mm" />
                                    <InputField data={data} setData={setData} errors={errors} label="Panjang Selang" name="panjang_selang" placeholder="124.00 - 128.00" suffix="mm" />
                                    <InputField data={data} setData={setData} errors={errors} label="Berat" name="berat" placeholder="5.85 - 7.35" suffix="gram" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <InputField data={data} setData={setData} errors={errors} label="Test Kebocoran" name="test_kebocoran" placeholder="Tidak Bocor" />
                                <InputField data={data} setData={setData} errors={errors} label="Test Kekuatan" name="test_kekuatan" placeholder="Tidak ada cetakan yang menempel..." />
                                <InputField data={data} setData={setData} errors={errors} label="Kesesuaian Desain / Penandaan" name="kesesuaian_desain" placeholder="Sesuai Standar" />
                                <InputField data={data} setData={setData} errors={errors} label="Kesesuaian Teks / Cetakan" name="kesesuaian_teks" placeholder="-" />
                            </div>
                        </div>

                        {/* Section 3: Proofprint & Master */}
                        <div className="space-y-5">
                            <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider border-b border-indigo-100 pb-2">3. Sampel Proofprint & Master Produk</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan Sampel Proofprint & Standar</label>
                                    <textarea value={data.proofprint_notes} onChange={e => setData('proofprint_notes', e.target.value)} rows="3" className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm" placeholder="Hasil sampel proofprint, keterangan standar..."></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Upload File Sampel Proofprint</label>
                                    <input
                                        type="file"
                                        onChange={e => setData('proofprint_file', e.target.files[0])}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-gray-200 rounded-lg"
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Max 10MB (PDF, JPG, PNG, DOC)</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan Pembuatan Master Produk</label>
                                    <textarea value={data.master_product_notes} onChange={e => setData('master_product_notes', e.target.value)} rows="3" className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm" placeholder="Keterangan tentang pembuatan master produk..."></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-6 border-t border-gray-100 flex justify-end items-center gap-3 bg-gray-50/50 -mx-6 sm:-mx-8 px-6 sm:px-8 -mb-6 sm:-mb-8 py-5">
                            <Link href={route('scaleups.index')} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm">
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing || gatingBlocked}
                                className="px-6 py-2.5 bg-indigo-600 border border-transparent text-white rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-md disabled:opacity-50 text-sm"
                            >
                                Simpan Scale Up
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
