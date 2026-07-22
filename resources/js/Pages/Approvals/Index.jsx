import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ auth, pendingApprovals, myHistory }) {
    const [activeTab, setActiveTab] = useState('pending');

    const handleDecision = (stepId, decision, notes = '') => {
        if (!confirm(`Apakah Anda yakin ingin melakukan aksi "${decision.toUpperCase()}" pada tahap persetujuan ini?`)) return;
        
        router.post(route('approvals.step.decide', stepId), {
            decision: decision,
            notes: notes
        }, { preserveScroll: true });
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const ApprovalCard = ({ step, isHistory = false }) => {
        const workflow = step.workflow;
        const project = workflow.project;
        
        return (
            <div className={`bg-white rounded-xl border shadow-sm p-5 transition-all ${isHistory ? 'border-gray-100' : 'border-l-4 border-l-indigo-500 border-y-gray-100 border-r-gray-100 hover:shadow-md'}`}>
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            workflow.type === 'concept' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                            workflow.type === 'artwork' ? 'bg-pink-50 text-pink-700 border-pink-200' : 
                            'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                            {workflow.type} Approval
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(step.status)}`}>
                            {step.status}
                        </span>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">Urutan ke-{step.step_order}</span>
                </div>
                
                <h4 className="font-bold text-gray-900 text-lg mb-1">{project?.title || 'Proyek Tidak Diketahui'}</h4>
                <div className="text-xs font-mono text-gray-500 mb-4">{project?.code}</div>
                
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 mb-4 border border-gray-100">
                    <span className="font-semibold text-gray-800">Catatan Pengajuan:</span><br/>
                    {workflow.notes || <span className="italic text-gray-400">Tidak ada catatan dari pembuat dokumen.</span>}
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                    <div className="text-xs text-gray-500">
                        Diajukan pada: <span className="font-medium">{new Date(workflow.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                    
                    {!isHistory && step.status === 'pending' && (
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleDecision(step.id, 'rejected')}
                                className="px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors"
                            >
                                Tolak (Reject)
                            </button>
                            <button 
                                onClick={() => handleDecision(step.id, 'approved')}
                                className="px-3 py-1.5 bg-indigo-600 border border-transparent text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-sm transition-colors"
                            >
                                Setujui (Approve)
                            </button>
                        </div>
                    )}
                    
                    {isHistory && (
                        <div className="text-xs font-bold text-gray-700">
                            Diselesaikan: {step.decided_at ? new Date(step.decided_at).toLocaleDateString('id-ID') : '-'}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Workflow & Approvals">
            <Head title="Kotak Persetujuan" />

            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Header Profile & Summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-2xl shadow-inner">
                            {auth.user.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">Kotak Persetujuan Anda</h2>
                            <p className="text-sm text-gray-500 mt-0.5">{auth.user.role?.name || 'User'} - {auth.user.department}</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="text-center px-4 py-2 bg-yellow-50 rounded-xl border border-yellow-100">
                            <div className="text-2xl font-black text-yellow-600">{pendingApprovals?.length || 0}</div>
                            <div className="text-[10px] font-bold text-yellow-700 uppercase tracking-wider">Menunggu</div>
                        </div>
                        <div className="text-center px-4 py-2 bg-green-50 rounded-xl border border-green-100">
                            <div className="text-2xl font-black text-green-600">{myHistory?.length || 0}</div>
                            <div className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Selesai</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'pending' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Menunggu Persetujuan Anda 
                        {pendingApprovals?.length > 0 && (
                            <span className="ml-2 bg-red-500 text-white py-0.5 px-2 rounded-full text-xs">{pendingApprovals.length}</span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Riwayat Keputusan
                    </button>
                </div>

                {/* Content Area */}
                <div className="py-2">
                    {activeTab === 'pending' && (
                        <div className="space-y-4">
                            {(!pendingApprovals || pendingApprovals.length === 0) ? (
                                <div className="bg-white rounded-2xl border border-gray-100 border-dashed p-12 text-center">
                                    <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">Semua Tugas Selesai!</h3>
                                    <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">Saat ini tidak ada dokumen Konsep, Artwork, atau Drawing kemasan yang memerlukan persetujuan (Tanda Tangan) dari Anda.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {pendingApprovals.map(step => (
                                        <ApprovalCard key={step.id} step={step} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="space-y-4">
                            {(!myHistory || myHistory.length === 0) ? (
                                <div className="bg-white rounded-2xl border border-gray-100 border-dashed p-12 text-center">
                                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <p className="text-gray-500">Belum ada riwayat persetujuan yang Anda lakukan.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {myHistory.map(step => (
                                        <ApprovalCard key={step.id} step={step} isHistory={true} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
