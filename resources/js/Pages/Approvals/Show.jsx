import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';

export default function Show({ auth, workflow }) {
    const { data, setData, post, processing, errors } = useForm({
        decision: '',
        comment: ''
    });

    // Check if current user has a pending step in this workflow
    const myPendingStep = workflow.steps.find(
        step => step.role_required === auth.user.role?.slug && step.status === 'pending' && step.step_order === workflow.current_step
    );

    const handleDecide = (decision) => {
        if (!confirm(`Apakah Anda yakin ingin melakukan aksi "${decision.toUpperCase()}"?`)) return;
        
        router.post(route('approvals.step.decide', myPendingStep.id), {
            decision: decision,
            comment: data.comment
        }, { preserveScroll: true });
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'pending': return <span className="bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full text-xs font-medium">Menunggu</span>;
            case 'approved': return <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-xs font-medium">Disetujui</span>;
            case 'rejected': return <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-xs font-medium">Ditolak</span>;
            case 'in_progress': return <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-medium">Sirkulasi Berjalan</span>;
            default: return <span className="bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full text-xs font-medium">{status}</span>;
        }
    };

    // Group steps by their order (for parallel display)
    const groupedSteps = workflow.steps.reduce((acc, step) => {
        if (!acc[step.step_order]) acc[step.step_order] = [];
        acc[step.step_order].push(step);
        return acc;
    }, {});

    return (
        <AuthenticatedLayout user={auth.user} header="Detail Sirkulasi Approval">
            <Head title={`Sirkulasi: ${workflow.type.toUpperCase()}`} />

            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Workflow Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-5">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-1">
                                    Dokumen Sirkulasi {workflow.type.toUpperCase()}
                                </h2>
                                <p className="text-indigo-100 text-sm">
                                    Diajukan oleh: {workflow.initiator?.name} pada {new Date(workflow.created_at).toLocaleDateString('id-ID')}
                                </p>
                            </div>
                            <div>
                                {getStatusBadge(workflow.status)}
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Informasi Proyek</h3>
                            <p className="font-semibold text-gray-900 text-lg">{workflow.project?.title}</p>
                            <p className="text-sm text-gray-600 mb-1">Kode: {workflow.project?.code}</p>
                            <p className="text-sm text-gray-600">Brand: {workflow.project?.brand}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Progress</h3>
                            <p className="text-sm text-gray-700">
                                Saat ini berada di <span className="font-bold text-indigo-600">Tahap {workflow.current_step}</span> dari total {workflow.total_steps} tahap.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Steps and Approvals */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-3">Riwayat Persetujuan</h3>
                    
                    <div className="space-y-8">
                        {Object.keys(groupedSteps).map(order => (
                            <div key={order} className="relative">
                                <h4 className="text-sm font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg inline-block mb-4">
                                    Tahap {order} {workflow.current_step == order && '(Saat Ini)'}
                                </h4>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {groupedSteps[order].map(step => (
                                        <div key={step.id} className={`border rounded-xl p-4 ${step.status === 'approved' ? 'border-green-200 bg-green-50' : step.status === 'rejected' ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{step.role_required}</span>
                                                {getStatusBadge(step.status)}
                                            </div>
                                            
                                            {step.assigned_to ? (
                                                <div className="text-sm">
                                                    <p className="font-medium text-gray-900">{step.assignee?.name}</p>
                                                    <p className="text-xs text-gray-500">{new Date(step.decided_at).toLocaleDateString('id-ID')}</p>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-400 italic">Belum diputuskan</p>
                                            )}

                                            {step.comment && (
                                                <div className="mt-3 text-xs text-gray-600 bg-white p-2 rounded border border-gray-100">
                                                    "{step.comment}"
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Box if user needs to decide */}
                {myPendingStep && (
                    <div className="bg-indigo-50 rounded-xl shadow-sm border border-indigo-100 p-6">
                        <h3 className="text-lg font-bold text-indigo-900 mb-2">Aksi Diperlukan</h3>
                        <p className="text-indigo-700 text-sm mb-4">Persetujuan Anda diperlukan untuk melanjutkan proses ini.</p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-indigo-900 mb-1">Komentar / Catatan Khusus (Opsional)</label>
                                <textarea
                                    className="w-full border-indigo-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    rows="3"
                                    value={data.comment}
                                    onChange={e => setData('comment', e.target.value)}
                                    placeholder="Tuliskan catatan Anda di sini..."
                                />
                            </div>
                            
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => handleDecide('rejected')}
                                    className="px-5 py-2.5 bg-white border border-red-200 text-red-600 rounded-lg font-bold hover:bg-red-50 transition-colors shadow-sm"
                                >
                                    Tolak (Reject)
                                </button>
                                <button 
                                    onClick={() => handleDecide('approved')}
                                    className="px-5 py-2.5 bg-indigo-600 border border-transparent text-white rounded-lg font-bold hover:bg-indigo-700 shadow-sm transition-colors"
                                >
                                    Setujui (Approve)
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="text-center">
                    <Link href={route('approvals.index')} className="text-sm font-medium text-gray-500 hover:text-indigo-600">
                        &larr; Kembali ke Daftar Persetujuan
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
