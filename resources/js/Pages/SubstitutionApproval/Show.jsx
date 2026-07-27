import React, { useState, useRef, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

// Signature Canvas Pad for Modal
function CanvasSignaturePad({ onSave, onCancel }) {
    const canvasRef = useRef(null);
    const [isSigned, setIsSigned] = useState(false);
    let drawing = false;

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#1e3a8a'; // Dark blue ink

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
            drawing = true;
            const pos = getMousePos(e);
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            e.preventDefault();
        };

        const draw = (e) => {
            if (!drawing) return;
            const pos = getMousePos(e);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
            e.preventDefault();
        };

        const stopDrawing = () => {
            if (drawing) {
                drawing = false;
                setIsSigned(true);
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
    }, []);

    const clear = () => {
        setIsSigned(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const save = () => {
        if (!isSigned) return;
        const canvas = canvasRef.current;
        onSave(canvas.toDataURL('image/png'));
    };

    return (
        <div className="flex flex-col items-center">
            <canvas ref={canvasRef} width={400} height={200} className="border border-gray-300 bg-gray-50 rounded-xl cursor-crosshair touch-none shadow-inner" />
            <div className="flex gap-4 mt-4 w-full justify-between">
                <button type="button" onClick={clear} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                    Reset Kanvas
                </button>
                <div className="flex gap-2">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">
                        Batal
                    </button>
                    <button type="button" onClick={save} disabled={!isSigned} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md disabled:opacity-50">
                        Simpan Tanda Tangan
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Show({ auth, approval }) {
    const [activeModal, setActiveModal] = useState(null); // 'packaging_dev', 'qc_supervisor', etc.
    const [decisionState, setDecisionState] = useState('accepted');
    const [notesState, setNotesState] = useState('');
    const [signerName, setSignerName] = useState(auth.user.name);

    const { data, setData, post, processing } = useForm({
        role_type: '',
        signature: '',
        name: '',
        decision: '',
        notes: ''
    });

    const openSignModal = (roleType) => {
        setActiveModal(roleType);
        setDecisionState('accepted');
        setNotesState('');
    };

    const handleSaveSignature = (base64Data) => {
        post(route('substitusi-approvals.decide', approval.id), {
            data: {
                role_type: activeModal,
                signature: base64Data,
                name: signerName,
                decision: ['qc_manager', 'scm_manager', 'qa_manager'].includes(activeModal) ? decisionState : null,
                notes: ['qc_manager', 'scm_manager', 'qa_manager'].includes(activeModal) ? notesState : null
            },
            onSuccess: () => setActiveModal(null)
        });
    };

    const triggerSubmit = () => {
        post(route('substitusi-approvals.submit', approval.id));
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'draft': return { color: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Draft' };
            case 'submitted': return { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Pending' };
            case 'in_review': return { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Pending' };
            case 'approved': return { color: 'bg-green-100 text-green-700 border-green-200', label: 'Closed' };
            case 'rejected': return { color: 'bg-red-100 text-red-700 border-red-200', label: 'Cancel' };
            default: return { color: 'bg-gray-100 text-gray-700 border-gray-200', label: status };
        }
    };

    const statusBadge = getStatusBadge(approval.status);

    const role = auth.user.role?.slug || '';

    // Check who can sign which box
    const canSignPackagingDevLaporan = approval.status === 'draft' && ['admin', 'rd'].includes(role) && !approval.ttd_packaging_dev_laporan;
    const canSignQcManagerLaporan = approval.status === 'draft' && ['admin', 'qc'].includes(role) && !approval.ttd_qc_manager_laporan;

    // Step 3
    const isSubmittedOrReview = ['submitted', 'in_review'].includes(approval.status);
    const canSignPackagingDev = isSubmittedOrReview && ['admin', 'rd'].includes(role) && !approval.ttd_packaging_dev;
    const canSignQcSupervisor = isSubmittedOrReview && ['admin', 'qc'].includes(role) && !approval.ttd_qc_supervisor;

    // Disetujui Oleh (Approvers)
    const canSignQcManager = isSubmittedOrReview && ['admin', 'qc'].includes(role) && !approval.ttd_qc_manager;
    const canSignScmManager = isSubmittedOrReview && ['admin', 'scm'].includes(role) && !approval.ttd_scm_manager;
    const canSignQaManager = isSubmittedOrReview && ['admin', 'qa'].includes(role) && !approval.ttd_qa_manager;

    return (
        <AuthenticatedLayout user={auth.user} header="Detail Form Substitusi Bahan Kemas">
            <Head title={`Form Approval Substitusi - ${approval.document_no}`} />

            <div className="max-w-5xl mx-auto space-y-6 mb-16">

                {/* Status Bar */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${statusBadge.color}`}>
                            {statusBadge.label}
                        </span>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{approval.document_no}</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Dibuat oleh {approval.creator?.name} pada {new Date(approval.created_at).toLocaleDateString('id-ID')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {approval.status === 'draft' && (
                            <button onClick={triggerSubmit} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition-all">
                                Kirim untuk Sirkulasi Approval
                            </button>
                        )}
                        <a
                            href={route('substitusi-approvals.print', approval.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-all inline-flex items-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Cetak Form
                        </a>
                    </div>
                </div>

                {/* Main Premium Document Layout (matches image) */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 sm:p-12 max-w-4xl mx-auto text-black relative">

                    {/* Header Company and logo */}
                    <div className="flex items-center mb-6">
                        <img src="/logo.png" className="h-10 object-contain mr-4" alt="Logo Priskila" />
                        <div className="font-bold text-base tracking-wide uppercase text-gray-800">PT PRISKILA PRIMA MAKMUR</div>
                    </div>

                    {/* Form Title */}
                    <div className="text-center font-bold text-lg border-b border-gray-800 pb-3 mb-6 tracking-wider uppercase text-gray-900">
                        FORM APPROVAL BAHAN KEMAS
                    </div>

                    {/* Information Table */}
                    <div className="overflow-hidden border border-gray-800 rounded-lg mb-6">
                        <table className="w-full border-collapse">
                            <tbody>
                                <tr className="border-b border-gray-800">
                                    <td className="w-1/4 px-4 py-3 font-bold bg-gray-50 border-r border-gray-800 text-sm">Document No.</td>
                                    <td className="w-3/4 px-4 py-3 font-mono font-bold text-sm text-indigo-700">{approval.document_no}</td>
                                </tr>
                                <tr className="border-b border-gray-800">
                                    <td className="px-4 py-3 font-bold bg-gray-50 border-r border-gray-800 text-sm">Nama Produk</td>
                                    <td className="px-4 py-3 text-sm font-semibold">{approval.product_name}</td>
                                </tr>
                                <tr className="border-b border-gray-800">
                                    <td className="px-4 py-3 font-bold bg-gray-50 border-r border-gray-800 text-sm">Jenis Bahan Kemas</td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex items-center gap-4">
                                            {['Primer', 'Sekunder', 'Tersier'].map(type => (
                                                <span key={type} className={`px-2 py-0.5 rounded text-xs ${approval.packaging_type === type ? 'font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 underline' : 'line-through text-gray-400'}`}>
                                                    {type}
                                                </span>
                                            ))}
                                            <span className="text-xs text-gray-400">*</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-800">
                                    <td className="px-4 py-3 font-bold bg-gray-50 border-r border-gray-800 text-sm">Supplier</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{approval.supplier}</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-bold bg-gray-50 border-r border-gray-800 text-sm">Tanggal</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {approval.document_date ? new Date(approval.document_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Gating/Approval Table Block */}
                    <div className="border border-gray-800 rounded-lg overflow-hidden mb-8">
                        <div className="bg-gray-100 border-b border-gray-800 text-center font-bold py-2 text-sm">APPROVAL</div>
                        <div className="flex flex-col md:flex-row">
                            {/* Checkboxes column */}
                            <div className="w-full md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-gray-800 space-y-4">
                                <div className="flex items-center">
                                    <div className="w-5 h-5 border border-gray-800 rounded flex items-center justify-center mr-3 font-bold text-sm bg-white">
                                        {approval.status_approval === 'accepted' ? '✓' : ''}
                                    </div>
                                    <span className="text-sm font-semibold">Sampel dapat diterima</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-5 h-5 border border-gray-800 rounded flex items-center justify-center mr-3 font-bold text-sm bg-white">
                                        {approval.status_approval === 'rejected' ? '✓' : ''}
                                    </div>
                                    <span className="text-sm font-semibold">Sampel tidak dapat diterima</span>
                                </div>
                            </div>
                            {/* Catatan column */}
                            <div className="w-full md:w-1/2 p-6 bg-white flex flex-col justify-start">
                                <div className="text-xs text-gray-500 font-bold mb-2">Catatan:</div>
                                <div className="text-sm text-gray-800 min-h-[50px] whitespace-pre-wrap">{approval.catatan_approval || '-'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Double row signature blocks */}
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        {/* Dibuat Oleh */}
                        <div className="border border-gray-300 rounded-xl p-4 flex flex-col items-center justify-between text-center min-h-[160px] bg-gray-50/20">
                            <span className="text-xs font-bold text-gray-600">Dibuat Oleh,</span>
                            <div className="my-2 h-14 flex items-center justify-center">
                                {approval.ttd_packaging_dev ? (
                                    <div className="flex flex-col items-center">
                                        <img src={approval.ttd_packaging_dev.signature} className="h-12 object-contain" alt="Ttd Packaging Dev" />
                                        <span className="text-[10px] text-gray-400 mt-1">{new Date(approval.ttd_packaging_dev.signed_at).toLocaleDateString('id-ID')}</span>
                                    </div>
                                ) : (
                                    canSignPackagingDev ? (
                                        <button onClick={() => openSignModal('packaging_dev')} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow transition-colors">
                                            ✓ Tanda Tangan
                                        </button>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">Belum ditandatangani</span>
                                    )
                                )}
                            </div>
                            <div className="w-3/4 border-b border-gray-800 my-1"></div>
                            <span className="text-xs font-semibold text-gray-800">{approval.ttd_packaging_dev?.name || 'Packaging Development Staff'}</span>
                        </div>

                        {/* Diperiksa Oleh */}
                        <div className="border border-gray-300 rounded-xl p-4 flex flex-col items-center justify-between text-center min-h-[160px] bg-gray-50/20">
                            <span className="text-xs font-bold text-gray-600">Diperiksa Oleh,</span>
                            <div className="my-2 h-14 flex items-center justify-center">
                                {approval.ttd_qc_supervisor ? (
                                    <div className="flex flex-col items-center">
                                        <img src={approval.ttd_qc_supervisor.signature} className="h-12 object-contain" alt="Ttd QC Supervisor" />
                                        <span className="text-[10px] text-gray-400 mt-1">{new Date(approval.ttd_qc_supervisor.signed_at).toLocaleDateString('id-ID')}</span>
                                    </div>
                                ) : (
                                    canSignQcSupervisor ? (
                                        <button onClick={() => openSignModal('qc_supervisor')} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow transition-colors">
                                            ✓ Tanda Tangan
                                        </button>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">Belum ditandatangani</span>
                                    )
                                )}
                            </div>
                            <div className="w-3/4 border-b border-gray-800 my-1"></div>
                            <span className="text-xs font-semibold text-gray-800">{approval.ttd_qc_supervisor?.name || 'QC Supervisor'}</span>
                        </div>
                    </div>

                    <div className="text-center font-bold text-sm text-gray-600 mb-4 uppercase tracking-wider">Disetujui Oleh,</div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {/* QC Manager */}
                        <div className="border border-gray-300 rounded-xl p-4 flex flex-col items-center justify-between text-center min-h-[160px] bg-gray-50/20">
                            <span className="text-xs font-bold text-gray-600">Disetujui Oleh,</span>
                            <div className="my-2 h-14 flex items-center justify-center">
                                {approval.ttd_qc_manager ? (
                                    <div className="flex flex-col items-center">
                                        <img src={approval.ttd_qc_manager.signature} className="h-12 object-contain" alt="Ttd QC Manager" />
                                        <span className="text-[10px] text-gray-400 mt-1">{new Date(approval.ttd_qc_manager.signed_at).toLocaleDateString('id-ID')}</span>
                                    </div>
                                ) : (
                                    canSignQcManager ? (
                                        <button onClick={() => openSignModal('qc_manager')} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow transition-colors">
                                            ✓ Tanda Tangan
                                        </button>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">Belum ditandatangani</span>
                                    )
                                )}
                            </div>
                            <div className="w-3/4 border-b border-gray-800 my-1"></div>
                            <span className="text-xs font-semibold text-gray-800">{approval.ttd_qc_manager?.name || 'Quality Control Manager'}</span>
                        </div>

                        {/* SCM Manager */}
                        <div className="border border-gray-300 rounded-xl p-4 flex flex-col items-center justify-between text-center min-h-[160px] bg-gray-50/20">
                            <span className="text-xs font-bold text-gray-600">Disetujui Oleh,</span>
                            <div className="my-2 h-14 flex items-center justify-center">
                                {approval.ttd_scm_manager ? (
                                    <div className="flex flex-col items-center">
                                        <img src={approval.ttd_scm_manager.signature} className="h-12 object-contain" alt="Ttd SCM Manager" />
                                        <span className="text-[10px] text-gray-400 mt-1">{new Date(approval.ttd_scm_manager.signed_at).toLocaleDateString('id-ID')}</span>
                                    </div>
                                ) : (
                                    canSignScmManager ? (
                                        <button onClick={() => openSignModal('scm_manager')} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow transition-colors">
                                            ✓ Tanda Tangan
                                        </button>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">Belum ditandatangani</span>
                                    )
                                )}
                            </div>
                            <div className="w-3/4 border-b border-gray-800 my-1"></div>
                            <span className="text-xs font-semibold text-gray-800">{approval.ttd_scm_manager?.name || 'SCM Manager'}</span>
                        </div>

                        {/* QA Manager */}
                        <div className="border border-gray-300 rounded-xl p-4 flex flex-col items-center justify-between text-center min-h-[160px] bg-gray-50/20">
                            <span className="text-xs font-bold text-gray-600">Disetujui Oleh,</span>
                            <div className="my-2 h-14 flex items-center justify-center">
                                {approval.ttd_qa_manager ? (
                                    <div className="flex flex-col items-center">
                                        <img src={approval.ttd_qa_manager.signature} className="h-12 object-contain" alt="Ttd QA Manager" />
                                        <span className="text-[10px] text-gray-400 mt-1">{new Date(approval.ttd_qa_manager.signed_at).toLocaleDateString('id-ID')}</span>
                                    </div>
                                ) : (
                                    canSignQaManager ? (
                                        <button onClick={() => openSignModal('qa_manager')} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow transition-colors">
                                            ✓ Tanda Tangan
                                        </button>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">Belum ditandatangani</span>
                                    )
                                )}
                            </div>
                            <div className="w-3/4 border-b border-gray-800 my-1"></div>
                            <span className="text-xs font-semibold text-gray-800">{approval.ttd_qa_manager?.name || 'QA Manager'}</span>
                        </div>
                    </div>

                    <div className="text-[10px] text-gray-500 italic mt-6">
                        *) coret yang tidak sesuai
                    </div>
                </div>

                {/* Additional Trial and SCM Info Details (Collapse/Display) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                    <h3 className="font-bold text-gray-800 text-sm pb-2 border-b border-gray-100">Detail Laporan Analisa Trial (Step 2)</h3>

                    <div className="overflow-x-auto border border-gray-100 rounded-xl">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 text-center w-12">No</th>
                                    <th className="px-4 py-3">Trial Analisa</th>
                                    <th className="px-4 py-3">Prosedur</th>
                                    <th className="px-4 py-3">Hasil</th>
                                    <th className="px-4 py-3">Petugas & Tanggal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {approval.trial_analisa_data?.map((row, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-3 text-center font-bold text-gray-400">{idx + 1}</td>
                                        <td className="px-4 py-3 font-semibold text-gray-800">{row.trial_nama}</td>
                                        <td className="px-4 py-3 text-gray-600">{row.trial_prosedur}</td>
                                        <td className="px-4 py-3 text-gray-600">{row.trial_hasil}</td>
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            <div>{row.trial_paraf}</div>
                                            <div className="mt-0.5">{row.trial_tanggal ? new Date(row.trial_tanggal).toLocaleDateString('id-ID') : ''}</div>
                                        </td>
                                    </tr>
                                )) || (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-6 text-center text-gray-400 italic">Tidak ada data trial analisa</td>
                                        </tr>
                                    )}
                            </tbody>
                        </table>
                    </div>

                    {approval.packaging_type === 'Primer' && approval.dimension_data && (
                        <div>
                            <h4 className="font-semibold text-sm text-gray-700 mb-2">Hasil Pengukuran Dimensi</h4>
                            <div className="overflow-x-auto border border-gray-100 rounded-xl">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead className="bg-gray-50 text-[10px] font-bold uppercase text-gray-500">
                                        <tr>
                                            <th className="px-4 py-2.5 text-center w-12">No</th>
                                            <th className="px-4 py-2.5">Outside Dia (mm)</th>
                                            <th className="px-4 py-2.5">Inner Dia (mm)</th>
                                            <th className="px-4 py-2.5">Length Liquid (mm)</th>
                                            <th className="px-4 py-2.5">Thick (mm)</th>
                                            <th className="px-4 py-2.5">Weight (g)</th>
                                            <th className="px-4 py-2.5">Leak Test</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {approval.dimension_data.map((row, idx) => (
                                            <tr key={idx}>
                                                <td className="px-4 py-2 text-center text-gray-400">{idx + 1}</td>
                                                <td className="px-4 py-2">{row.outside_diameter}</td>
                                                <td className="px-4 py-2">{row.inner_diameter}</td>
                                                <td className="px-4 py-2">{row.length_fbog}</td>
                                                <td className="px-4 py-2">{row.thick}</td>
                                                <td className="px-4 py-2">{row.weight}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.leak_test === 'OK' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                                        {row.leak_test}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-10 text-sm bg-gray-50 p-4 border border-gray-100 rounded-xl">
                        <div><span className="text-gray-500">Rekomendasi:</span> <span className={`font-bold ${approval.rekomendasi === 'MS' ? 'text-green-700' : 'text-red-700'}`}>{approval.rekomendasi === 'MS' ? 'Memenuhi Syarat (MS)' : 'Tidak Memenuhi Syarat (TMS)'}</span></div>
                        {approval.catatan_rekomendasi && <div><span className="text-gray-500">Catatan Rekomendasi:</span> <span className="font-semibold text-gray-800">{approval.catatan_rekomendasi}</span></div>}
                    </div>
                </div>
            </div>

            {/* Signature Canvas Popup Modal */}
            {activeModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                            <h3 className="font-bold text-gray-900 text-base">Tanda Tangan Approval</h3>
                            <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600">
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nama Lengkap Penandatangan <span className="text-red-500">*</span></label>
                                <input type="text" value={signerName} onChange={e => setSignerName(e.target.value)} className="w-full rounded-lg text-sm border-gray-200 focus:ring-indigo-500" />
                            </div>

                            {['qc_manager', 'scm_manager', 'qa_manager'].includes(activeModal) && (
                                <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Keputusan Persetujuan Sampel</label>
                                        <div className="flex gap-4 mt-1">
                                            <label className="inline-flex items-center text-sm font-semibold">
                                                <input type="radio" value="accepted" checked={decisionState === 'accepted'} onChange={() => setDecisionState('accepted')} className="text-indigo-600 mr-2" />
                                                Setujui (Diterima)
                                            </label>
                                            <label className="inline-flex items-center text-sm font-semibold">
                                                <input type="radio" value="rejected" checked={decisionState === 'rejected'} onChange={() => setDecisionState('rejected')} className="text-red-600 mr-2" />
                                                Tolak (Tidak Diterima)
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Catatan Approval {decisionState === 'rejected' && <span className="text-red-500">*</span>}</label>
                                        <textarea value={notesState} onChange={e => setNotesState(e.target.value)} rows="2" className="w-full rounded-lg text-xs border-gray-200" placeholder="Ketik catatan di sini..." />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Gambarkan Tanda Tangan Anda</label>
                                <CanvasSignaturePad
                                    onCancel={() => setActiveModal(null)}
                                    onSave={handleSaveSignature}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
