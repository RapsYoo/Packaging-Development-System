import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Show({ auth, scaleUp }) {
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);

    const userRole = auth.user.role?.slug;
    const canEdit = ['admin', 'rd', 'qc'].includes(userRole) && ['draft', 'rejected'].includes(scaleUp.status);
    const canSubmit = ['admin', 'rd', 'qc'].includes(userRole) && scaleUp.status === 'draft';
    const canApprove = ['admin', 'qc'].includes(userRole) && scaleUp.status === 'in_review';
    const canPublish = userRole === 'admin' && scaleUp.status === 'approved';
    const canDelete = ['admin', 'rd', 'qc'].includes(userRole) && ['draft', 'rejected'].includes(scaleUp.status);

    const getStatusBadge = (status) => {
        const styles = {
            draft: 'bg-gray-100 text-gray-700 border-gray-300',
            in_review: 'bg-amber-100 text-amber-800 border-amber-300',
            approved: 'bg-green-100 text-green-800 border-green-300',
            rejected: 'bg-red-100 text-red-800 border-red-300',
            published: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        };
        const labels = { draft: 'Draft', in_review: 'Dalam Review', approved: 'Disetujui', rejected: 'Ditolak', published: 'Diterbitkan' };
        return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${styles[status]}`}>{labels[status]}</span>;
    };

    const handleSubmit = () => {
        if (confirm('Ajukan Scale Up ini untuk review QC/Admin?')) {
            router.post(route('scaleups.submit', scaleUp.id));
        }
    };
    const handleApprove = () => {
        if (confirm('Setujui spesifikasi bahan pengemas ini?')) {
            router.post(route('scaleups.approve', scaleUp.id));
        }
    };
    const handleReject = () => {
        if (!rejectReason.trim()) return alert('Harap isi alasan penolakan.');
        router.post(route('scaleups.reject', scaleUp.id), { rejection_reason: rejectReason });
    };
    const handlePublish = () => {
        if (confirm('Terbitkan Scale Up ini sebagai standar resmi? Setelah diterbitkan, dokumen ini bisa dicetak sebagai PDF.')) {
            router.post(route('scaleups.publish', scaleUp.id));
        }
    };
    const handleDelete = () => {
        if (confirm('Hapus Scale Up ini secara permanen?')) {
            router.delete(route('scaleups.destroy', scaleUp.id));
        }
    };

    const SpecRow = ({ label, value, method }) => (
        <tr className="border-b border-gray-100 hover:bg-gray-50/50">
            <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50/80 w-[200px]">{label}</td>
            <td className="px-4 py-3 text-sm text-gray-800">{value || <span className="text-gray-400 italic">-</span>}</td>
            {method !== undefined && <td className="px-4 py-3 text-sm text-gray-500 w-[160px]">{method}</td>}
        </tr>
    );

    return (
        <AuthenticatedLayout user={auth.user} header={`Scale Up: ${scaleUp.code}`}>
            <Head title={`Scale Up ${scaleUp.code}`} />

            <div className="max-w-6xl mx-auto space-y-6">
                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Link href={route('scaleups.index')} className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">&larr; Kembali ke Daftar Scale Up</Link>
                    <div className="flex flex-wrap gap-2">
                        {canEdit && (
                            <Link href={route('scaleups.edit', scaleUp.id)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                                Edit
                            </Link>
                        )}
                        {canSubmit && (
                            <button onClick={handleSubmit} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600 transition-colors shadow-sm">
                                Ajukan Review →
                            </button>
                        )}
                        {canApprove && (
                            <>
                                <button onClick={handleApprove} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-sm">
                                    ✓ Setujui
                                </button>
                                <button onClick={() => setShowRejectForm(!showRejectForm)} className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
                                    ✗ Tolak
                                </button>
                            </>
                        )}
                        {canPublish && (
                            <button onClick={handlePublish} className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all shadow-sm">
                                📄 Terbitkan
                            </button>
                        )}
                        {scaleUp.status === 'published' && ['admin', 'qc'].includes(userRole) && (
                            <a href={route('scaleups.print', scaleUp.id)} target="_blank" rel="noreferrer" className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-900 transition-colors shadow-sm inline-flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                Print Laporan
                            </a>
                        )}
                        {canDelete && (
                            <button onClick={handleDelete} className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
                                Hapus
                            </button>
                        )}
                    </div>
                </div>

                {/* Reject Form */}
                {showRejectForm && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                        <h4 className="text-sm font-bold text-red-700 mb-2">Alasan Penolakan</h4>
                        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows="2" className="w-full rounded-lg border-red-200 focus:ring-red-500 text-sm mb-3" placeholder="Tuliskan alasan mengapa spesifikasi ini ditolak..." />
                        <button onClick={handleReject} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors">Kirim Penolakan</button>
                    </div>
                )}

                {/* Rejection Notice */}
                {scaleUp.status === 'rejected' && scaleUp.rejection_reason && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                        <h4 className="text-sm font-bold text-red-700 mb-1">⚠ Ditolak</h4>
                        <p className="text-sm text-red-600">{scaleUp.rejection_reason}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header Info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        {getStatusBadge(scaleUp.status)}
                                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{scaleUp.packaging_category}</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">{scaleUp.material_name}</h2>
                                    <p className="text-sm text-gray-500 font-mono mt-1">{scaleUp.code} • {scaleUp.material_type || '-'}</p>
                                </div>
                            </div>

                            {scaleUp.description && (
                                <div className="px-6 py-4 border-b border-gray-50">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Deskripsi</p>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{scaleUp.description}</p>
                                </div>
                            )}
                        </div>

                        {/* Spesifikasi Table */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="font-bold text-gray-800">Parameter Uji & Spesifikasi</h3>
                            </div>
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Parameter Uji</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Spesifikasi</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase w-[160px]">Metode Analisa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <SpecRow label="Bentuk" value={scaleUp.bentuk} method={scaleUp.metode_bentuk} />
                                    <SpecRow label="Warna Dasar" value={scaleUp.warna_dasar} method={scaleUp.metode_warna} />
                                    <SpecRow label="Warna Cetakan" value={scaleUp.warna_cetakan} method={scaleUp.metode_warna} />
                                    <SpecRow label="Tebal (mm)" value={scaleUp.tebal} method={scaleUp.metode_dimensi} />
                                    <SpecRow label="Diameter Dalam (mm)" value={scaleUp.diameter_dalam} method={scaleUp.metode_dimensi} />
                                    <SpecRow label="Diameter Luar (mm)" value={scaleUp.diameter_luar} method={scaleUp.metode_dimensi} />
                                    <SpecRow label="Panjang Selang (mm)" value={scaleUp.panjang_selang} method={scaleUp.metode_dimensi} />
                                    <SpecRow label="Berat (g)" value={scaleUp.berat} method={scaleUp.metode_berat} />
                                    <SpecRow label="Test Kebocoran" value={scaleUp.test_kebocoran} method={scaleUp.metode_kebocoran} />
                                    <SpecRow label="Test Kekuatan" value={scaleUp.test_kekuatan} method={scaleUp.metode_kekuatan} />
                                    <SpecRow label="Kesesuaian Desain / Penandaan" value={scaleUp.kesesuaian_desain} method={scaleUp.metode_kesesuaian} />
                                    <SpecRow label="Kesesuaian Teks / Cetakan" value={scaleUp.kesesuaian_teks} method={scaleUp.metode_kesesuaian} />
                                </tbody>
                            </table>
                        </div>

                        {/* Proofprint & Master */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="font-bold text-gray-800">Sampel Proofprint & Master Produk</h3>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Catatan Proofprint</p>
                                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-100">{scaleUp.proofprint_notes || <span className="italic text-gray-400">Belum ada catatan</span>}</p>
                                    {scaleUp.proofprint_file && (
                                        <a href={`/storage/${scaleUp.proofprint_file}`} target="_blank" className="inline-flex items-center mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                                            📎 Lihat File Proofprint
                                        </a>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Catatan Master Produk</p>
                                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-100">{scaleUp.master_product_notes || <span className="italic text-gray-400">Belum ada catatan</span>}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        {/* Metadata */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg p-6 text-white">
                            <h3 className="font-bold text-indigo-100 mb-4">Informasi Dokumen</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-indigo-200">Nomor Dokumen</p>
                                    <p className="font-semibold">{scaleUp.document_number || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-indigo-200">Tanggal Berlaku</p>
                                    <p className="font-semibold">{scaleUp.valid_date ? new Date(scaleUp.valid_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-indigo-200">Proyek Terkait</p>
                                    {scaleUp.project ? (
                                        <Link href={route('projects.show', scaleUp.project.id)} className="font-semibold hover:underline">{scaleUp.project.code} - {scaleUp.project.title}</Link>
                                    ) : <p className="font-semibold">-</p>}
                                </div>
                            </div>
                        </div>

                        {/* Approval Info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-800 mb-4">Riwayat Persetujuan</h3>
                            <ul className="space-y-4 text-sm">
                                <li className="flex justify-between items-start py-2 border-b border-gray-50">
                                    <div>
                                        <span className="text-gray-500">Disusun oleh</span>
                                        <p className="font-medium text-gray-800">{scaleUp.creator?.name || '-'}</p>
                                    </div>
                                    <span className="text-xs text-gray-400">{new Date(scaleUp.created_at).toLocaleDateString('id-ID')}</span>
                                </li>
                                <li className="flex justify-between items-start py-2 border-b border-gray-50">
                                    <div>
                                        <span className="text-gray-500">Diperiksa oleh</span>
                                        <p className="font-medium text-gray-800">{scaleUp.checker?.name || <span className="italic text-gray-400">Belum diperiksa</span>}</p>
                                    </div>
                                    {scaleUp.checked_at && <span className="text-xs text-gray-400">{new Date(scaleUp.checked_at).toLocaleDateString('id-ID')}</span>}
                                </li>
                                <li className="flex justify-between items-start py-2">
                                    <div>
                                        <span className="text-gray-500">Disetujui oleh</span>
                                        <p className="font-medium text-gray-800">{scaleUp.approver?.name || <span className="italic text-gray-400">Belum disetujui</span>}</p>
                                    </div>
                                    {scaleUp.approved_at && <span className="text-xs text-gray-400">{new Date(scaleUp.approved_at).toLocaleDateString('id-ID')}</span>}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
