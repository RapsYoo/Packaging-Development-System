import React, { useState, useRef, useEffect, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

// Lightweight Canvas Signature Pad Component
function SignaturePad({ onSave, onClear, defaultValue }) {
    const canvasRef = useRef(null);
    const [isSigned, setIsSigned] = useState(!!defaultValue);
    const [sigImage, setSigImage] = useState(defaultValue || null);
    const drawingRef = useRef(false);

    useEffect(() => {
        if (defaultValue) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';

        const getMousePos = (e) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
            const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        };

        const startDrawing = (e) => {
            drawingRef.current = true;
            const pos = getMousePos(e);
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            e.preventDefault();
        };

        const draw = (e) => {
            if (!drawingRef.current) return;
            const pos = getMousePos(e);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
            e.preventDefault();
        };

        const stopDrawing = () => {
            if (drawingRef.current) {
                drawingRef.current = false;
                const dataUrl = canvas.toDataURL('image/png');
                setSigImage(dataUrl);
                setIsSigned(true);
                onSave(dataUrl);
            }
        };

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);

        canvas.addEventListener('touchstart', startDrawing);
        canvas.addEventListener('touchmove', draw);
        canvas.addEventListener('touchend', stopDrawing);

        return () => {
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('mouseleave', stopDrawing);
            canvas.removeEventListener('touchstart', startDrawing);
            canvas.removeEventListener('touchmove', draw);
            canvas.removeEventListener('touchend', stopDrawing);
        };
    }, [sigImage, defaultValue]);

    const clear = () => {
        setSigImage(null);
        setIsSigned(false);
        onClear();
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    if (defaultValue) {
        return (
            <div className="flex flex-col items-center">
                <img src={defaultValue} className="h-20 border border-gray-200 bg-gray-50 rounded p-1 object-contain" alt="Tanda tangan" />
                <span className="text-xs text-green-600 font-semibold mt-1">✓ Ditandatangani</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center">
            {sigImage ? (
                <div className="relative group border border-gray-300 rounded overflow-hidden">
                    <img src={sigImage} className="h-20 w-[180px] bg-white object-contain" alt="Preview Tanda Tangan" />
                    <button type="button" onClick={clear} className="absolute inset-0 bg-black/50 text-white font-medium text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        Hapus & Ulangi
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center">
                    <canvas ref={canvasRef} width={180} height={80} className="border border-gray-300 bg-gray-50 rounded cursor-crosshair touch-none" />
                    <span className="text-[10px] text-gray-400 mt-1">Gambarkan ttd di atas kanvas</span>
                </div>
            )}
        </div>
    );
}

export default function Create({ auth, projects, users, masterSpecs, nextDocumentNo, editMode = false, approvalData = null }) {
    const [step, setStep] = useState(1);
    
    // Master Spec Cascading Selector State
    const [selectedFgCode, setSelectedFgCode] = useState('');
    const [selectedRmId, setSelectedRmId] = useState('');
    const [fgSearchQuery, setFgSearchQuery] = useState('');
    const [existingSupplier, setExistingSupplier] = useState('');

    // Unique list of Finished Goods (FG)
    const uniqueFgList = useMemo(() => {
        if (!masterSpecs) return [];
        const map = new Map();
        masterSpecs.forEach(spec => {
            const fgCode = spec.item_code_fg || 'NON_FG';
            if (!map.has(fgCode)) {
                map.set(fgCode, {
                    code: spec.item_code_fg || '-',
                    name: spec.item_name_fg || spec.item_name_rm || '-',
                });
            }
        });
        return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
    }, [masterSpecs]);

    const filteredFgList = useMemo(() => {
        if (!fgSearchQuery.trim()) return uniqueFgList;
        const query = fgSearchQuery.toLowerCase();
        return uniqueFgList.filter(fg =>
            fg.code.toLowerCase().includes(query) ||
            fg.name.toLowerCase().includes(query)
        );
    }, [uniqueFgList, fgSearchQuery]);

    // Material RM list for the selected FG
    const rmListForSelectedFg = useMemo(() => {
        if (!selectedFgCode || !masterSpecs) return [];
        return masterSpecs.filter(spec => spec.item_code_fg === selectedFgCode);
    }, [selectedFgCode, masterSpecs]);

    const handleFgSelect = (fgCode) => {
        setSelectedFgCode(fgCode);
        setSelectedRmId('');
        setExistingSupplier('');
    };

    const handleRmSelect = (rmId) => {
        setSelectedRmId(rmId);
        if (!rmId) return;
        const rmSpec = masterSpecs?.find(s => String(s.id) === String(rmId));
        if (rmSpec) {
            const prodName = rmSpec.item_name_rm || rmSpec.item_name_fg || '';
            const oldSupplier = rmSpec.supplier || '';
            setExistingSupplier(oldSupplier);
            setData(prev => ({
                ...prev,
                product_name: prodName,
                supplier: oldSupplier,
                packaging_type: (rmSpec.tipe && ['Primer', 'Sekunder', 'Tersier'].includes(rmSpec.tipe)) ? rmSpec.tipe : prev.packaging_type,
            }));
        }
    };

    // Initial structures
    const emptyTrialRow = () => ({ trial_nama: '', trial_prosedur: '', trial_hasil: '', trial_paraf: '', trial_tanggal: new Date().toISOString().split('T')[0] });
    const emptyDimRow = () => ({ outside_diameter: '', inner_diameter: '', length_fbog: '', thick: '', weight: '', leak_test: 'OK' });

    const { data, setData, post, put, processing, errors } = useForm({
        project_id: approvalData?.project_id || '',
        product_name: approvalData?.product_name || '',
        packaging_type: approvalData?.packaging_type || 'Primer',
        supplier: approvalData?.supplier || '',
        document_date: approvalData?.document_date || new Date().toISOString().split('T')[0],
        
        // Step 1: Info & SCM
        alasan_pengajuan: approvalData?.alasan_pengajuan || 'Quality Complaint',
        alasan_lainnya: approvalData?.alasan_lainnya || '',
        harga_penawaran: approvalData?.harga_penawaran || '',
        harga_existing: approvalData?.harga_existing || '',
        estimasi_lead_time: approvalData?.estimasi_lead_time || '',
        notes: approvalData?.notes || '',
        attachment_files: approvalData?.attachment_files || [],

        // Step 2: Trial
        trial_analisa_data: approvalData?.trial_analisa_data || [emptyTrialRow()],
        dimension_data: approvalData?.dimension_data || [emptyDimRow(), emptyDimRow(), emptyDimRow()], // min 3 rows
        rekomendasi: approvalData?.rekomendasi || 'MS',
        catatan_rekomendasi: approvalData?.catatan_rekomendasi || '',
        ttd_packaging_dev_laporan: approvalData?.ttd_packaging_dev_laporan || null,
        ttd_qc_manager_laporan: approvalData?.ttd_qc_manager_laporan || null,

        // Step 3
        status_approval: approvalData?.status_approval || 'accepted',
        catatan_approval: approvalData?.catatan_approval || '',
        save_draft: true
    });

    // Handle Trial Analisa dynamic table
    const addTrialRow = () => setData('trial_analisa_data', [...data.trial_analisa_data, emptyTrialRow()]);
    const removeTrialRow = (index) => {
        const updated = [...data.trial_analisa_data];
        updated.splice(index, 1);
        setData('trial_analisa_data', updated);
    };
    const handleTrialChange = (index, field, val) => {
        const updated = [...data.trial_analisa_data];
        updated[index][field] = val;
        setData('trial_analisa_data', updated);
    };

    // Handle Dimension Measurements dynamic table
    const addDimRow = () => setData('dimension_data', [...data.dimension_data, emptyDimRow()]);
    const removeDimRow = (index) => {
        const updated = [...data.dimension_data];
        updated.splice(index, 1);
        setData('dimension_data', updated);
    };
    const handleDimChange = (index, field, val) => {
        const updated = [...data.dimension_data];
        updated[index][field] = val;
        setData('dimension_data', updated);
    };

    // Calculate averages dynamically
    const [averages, setAverages] = useState({
        outside_diameter: 0,
        inner_diameter: 0,
        length_fbog: 0,
        thick: 0,
        weight: 0
    });

    useEffect(() => {
        const fields = ['outside_diameter', 'inner_diameter', 'length_fbog', 'thick', 'weight'];
        const results = {};
        fields.forEach(f => {
            const vals = data.dimension_data.map(d => parseFloat(d[f])).filter(val => !isNaN(val));
            results[f] = vals.length > 0 ? (vals.reduce((sum, current) => sum + current, 0) / vals.length).toFixed(2) : '0.00';
        });
        setAverages(results);
    }, [data.dimension_data]);

    // Validation
    const validateStep1 = () => {
        if (!data.product_name) return 'Nama Produk wajib diisi';
        if (!data.supplier) return 'Nama Supplier wajib diisi';
        if (data.alasan_pengajuan === 'Lainnya' && !data.alasan_lainnya) return 'Alasan lainnya wajib diisi';
        return null;
    };

    const validateStep2 = () => {
        if (data.trial_analisa_data.length === 0 || !data.trial_analisa_data[0].trial_nama) {
            return 'Tabel Trial Analisa minimal diisi 1 baris';
        }
        if (data.packaging_type === 'Primer' && data.dimension_data.length < 3) {
            return 'Tabel Pengukuran Dimensi minimal diisi 3 baris';
        }
        if (data.rekomendasi === 'TMS' && !data.catatan_rekomendasi) {
            return 'Catatan rekomendasi wajib diisi jika Tidak Memenuhi Syarat (TMS)';
        }
        return null;
    };

    const handleNext = () => {
        if (step === 1) {
            const err = validateStep1();
            if (err) {
                alert(err);
                return;
            }
            setStep(2);
        } else if (step === 2) {
            const err = validateStep2();
            if (err) {
                alert(err);
                return;
            }
            setStep(3);
        }
    };

    const handleBack = () => setStep(step - 1);

    const submitForm = (isDraft) => {
        data.save_draft = isDraft;
        if (editMode) {
            put(route('substitusi-approvals.update', approvalData.id));
        } else {
            post(route('substitusi-approvals.store'));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} header={`${editMode ? 'Edit' : 'Buat'} Form Approval Substitusi`}>
            <Head title={`${editMode ? 'Edit' : 'Buat'} Form Approval Substitusi`} />

            <div className="max-w-6xl mx-auto mb-10">
                {/* Stepper Progress */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 sticky top-16 z-20">
                    <div className="flex items-center justify-between max-w-3xl mx-auto">
                        <div className={`flex flex-col items-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= 1 ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}>1</div>
                            <span className="text-xs font-semibold mt-1">Data Umum</span>
                        </div>
                        <div className={`flex-1 h-0.5 mx-4 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                        <div className={`flex flex-col items-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= 2 ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}>2</div>
                            <span className="text-xs font-semibold mt-1">Trial Analisa</span>
                        </div>
                        <div className={`flex-1 h-0.5 mx-4 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                        <div className={`flex flex-col items-center ${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= 3 ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}>3</div>
                            <span className="text-xs font-semibold mt-1">Persetujuan</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <h3 className="font-bold text-gray-800">
                            {step === 1 && 'Langkah 1: Data Umum & Informasi Pengajuan'}
                            {step === 2 && 'Langkah 2: Laporan Trial Analisa & Dimensi'}
                            {step === 3 && 'Langkah 3: Ringkasan & Sirkulasi Approval'}
                        </h3>
                        <Link href={route('substitusi-approvals.index')} className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
                            &larr; Batalkan
                        </Link>
                    </div>

                    <div className="p-6 sm:p-8">
                        {/* ── STEP 1: GENERAL INFO ── */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Dokumen</label>
                                        <input type="text" value={approvalData?.document_no || nextDocumentNo} readOnly className="w-full rounded-lg bg-gray-50 text-gray-500 font-mono text-sm border-gray-200" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Pengajuan <span className="text-red-500">*</span></label>
                                        <input type="date" value={data.document_date} onChange={e => setData('document_date', e.target.value)} className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Hubungkan dengan Proyek (Optional)</label>
                                        <select value={data.project_id} onChange={e => setData('project_id', e.target.value)} className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm text-gray-700">
                                            <option value="">-- Tanpa Hubungan Proyek --</option>
                                            {projects.map(p => (
                                                <option key={p.id} value={p.id}>{p.code} - {p.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {/* ── MASTER SPEC CASCADING SELECTOR (FG -> RM) ── */}
                                    <div className="md:col-span-2 bg-gradient-to-r from-indigo-50/80 to-blue-50/80 p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                                                <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                                Pilih Produk dari Master Database Spec
                                            </label>
                                            {selectedFgCode && (
                                                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                                                    Kode FG: {selectedFgCode}
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Step 1: Search & Select FG */}
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                    1. Cari / Pilih Produk FG (Finished Goods)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={fgSearchQuery}
                                                    onChange={e => setFgSearchQuery(e.target.value)}
                                                    placeholder="Ketik kode FG atau nama produk (misal: FGBMA2001 / Camellia)..."
                                                    className="w-full rounded-lg border-indigo-200 focus:ring-indigo-500 text-sm mb-2 bg-white"
                                                />
                                                <select
                                                    value={selectedFgCode}
                                                    onChange={e => handleFgSelect(e.target.value)}
                                                    className="w-full rounded-lg border-indigo-200 focus:ring-indigo-500 text-sm bg-white text-gray-800 font-medium"
                                                >
                                                    <option value="">-- Pilih Produk FG ({filteredFgList.length} ditemukan) --</option>
                                                    {filteredFgList.map(fg => (
                                                        <option key={fg.code} value={fg.code}>
                                                            [{fg.code}] {fg.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Step 2: Select Material RM for selected FG */}
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                    2. Pilih Material Kemasan (RM)
                                                </label>
                                                <select
                                                    value={selectedRmId}
                                                    onChange={e => handleRmSelect(e.target.value)}
                                                    disabled={!selectedFgCode}
                                                    className={`w-full rounded-lg border-indigo-200 focus:ring-indigo-500 text-sm bg-white font-medium ${!selectedFgCode ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'text-gray-800'}`}
                                                >
                                                    <option value="">
                                                        {!selectedFgCode ? '-- Pilih Produk FG Terlebih Dahulu --' : `-- Pilih Material RM (${rmListForSelectedFg.length} item) --`}
                                                    </option>
                                                    {rmListForSelectedFg.map(rm => (
                                                        <option key={rm.id} value={rm.id}>
                                                            [{rm.item_code_rm}] {rm.item_name_rm} {rm.supplier ? `(Supplier: ${rm.supplier})` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                                {selectedFgCode && (
                                                    <p className="text-[11px] text-indigo-600 mt-1 font-medium">
                                                        ✓ Tersedia {rmListForSelectedFg.length} komponen RM untuk produk {selectedFgCode}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Field Nama Produk */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Nama Produk <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={data.product_name}
                                            onChange={e => setData('product_name', e.target.value)}
                                            placeholder="Contoh: Partisi inner Camellia Bodymist..."
                                            className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm"
                                        />
                                        <p className="text-[11px] text-gray-400 mt-1">Terisi otomatis saat memilih RM Material di atas, atau ketik manual.</p>
                                    </div>

                                    {/* Field Jenis Bahan Kemas */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Bahan Kemas</label>
                                        <div className="flex items-center gap-6 mt-2">
                                            {['Primer', 'Sekunder', 'Tersier'].map(type => (
                                                <label key={type} className="inline-flex items-center text-sm font-medium text-gray-700">
                                                    <input type="radio" name="packaging_type" value={type} checked={data.packaging_type === type} onChange={e => setData('packaging_type', e.target.value)} className="text-indigo-600 focus:ring-indigo-500 mr-2" />
                                                    {type}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Field Supplier Baru & Supplier Lama Badge */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm font-medium text-gray-700">Nama Supplier Baru <span className="text-red-500">*</span></label>
                                            {existingSupplier && (
                                                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                                                    <span>Supplier Existing:</span>
                                                    <span className="underline">{existingSupplier}</span>
                                                </span>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            value={data.supplier}
                                            onChange={e => setData('supplier', e.target.value)}
                                            placeholder="Nama PT Supplier Baru..."
                                            className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm"
                                        />
                                        <p className="text-[11px] text-gray-400 mt-1">Nama supplier terisi otomatis dari data existing. Silakan ubah ke nama supplier baru yang diajukan.</p>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-6">
                                    <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4">Informasi SCM & Komersial</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Alasan Pengajuan</label>
                                            <select value={data.alasan_pengajuan} onChange={e => setData('alasan_pengajuan', e.target.value)} className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm text-gray-700">
                                                <option value="Quality Complaint">Quality Complaint</option>
                                                <option value="Miss Lead Time">Miss Lead Time</option>
                                                <option value="Kapasitas">Kapasitas</option>
                                                <option value="Lainnya">Lainnya</option>
                                            </select>
                                        </div>
                                        {data.alasan_pengajuan === 'Lainnya' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Detail Alasan Lainnya <span className="text-red-500">*</span></label>
                                                <textarea value={data.alasan_lainnya} onChange={e => setData('alasan_lainnya', e.target.value)} rows="2" className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500" placeholder="Tulis alasan detail pengajuan..." />
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Harga Penawaran (Quotation)</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-400 sm:text-sm">Rp</span></div>
                                                <input type="number" value={data.harga_penawaran} onChange={e => setData('harga_penawaran', e.target.value)} className="w-full rounded-lg pl-10 border-gray-200 focus:ring-indigo-500 text-sm" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Harga Existing (Perbandingan)</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-400 sm:text-sm">Rp</span></div>
                                                <input type="number" value={data.harga_existing} onChange={e => setData('harga_existing', e.target.value)} className="w-full rounded-lg pl-10 border-gray-200 focus:ring-indigo-500 text-sm" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Estimasi Lead Time (Hari)</label>
                                            <input type="number" value={data.estimasi_lead_time} onChange={e => setData('estimasi_lead_time', e.target.value)} placeholder="Contoh: 14" className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Tambahan</label>
                                            <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows="3" className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500" placeholder="Keterangan komersial lainnya..." />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 2: TRIAL ANALISA ── */}
                        {step === 2 && (
                            <div className="space-y-8">
                                {/* 2A. Tabel Trial Analisa */}
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider">2A. Tabel Trial Analisa</h4>
                                        <button type="button" onClick={addTrialRow} className="px-3 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors">
                                            + Tambah Baris
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto border border-gray-100 rounded-xl">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                                                    <th className="px-4 py-3 w-12 text-center">No</th>
                                                    <th className="px-4 py-3 w-[250px]">Trial Analisa</th>
                                                    <th className="px-4 py-3">Prosedur</th>
                                                    <th className="px-4 py-3">Hasil</th>
                                                    <th className="px-4 py-3 w-[150px]">Paraf & Tanggal</th>
                                                    <th className="px-4 py-3 w-16 text-center">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 text-sm">
                                                {data.trial_analisa_data.map((row, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-4 py-3 text-center text-gray-500 font-bold">{idx + 1}</td>
                                                        <td className="px-4 py-3">
                                                            <input type="text" value={row.trial_nama} onChange={e => handleTrialChange(idx, 'trial_nama', e.target.value)} placeholder="Contoh: Leak Test" className="w-full rounded-lg border-gray-200 text-xs" />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <textarea value={row.trial_prosedur} onChange={e => handleTrialChange(idx, 'trial_prosedur', e.target.value)} rows="2" placeholder="Prosedur analisa..." className="w-full rounded-lg border-gray-200 text-xs" />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <textarea value={row.trial_hasil} onChange={e => handleTrialChange(idx, 'trial_hasil', e.target.value)} rows="2" placeholder="Hasil analisa..." className="w-full rounded-lg border-gray-200 text-xs" />
                                                        </td>
                                                        <td className="px-4 py-3 space-y-2">
                                                            <input type="text" value={row.trial_paraf} onChange={e => handleTrialChange(idx, 'trial_paraf', e.target.value)} placeholder="Paraf/Nama" className="w-full rounded-lg border-gray-200 text-xs" />
                                                            <input type="date" value={row.trial_tanggal} onChange={e => handleTrialChange(idx, 'trial_tanggal', e.target.value)} className="w-full rounded-lg border-gray-200 text-xs" />
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <button type="button" onClick={() => removeTrialRow(idx)} className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors">
                                                                🗑
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* 2B. Tabel Lampiran — Dimensi (Sembunyikan jika bukan Primer) */}
                                {data.packaging_type === 'Primer' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <div>
                                                <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider">2B. Tabel Lampiran — Data Pengukuran Dimensi (Kemasan Primer)</h4>
                                                <p className="text-xs text-gray-500 mt-0.5">Average dihitung otomatis. Minimal masukkan 3 baris pengukuran.</p>
                                            </div>
                                            <button type="button" onClick={addDimRow} className="px-3 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors">
                                                + Tambah Sampel
                                            </button>
                                        </div>
                                        <div className="overflow-x-auto border border-gray-100 rounded-xl">
                                            <table className="w-full text-left border-collapse min-w-[800px]">
                                                <thead>
                                                    <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                                                        <th className="px-4 py-3 w-12 text-center">No</th>
                                                        <th className="px-4 py-3">Outside Diameter (mm)</th>
                                                        <th className="px-4 py-3">Inner Diameter (mm)</th>
                                                        <th className="px-4 py-3">Length Tube – FBOG (mm)</th>
                                                        <th className="px-4 py-3">Thick (mm)</th>
                                                        <th className="px-4 py-3">Weight (g)</th>
                                                        <th className="px-4 py-3">Leak Test</th>
                                                        <th className="px-4 py-3 w-16 text-center">Aksi</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 text-sm">
                                                    {data.dimension_data.map((row, idx) => (
                                                        <tr key={idx}>
                                                            <td className="px-4 py-3 text-center text-gray-500 font-bold">{idx + 1}</td>
                                                            {['outside_diameter', 'inner_diameter', 'length_fbog', 'thick', 'weight'].map(field => (
                                                                <td className="px-4 py-3" key={field}>
                                                                    <input type="number" step="0.01" value={row[field]} onChange={e => handleDimChange(idx, field, e.target.value)} className="w-full rounded-lg border-gray-200 text-xs" />
                                                                </td>
                                                            ))}
                                                            <td className="px-4 py-3">
                                                                <select value={row.leak_test} onChange={e => handleDimChange(idx, 'leak_test', e.target.value)} className="w-full rounded-lg border-gray-200 text-xs">
                                                                    <option value="OK">OK</option>
                                                                    <option value="NOT OK">NOT OK</option>
                                                                </select>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                {data.dimension_data.length > 3 && (
                                                                    <button type="button" onClick={() => removeDimRow(idx)} className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors">
                                                                        🗑
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {/* AVERAGE ROW */}
                                                    <tr className="bg-indigo-50/30 font-semibold border-t-2 border-indigo-100">
                                                        <td className="px-4 py-3 text-center text-indigo-700">AVG</td>
                                                        <td className="px-4 py-3 text-indigo-700">{averages.outside_diameter}</td>
                                                        <td className="px-4 py-3 text-indigo-700">{averages.inner_diameter}</td>
                                                        <td className="px-4 py-3 text-indigo-700">{averages.length_fbog}</td>
                                                        <td className="px-4 py-3 text-indigo-700">{averages.thick}</td>
                                                        <td className="px-4 py-3 text-indigo-700">{averages.weight}</td>
                                                        <td className="px-4 py-3 text-indigo-700">—</td>
                                                        <td className="px-4 py-3"></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* 2C. Rekomendasi */}
                                <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Rekomendasi Uji Laporan</label>
                                        <div className="flex items-center gap-6 mt-2">
                                            <label className="inline-flex items-center text-sm font-semibold text-gray-700">
                                                <input type="radio" name="rekomendasi" value="MS" checked={data.rekomendasi === 'MS'} onChange={e => setData('rekomendasi', e.target.value)} className="text-indigo-600 focus:ring-indigo-500 mr-2" />
                                                MS (Memenuhi Syarat)
                                            </label>
                                            <label className="inline-flex items-center text-sm font-semibold text-gray-700">
                                                <input type="radio" name="rekomendasi" value="TMS" checked={data.rekomendasi === 'TMS'} onChange={e => setData('rekomendasi', e.target.value)} className="text-indigo-600 focus:ring-indigo-500 mr-2" />
                                                TMS (Tidak Memenuhi Syarat)
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Rekomendasi {data.rekomendasi === 'TMS' && <span className="text-red-500">*</span>}</label>
                                        <textarea value={data.catatan_rekomendasi} onChange={e => setData('catatan_rekomendasi', e.target.value)} rows="2" className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500" placeholder="Berikan catatan kesimpulan trial..." />
                                    </div>
                                </div>

                                {/* 2D. Tanda Tangan Laporan */}
                                <div className="border-t border-gray-100 pt-6">
                                    <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4">2D. Penandatangan Laporan Trial</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-4 bg-white border border-gray-200 rounded-xl flex flex-col items-center">
                                            <span className="font-semibold text-sm text-gray-700 mb-2">Dibuat Oleh (Packaging Dev Staff)</span>
                                            <input type="text" placeholder="Nama Lengkap Pembuat" value={data.ttd_packaging_dev_laporan?.name || ''} onChange={e => setData('ttd_packaging_dev_laporan', { ...data.ttd_packaging_dev_laporan, name: e.target.value })} className="w-full rounded-lg text-sm border-gray-200 mb-3 text-center" />
                                            <SignaturePad 
                                                defaultValue={data.ttd_packaging_dev_laporan?.signature}
                                                onSave={(base64) => setData('ttd_packaging_dev_laporan', { ...data.ttd_packaging_dev_laporan, signature: base64, signed_at: new Date().toISOString() })}
                                                onClear={() => setData('ttd_packaging_dev_laporan', { ...data.ttd_packaging_dev_laporan, signature: '' })}
                                            />
                                        </div>
                                        <div className="p-4 bg-white border border-gray-200 rounded-xl flex flex-col items-center">
                                            <span className="font-semibold text-sm text-gray-700 mb-2">Diperiksa Oleh (QC Manager)</span>
                                            <input type="text" placeholder="Nama Lengkap Pemeriksa" value={data.ttd_qc_manager_laporan?.name || ''} onChange={e => setData('ttd_qc_manager_laporan', { ...data.ttd_qc_manager_laporan, name: e.target.value })} className="w-full rounded-lg text-sm border-gray-200 mb-3 text-center" />
                                            <SignaturePad 
                                                defaultValue={data.ttd_qc_manager_laporan?.signature}
                                                onSave={(base64) => setData('ttd_qc_manager_laporan', { ...data.ttd_qc_manager_laporan, signature: base64, signed_at: new Date().toISOString() })}
                                                onClear={() => setData('ttd_qc_manager_laporan', { ...data.ttd_qc_manager_laporan, signature: '' })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 3: SUMMARY & APPROVAL CIRCULATION ── */}
                        {step === 3 && (
                            <div className="space-y-8">
                                <div className="p-6 bg-indigo-50/30 rounded-xl border border-indigo-100/50">
                                    <h4 className="font-bold text-indigo-900 text-sm mb-3">Ringkasan Form Substitusi</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 text-sm">
                                        <div className="flex justify-between border-b border-indigo-50/50 py-1"><span className="text-gray-500">Document No:</span><span className="font-bold text-gray-900">{approvalData?.document_no || 'SUB-(Auto Generate)'}</span></div>
                                        <div className="flex justify-between border-b border-indigo-50/50 py-1"><span className="text-gray-500">Nama Produk:</span><span className="font-semibold text-gray-900">{data.product_name}</span></div>
                                        <div className="flex justify-between border-b border-indigo-50/50 py-1"><span className="text-gray-500">Jenis Kemasan:</span><span className="font-semibold text-gray-900">{data.packaging_type}</span></div>
                                        <div className="flex justify-between border-b border-indigo-50/50 py-1"><span className="text-gray-500">Supplier:</span><span className="font-semibold text-gray-900">{data.supplier}</span></div>
                                        <div className="flex justify-between border-b border-indigo-50/50 py-1"><span className="text-gray-500">Alasan:</span><span className="font-semibold text-gray-900">{data.alasan_pengajuan}</span></div>
                                        <div className="flex justify-between border-b border-indigo-50/50 py-1"><span className="text-gray-500">Rekomendasi:</span><span className="font-bold text-green-700">{data.rekomendasi === 'MS' ? 'Memenuhi Syarat (MS)' : 'Tidak Memenuhi Syarat (TMS)'}</span></div>
                                    </div>
                                </div>

                                {/* Step 3 signature placeholders or preview */}
                                <div className="p-6 border border-gray-100 rounded-xl">
                                    <h4 className="font-bold text-gray-800 text-sm mb-4 text-center">Form Approval Alur Sirkulasi Tanda Tangan</h4>
                                    
                                    <div className="flex justify-between gap-4 flex-wrap">
                                        <div className="flex-1 min-w-[150px] border border-gray-200 rounded-lg p-3 text-center">
                                            <div className="text-xs text-gray-500 mb-6">Dibuat Oleh</div>
                                            <div className="h-0.5 bg-gray-200 w-3/4 mx-auto mb-2"></div>
                                            <div className="text-xs font-semibold">Packaging Dev Staff</div>
                                            <div className="text-[10px] text-yellow-600 mt-1 font-bold">⏳ Menunggu Kirim</div>
                                        </div>
                                        <div className="flex-1 min-w-[150px] border border-gray-200 rounded-lg p-3 text-center">
                                            <div className="text-xs text-gray-500 mb-6">Diperiksa Oleh</div>
                                            <div className="h-0.5 bg-gray-200 w-3/4 mx-auto mb-2"></div>
                                            <div className="text-xs font-semibold">QC Supervisor</div>
                                            <div className="text-[10px] text-gray-400 mt-1 font-bold">⏳ Antrean</div>
                                        </div>
                                        <div className="flex-1 min-w-[150px] border border-gray-200 rounded-lg p-3 text-center">
                                            <div className="text-xs text-gray-500 mb-6">Disetujui Oleh</div>
                                            <div className="h-0.5 bg-gray-200 w-3/4 mx-auto mb-2"></div>
                                            <div className="text-xs font-semibold">QC Manager</div>
                                            <div className="text-[10px] text-gray-400 mt-1 font-bold">⏳ Antrean</div>
                                        </div>
                                        <div className="flex-1 min-w-[150px] border border-gray-200 rounded-lg p-3 text-center">
                                            <div className="text-xs text-gray-500 mb-6">Disetujui Oleh</div>
                                            <div className="h-0.5 bg-gray-200 w-3/4 mx-auto mb-2"></div>
                                            <div className="text-xs font-semibold">SCM Manager</div>
                                            <div className="text-[10px] text-gray-400 mt-1 font-bold">⏳ Antrean</div>
                                        </div>
                                        <div className="flex-1 min-w-[150px] border border-gray-200 rounded-lg p-3 text-center">
                                            <div className="text-xs text-gray-500 mb-6">Disetujui Oleh</div>
                                            <div className="h-0.5 bg-gray-200 w-3/4 mx-auto mb-2"></div>
                                            <div className="text-xs font-semibold">QA Manager</div>
                                            <div className="text-[10px] text-gray-400 mt-1 font-bold">⏳ Antrean</div>
                                        </div>
                                    </div>
                                    <div className="text-[11px] text-gray-400 text-center italic mt-6">
                                        *) sirkulasi approval akan dimulai setelah Anda menekan tombol "Kirim untuk Sirkulasi"
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="bg-gray-50 border-t border-gray-100 px-6 py-5 flex items-center justify-between">
                        <div>
                            {step > 1 && (
                                <button type="button" onClick={handleBack} className="px-5 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg font-medium text-sm transition-colors">
                                    &larr; Kembali
                                </button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => submitForm(true)} className="px-5 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium text-sm transition-colors">
                                Simpan Draft
                            </button>
                            {step < 3 ? (
                                <button type="button" onClick={handleNext} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors">
                                    Lanjut &rarr;
                                </button>
                            ) : (
                                <button type="button" onClick={() => submitForm(false)} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors shadow-md">
                                    Kirim untuk Sirkulasi &rarr;
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
