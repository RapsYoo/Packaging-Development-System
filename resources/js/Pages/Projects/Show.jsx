import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Show({ auth, project, gatingSummary }) {
    const getStatusBadge = (status) => {
        switch (status) {
            case 'draft': return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase tracking-wider">Draft</span>;
            case 'submitted': return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">Submitted</span>;
            case 'active': return <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">Aktif</span>;
            case 'completed': return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">Selesai</span>;
            default: return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
        }
    };

    const handleDelete = () => {
        if (confirm('Peringatan: Menghapus proyek ini akan menghapus semua riwayat fase dan approval terkait. Lanjutkan?')) {
            router.delete(route('projects.destroy', project.id));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} header={`Detail Proyek: ${project.code}`}>
            <Head title={`Project ${project.code}`} />

            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Link href={route('projects.index')} className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
                        &larr; Kembali ke Daftar Proyek
                    </Link>

                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={route('projects.timeline', project.id)}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            Lihat Timeline (Gantt)
                        </Link>

                        {(auth.user.role.slug === 'admin' || auth.user.role.slug === 'marketing') && (
                            <>
                                <Link href={route('projects.edit', project.id)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                                    Edit Proyek
                                </Link>
                                <button onClick={handleDelete} className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
                                    Hapus
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Project Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-6 border-b border-gray-50 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        {getStatusBadge(project.status)}
                                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{project.type}</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 leading-tight">{project.title}</h2>
                                    <p className="text-sm text-gray-500 font-mono mt-1">Project Code: {project.code}</p>
                                </div>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Target COGS</p>
                                    <p className="text-sm font-medium text-gray-800">{project.target_cogs ? `Rp ${Number(project.target_cogs).toLocaleString('id-ID')}` : 'Belum ditentukan'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Target Market</p>
                                    <p className="text-sm font-medium text-gray-800">{project.target_market || '-'}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Konsep / Brief Kemasan</p>
                                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap border border-gray-100">
                                        {project.concept || <span className="italic text-gray-400">Tidak ada deskripsi konsep yang dilampirkan.</span>}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Catatan Tambahan</p>
                                    <p className="text-sm text-gray-700">{project.notes || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Metadata & Progress */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg p-6 text-white">
                            <h3 className="font-bold text-indigo-100 mb-4">Progress Keseluruhan</h3>
                            <div className="flex items-end justify-between mb-2">
                                <span className="text-4xl font-extrabold">{project.progress || 0}%</span>
                                <span className="text-indigo-200 text-sm font-medium">menuju rilis</span>
                            </div>
                            <div className="w-full bg-indigo-900/50 rounded-full h-2.5 mb-6">
                                <div className="bg-white h-2.5 rounded-full" style={{ width: `${project.progress || 0}%` }}></div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-indigo-500/30">
                                <div>
                                    <p className="text-xs text-indigo-200 mb-1">Deadline Proyek</p>
                                    <div className="flex items-center font-semibold">
                                        <svg className="w-4 h-4 mr-2 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        {project.deadline ? new Date(project.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-indigo-200 mb-1">PIC (Penanggung Jawab)</p>
                                    <div className="flex items-center font-semibold">
                                        <svg className="w-4 h-4 mr-2 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        {project.pic?.name || 'Belum ada PIC'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Gating Checklist */}
                        {gatingSummary && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="font-bold text-gray-800 mb-1">Prasyarat Tahapan</h3>
                                <p className="text-xs text-gray-400 mb-4">Setiap tahap harus diselesaikan secara berurutan.</p>
                                <div className="space-y-3">
                                    {Object.entries(gatingSummary).map(([key, gate]) => {
                                        if (key === 'overall_progress') return null;
                                        let icon, color, statusText;
                                        if (gate.not_applicable || gate.status === 'not_applicable') {
                                            icon = <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
                                            color = 'border-blue-100 bg-blue-50/50';
                                            statusText = <span className="text-blue-600 text-xs font-semibold">Tidak Diperlukan</span>;
                                        } else if (gate.completed) {
                                            icon = <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
                                            color = 'border-green-200 bg-green-50';
                                            statusText = <span className="text-green-700 text-xs font-bold">Selesai</span>;
                                        } else if (gate.blocked) {
                                            icon = <svg className="w-5 h-5 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
                                            color = 'border-gray-200 bg-gray-50';
                                            statusText = <span className="text-gray-400 text-xs font-medium">Terkunci</span>;
                                        } else if (['pending', 'in_progress'].includes(gate.status)) {
                                            icon = <svg className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
                                            color = 'border-amber-200 bg-amber-50';
                                            statusText = <span className="text-amber-700 text-xs font-bold">Sedang Berjalan</span>;
                                        } else if (gate.status === 'rejected') {
                                            icon = <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
                                            color = 'border-red-200 bg-red-50';
                                            statusText = <span className="text-red-700 text-xs font-bold">Ditolak</span>;
                                        } else {
                                            icon = <svg className="w-5 h-5 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
                                            color = 'border-gray-100';
                                            statusText = <span className="text-gray-400 text-xs font-medium">Belum Dimulai</span>;
                                        }
                                        const userRole = auth.user.role?.slug;

                                        // Tentukan apakah user berhak menekan tombol "Mulai"
                                        let canStart = false;
                                        let startUrl = '';
                                        let startLabel = '';

                                        if (gate.status === 'not_started' && !gate.blocked) {
                                            if (key === 'drawing' && ['admin', 'rd'].includes(userRole)) {
                                                canStart = true;
                                                startUrl = route('approvals.drawing.create', project.id);
                                                startLabel = 'Mulai Drawing';
                                            } else if (key === 'artwork' && ['admin', 'marketing', 'rd', 'qc', 'qa'].includes(userRole)) {
                                                canStart = true;
                                                startUrl = route('approvals.artwork.create', project.id);
                                                startLabel = 'Mulai Artwork';
                                            } else if (key === 'concept' && ['admin', 'marketing'].includes(userRole)) {
                                                canStart = true;
                                                startUrl = route('approvals.concept.create', project.id);
                                                startLabel = 'Mulai Konsep';
                                            } else if (key === 'fabk' && ['admin', 'scm', 'rd'].includes(userRole)) {
                                                canStart = true;
                                                startUrl = project.type === 'Substitusi'
                                                    ? route('substitusi-approvals.create', { project_id: project.id })
                                                    : route('packaging-approvals.create', { project_id: project.id });
                                                startLabel = 'Buat FABK';
                                            } else if (key === 'scale_up' && ['admin', 'qc', 'rd', 'scm'].includes(userRole)) {
                                                canStart = true;
                                                startUrl = route('scaleups.create', { project_id: project.id });
                                                startLabel = project.type === 'Substitusi' ? 'Buat Standar' : 'Mulai Scale Up';
                                            }
                                        }

                                        let workflowId = null;
                                        if (project.approval_workflows) {
                                            const wf = project.approval_workflows.find(w => w.type === key);
                                            if (wf) workflowId = wf.id;
                                        }

                                        return (
                                            <div key={key} className={`flex items-center justify-between p-3 rounded-xl border ${color} transition-all`}>
                                                <div className="flex items-center gap-3">
                                                    {icon}
                                                    <span className={`text-sm font-medium ${gate.blocked ? 'text-gray-400' : 'text-gray-800'}`}>{gate.label}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {statusText}
                                                    {canStart && (
                                                        <Link
                                                            href={startUrl}
                                                            method={['fabk', 'scale_up'].includes(key) ? 'get' : 'post'}
                                                            as={['fabk', 'scale_up'].includes(key) ? 'a' : 'button'}
                                                            className="ml-2 px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full shadow-sm hover:bg-indigo-700 hover:shadow transition-all"
                                                        >
                                                            {startLabel}
                                                        </Link>
                                                    )}
                                                    {['in_progress', 'pending', 'approved', 'completed', 'rejected'].includes(gate.status) && (workflowId || ((key === 'fabk' || key === 'scale_up') && gate.document_id)) && (
                                                        <Link
                                                            href={key === 'fabk'
                                                                ? (project.type === 'Substitusi' ? route('substitusi-approvals.show', gate.document_id) : route('packaging-approvals.show', gate.document_id))
                                                                : (key === 'scale_up' ? route('scaleups.show', gate.document_id) : route('approvals.show', workflowId))
                                                            }
                                                            className="ml-2 px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-full shadow-sm hover:bg-gray-50 hover:text-indigo-600 transition-all"
                                                        >
                                                            Lihat Dokumen
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-800 mb-4">Informasi Dokumen</h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-gray-500">Dibuat oleh</span>
                                    <span className="font-medium text-gray-800">{project.creator?.name || '-'}</span>
                                </li>
                                <li className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-gray-500">Tanggal Dibuat</span>
                                    <span className="font-medium text-gray-800">{new Date(project.created_at).toLocaleDateString('id-ID')}</span>
                                </li>
                                <li className="flex justify-between items-center py-2">
                                    <span className="text-gray-500">Update Terakhir</span>
                                    <span className="font-medium text-gray-800">{new Date(project.updated_at).toLocaleDateString('id-ID')}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
