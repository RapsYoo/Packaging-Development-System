import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Show({ auth, approval, approvalProgress }) {
    const [decisionNotes, setDecisionNotes] = useState('');
    const [selectedRoleAction, setSelectedRoleAction] = useState('');
    const userRole = auth.user.role?.slug;

    const canEdit = ['admin', 'scm'].includes(userRole) && ['draft', 'rejected'].includes(approval.status);
    const canSubmit = ['admin', 'scm'].includes(userRole) && approval.status === 'draft';
    const canDelete = ['admin', 'scm'].includes(userRole) && ['draft', 'rejected'].includes(approval.status);

    let availableRoleActions = [];
    if (approval.status === 'submitted') {
        if (userRole === 'admin') {
            if (approval.decision_rd === 'pending') availableRoleActions.push({ id: 'rd', label: 'R&D Manager' });
            if (!approval.approved_by_marketing) availableRoleActions.push({ id: 'marketing', label: 'Marketing Manager' });
            if (!approval.approved_by_bod) availableRoleActions.push({ id: 'bod', label: 'Board of Director' });
        } else {
            if (userRole === 'rd' && approval.decision_rd === 'pending') availableRoleActions.push({ id: 'rd', label: 'R&D Manager' });
            if (userRole === 'marketing') {
                if (!approval.approved_by_marketing) availableRoleActions.push({ id: 'marketing', label: 'Marketing Manager' });
            }
            if (userRole === 'bod') {
                if (!approval.approved_by_bod) availableRoleActions.push({ id: 'bod', label: 'Board of Director' });
            }
        }
    }

    // Auto-select if only 1 option available
    React.useEffect(() => {
        if (availableRoleActions.length === 1 && !selectedRoleAction) {
            setSelectedRoleAction(availableRoleActions[0].id);
        }
    }, [availableRoleActions]);

    const handleSubmit = () => {
        if (confirm('Ajukan form ini untuk review persetujuan?')) {
            router.post(route('packaging-approvals.submit', approval.id));
        }
    };

    const handleDecide = (decision) => {
        if (!selectedRoleAction) {
            alert('Pilih peran tanda tangan terlebih dahulu.');
            return;
        }
        
        const label = decision === 'approved' ? 'menandatangani/menyetujui' : 'menolak';
        if (confirm(`Anda yakin ingin ${label} form ini sebagai ${availableRoleActions.find(a => a.id === selectedRoleAction)?.label}?`)) {
            router.post(route('packaging-approvals.decide', approval.id), {
                role_action: selectedRoleAction,
                decision,
                notes: decisionNotes,
            });
        }
    };

    const handleDelete = () => {
        if (confirm('Hapus form ini secara permanen?')) {
            router.delete(route('packaging-approvals.destroy', approval.id));
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            draft: 'bg-gray-100 text-gray-700 border-gray-300',
            submitted: 'bg-blue-100 text-blue-800 border-blue-300',
            approved: 'bg-green-100 text-green-800 border-green-300',
            rejected: 'bg-red-100 text-red-800 border-red-300',
        };
        const labels = { draft: 'Draft', submitted: 'Menunggu Persetujuan', approved: 'Disetujui', rejected: 'Ditolak' };
        return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${styles[status]}`}>{labels[status]}</span>;
    };

    const SignatureBadge = ({ role, decision, approver, approvedAt, notes, isRD }) => {
        const hasDecided = isRD ? decision !== 'pending' : approver !== null;
        const isRejected = decision === 'rejected';
        
        const bgMap = hasDecided ? (isRejected ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200') : 'bg-gray-50 border-gray-200';
        const iconMap = hasDecided ? (isRejected ? '✗' : '✓') : '⏳';
        const textMap = hasDecided ? (isRejected ? 'text-red-700' : 'text-green-700') : 'text-gray-500';
        const labelMap = hasDecided ? (isRejected ? 'Ditolak' : 'Disetujui/Telah Ditandatangani') : 'Belum ditandatangani';

        return (
            <div className={`rounded-xl border-2 p-4 ${bgMap} transition-all`}>
                <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-gray-800">{role}</span>
                    <span className={`text-lg font-bold ${textMap}`}>{iconMap}</span>
                </div>
                <p className={`text-sm font-semibold ${textMap}`}>{labelMap}</p>
                {hasDecided && approver && <p className="text-xs text-gray-500 mt-1">oleh {approver.name}</p>}
                {hasDecided && approvedAt && <p className="text-xs text-gray-400">{new Date(approvedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>}
                {isRD && notes && <p className="text-xs text-gray-600 mt-2 italic bg-white/50 rounded p-2">"{notes}"</p>}
            </div>
        );
    };

    const InfoRow = ({ label, value }) => (
        <div className="flex justify-between py-2.5 border-b border-gray-50">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">{value || <span className="italic text-gray-400">-</span>}</span>
        </div>
    );

    return (
        <AuthenticatedLayout user={auth.user} header={`FABK: ${approval.document_no}`}>
            <Head title={`Form Approval ${approval.document_no}`} />

            <div className="max-w-6xl mx-auto space-y-6">
                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Link href={route('packaging-approvals.index')} className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">&larr; Kembali ke Daftar</Link>
                    <div className="flex flex-wrap gap-2">
                        {approval.decision_rd !== 'pending' && (
                            <a href={route('packaging-approvals.print', approval.id)} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors inline-flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                Print Form
                            </a>
                        )}
                        {canEdit && (
                            <Link href={route('packaging-approvals.edit', approval.id)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Edit</Link>
                        )}
                        {canSubmit && (
                            <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
                                Ajukan Persetujuan →
                            </button>
                        )}
                        {canDelete && (
                            <button onClick={handleDelete} className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">Hapus</button>
                        )}
                    </div>
                </div>

                {/* Rejection Notice */}
                {approval.status === 'rejected' && approval.rejection_reason && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                        <h4 className="text-sm font-bold text-red-700 mb-1">⚠ Ditolak</h4>
                        <p className="text-sm text-red-600">{approval.rejection_reason}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        {getStatusBadge(approval.status)}
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">{approval.packaging_type}</h2>
                                    <p className="text-sm text-gray-500 font-mono mt-1">{approval.document_no}</p>
                                </div>
                            </div>

                            <div className="p-6 space-y-0">
                                <InfoRow label="Nama Produk" value={approval.product_name} />
                                <InfoRow label="Jenis Bahan Kemas" value={approval.packaging_type} />
                                <InfoRow label="Supplier" value={approval.supplier} />
                                <InfoRow label="Tanggal" value={approval.document_date ? new Date(approval.document_date).toLocaleDateString('id-ID') : '-'} />
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar — Approval Panel */}
                    <div className="space-y-6">
                        {/* Approval Progress */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg p-6 text-white">
                            <h3 className="font-bold text-indigo-100 mb-3">Status Persetujuan</h3>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex-1 bg-indigo-500/30 rounded-full h-2.5">
                                    <div className="bg-white rounded-full h-2.5 transition-all" style={{ width: `${(approvalProgress.approved / approvalProgress.total) * 100}%` }}></div>
                                </div>
                                <span className="text-sm font-bold">{approvalProgress.approved}/{approvalProgress.total}</span>
                            </div>
                            <p className="text-xs text-indigo-200">
                                {approvalProgress.approved === approvalProgress.total
                                    ? '✅ Semua pihak telah menyetujui'
                                    : approvalProgress.pending > 0
                                    ? `⏳ Menunggu ${approvalProgress.pending} tanda tangan`
                                    : '❌ Ada pihak yang menolak'}
                            </p>
                        </div>

                        {/* Decision Form */}
                        {availableRoleActions.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border-2 border-indigo-200 p-5">
                                <h4 className="font-bold text-gray-800 mb-3">Tindakan Anda</h4>
                                
                                {availableRoleActions.length > 1 && (
                                    <div className="mb-4">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Pilih Peran Tanda Tangan:</label>
                                        <select 
                                            value={selectedRoleAction} 
                                            onChange={e => setSelectedRoleAction(e.target.value)}
                                            className="w-full rounded-lg border-gray-300 text-sm focus:ring-indigo-500"
                                        >
                                            <option value="">-- Pilih Peran --</option>
                                            {availableRoleActions.map(act => (
                                                <option key={act.id} value={act.id}>{act.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {selectedRoleAction === 'rd' && (
                                    <div className="mb-4">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Catatan R&D:</label>
                                        <textarea
                                            value={decisionNotes}
                                            onChange={e => setDecisionNotes(e.target.value)}
                                            rows="3"
                                            className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm"
                                            placeholder="Catatan sampel dapat/tidak diterima..."
                                        />
                                    </div>
                                )}

                                <div className="flex gap-2 mt-4">
                                    <button onClick={() => handleDecide('approved')} className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors">
                                        ✓ {selectedRoleAction === 'rd' ? 'Sampel Diterima' : 'Setujui (TTD)'}
                                    </button>
                                    <button onClick={() => handleDecide('rejected')} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors">
                                        ✗ Tolak
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Individual Decisions */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-gray-700 mt-4 mb-2 uppercase tracking-wider">Tanda Tangan & Persetujuan</h4>
                            <SignatureBadge role="Diperiksa: R&D Manager" decision={approval.decision_rd} approver={approval.approver_rd} approvedAt={approval.checked_at_rd} notes={approval.notes_rd} isRD={true} />
                            <div className="rounded-xl border-2 p-4 bg-gray-50 border-gray-200 transition-all border-dashed">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-sm text-gray-500">Disetujui: Brand Innovation</span>
                                    <span className="text-lg font-bold text-gray-400">✍️</span>
                                </div>
                                <p className="text-sm font-semibold text-gray-500">Tanda Tangan Manual</p>
                                <p className="text-xs text-gray-400 mt-1">Hanya pada cetakan fisik form</p>
                            </div>
                            <SignatureBadge role="Disetujui: Marketing Manager" decision={approval.status === 'rejected' ? 'rejected' : 'approved'} approver={approval.approver_marketing} approvedAt={approval.approved_at_marketing} />
                            <div className="rounded-xl border-2 p-4 bg-gray-50 border-gray-200 transition-all border-dashed">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-sm text-gray-500">Disetujui: Commercial Director</span>
                                    <span className="text-lg font-bold text-gray-400">✍️</span>
                                </div>
                                <p className="text-sm font-semibold text-gray-500">Tanda Tangan Manual</p>
                                <p className="text-xs text-gray-400 mt-1">Hanya pada cetakan fisik form</p>
                            </div>
                            <SignatureBadge role="Disetujui: Board of Director" decision={approval.status === 'rejected' ? 'rejected' : 'approved'} approver={approval.approver_bod} approvedAt={approval.approved_at_bod} />
                        </div>

                        {/* Meta Info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mt-4">
                            <h4 className="font-bold text-gray-700 text-sm mb-3">Informasi Dokumen</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Dibuat oleh</span>
                                    <span className="font-medium text-gray-800">{approval.creator?.name || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Tanggal Dibuat</span>
                                    <span className="font-medium text-gray-800">{new Date(approval.created_at).toLocaleDateString('id-ID')}</span>
                                </div>
                                {approval.attachment_file && (
                                    <div className="pt-2">
                                        <a href={`/storage/${approval.attachment_file}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 font-medium text-sm inline-flex items-center gap-1">
                                            📎 Lihat Lampiran
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
