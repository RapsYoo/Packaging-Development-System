import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Timeline({ auth, project, phases = [] }) {

    const userRole = auth.user.role?.slug;
    const canManage = ['admin', 'marketing'].includes(userRole);

    // Safe guard: if no phases, show empty state
    if (!phases || phases.length === 0) {
        return (
            <AuthenticatedLayout user={auth.user} header={`Timeline Proyek: ${project.code}`}>
                <Head title={`Timeline - ${project.title}`} />
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        <h3 className="text-lg font-bold text-gray-800">Belum Ada Fase</h3>
                        <p className="text-gray-500 mt-2">Proyek ini belum memiliki fase timeline.</p>
                        <Link href={route('projects.show', project.id)} className="inline-block mt-4 text-sm text-indigo-600 font-medium hover:text-indigo-800">← Kembali ke Detail Proyek</Link>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    // Calculate timeline range
    const startDates = phases.map(p => new Date(p.start_date));
    const endDates = phases.map(p => new Date(p.end_date));

    const minDate = new Date(Math.min(...startDates));
    const maxDate = new Date(Math.max(...endDates));
    maxDate.setDate(maxDate.getDate() + 7);

    const totalDays = Math.max(1, Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)));

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return 'bg-gray-100 border-gray-300 text-gray-700';
            case 'in_progress': return 'bg-blue-100 border-blue-400 text-blue-800 shadow-[0_0_8px_rgba(59,130,246,0.2)]';
            case 'overdue': return 'bg-red-100 border-red-400 text-red-800';
            case 'completed': return 'bg-green-100 border-green-500 text-green-800';
            default: return 'bg-gray-100 border-gray-300 text-gray-700';
        }
    };

    const getProgressColor = (status) => {
        if (status === 'completed') return 'bg-green-500';
        if (status === 'in_progress') return 'bg-blue-500';
        if (status === 'overdue') return 'bg-red-500';
        return 'bg-gray-300';
    };

    const getStatusLabel = (status) => {
        const labels = { pending: 'Pending', in_progress: 'Berjalan', completed: 'Selesai', overdue: 'Overdue' };
        return labels[status] || status;
    };

    const [editingPhase, setEditingPhase] = useState(null);
    const [editData, setEditData] = useState({});

    const startEdit = (phase) => {
        setEditingPhase(phase.id);
        setEditData({
            start_date: phase.start_date?.split('T')[0] || '',
            end_date: phase.end_date?.split('T')[0] || '',
            status: phase.status,
        });
    };

    const saveEdit = (phaseId) => {
        router.put(route('projects.phases.update', phaseId), editData, {
            preserveScroll: true,
            onSuccess: () => setEditingPhase(null),
        });
    };

    // Today indicator position
    const today = new Date();
    const todayOffset = Math.max(0, Math.min(100, ((today - minDate) / (1000 * 60 * 60 * 24)) / totalDays * 100));

    return (
        <AuthenticatedLayout user={auth.user} header={`Timeline Proyek: ${project.code}`}>
            <Head title={`Timeline - ${project.title}`} />

            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Breadcrumbs */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <div className="flex items-center text-sm text-gray-500 mb-2 gap-2">
                            <Link href={route('projects.index')} className="hover:text-indigo-600 transition-colors">Daftar Proyek</Link>
                            <span>/</span>
                            <Link href={route('projects.show', project.id)} className="hover:text-indigo-600 transition-colors">{project.code}</Link>
                            <span>/</span>
                            <span className="font-semibold text-gray-800">Timeline</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">{project.title}</h2>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600"><span className="w-3 h-3 rounded-full bg-gray-200 border border-gray-300"></span> Pending</div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600"><span className="w-3 h-3 rounded-full bg-blue-200 border border-blue-400"></span> Berjalan</div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600"><span className="w-3 h-3 rounded-full bg-red-200 border border-red-400"></span> Overdue</div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600"><span className="w-3 h-3 rounded-full bg-green-200 border border-green-500"></span> Selesai</div>
                    </div>
                </div>

                {/* Gantt Chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-indigo-50/30">
                        <div className="flex items-center gap-3">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            <h3 className="text-lg font-bold text-gray-800">Gantt Chart & Phase Tracking</h3>
                        </div>
                        <div className="text-xs text-gray-500 font-medium bg-white px-3 py-1.5 rounded-lg border border-gray-100">
                            Total: <span className="font-bold text-gray-700">{totalDays} Hari</span>
                        </div>
                    </div>

                    <div className="p-6 overflow-x-auto">
                        <div className="min-w-[800px] relative">
                            {/* Time Axis */}
                            <div className="flex border-b border-gray-200 pb-3 mb-6 ml-52">
                                <div className="text-xs font-bold text-gray-400 w-1/3">{minDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                <div className="text-xs font-bold text-gray-400 w-1/3 text-center">
                                    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">Hari ini</span>
                                </div>
                                <div className="text-xs font-bold text-gray-400 w-1/3 text-right">{maxDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                            </div>

                            {/* Phase Bars */}
                            <div className="space-y-5 relative">
                                {/* Today Line */}
                                <div className="absolute top-0 bottom-0 z-20 pointer-events-none" style={{ left: `calc(208px + ${todayOffset}% * (100% - 208px) / 100)`, marginLeft: `${todayOffset * 0.8}%` }}>
                                </div>

                                {phases.map((phase, index) => {
                                    const pStart = new Date(phase.start_date);
                                    const pEnd = new Date(phase.end_date);
                                    const leftPercent = Math.max(0, ((pStart - minDate) / (1000 * 60 * 60 * 24)) / totalDays * 100);
                                    const widthPercent = Math.max(5, ((pEnd - pStart) / (1000 * 60 * 60 * 24)) / totalDays * 100);
                                    const progress = phase.progress || 0;

                                    return (
                                        <div key={phase.id} className="relative flex items-center group">
                                            {/* Phase Name */}
                                            <div className="w-52 shrink-0 pr-4 z-10 bg-white">
                                                <h4 className="font-bold text-gray-800 text-sm truncate" title={phase.name}>
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mr-2">{index + 1}</span>
                                                    {phase.name}
                                                </h4>
                                                <p className="text-[10px] text-gray-500 mt-0.5 ml-8">
                                                    {new Date(phase.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} — {new Date(phase.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                </p>
                                            </div>

                                            {/* Track Area */}
                                            <div className="flex-1 relative h-11 bg-gray-50/50 rounded-lg border border-gray-100">
                                                {/* Gantt Bar */}
                                                <div
                                                    className={`absolute top-1.5 bottom-1.5 rounded-md border-2 flex items-center overflow-hidden transition-all duration-300 cursor-default ${getStatusStyle(phase.status)}`}
                                                    style={{
                                                        left: `${Math.min(92, leftPercent)}%`,
                                                        width: `${Math.min(100 - leftPercent, widthPercent)}%`,
                                                        minWidth: '60px'
                                                    }}
                                                >
                                                    {/* Progress Fill */}
                                                    <div className={`absolute top-0 bottom-0 left-0 opacity-30 rounded-l ${getProgressColor(phase.status)}`} style={{ width: `${progress}%` }}></div>
                                                    <span className="relative z-10 px-2.5 text-[11px] font-bold truncate">
                                                        {getStatusLabel(phase.status)} • {progress}%
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Edit Button */}
                                            {canManage && (
                                                <button
                                                    onClick={() => startEdit(phase)}
                                                    className="ml-2 shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Edit fase"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Phase Detail Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {phases.map((phase, index) => {
                        const isEditing = editingPhase === phase.id;

                        return (
                            <div key={phase.id} className={`bg-white rounded-xl shadow-sm border p-5 relative overflow-hidden transition-all ${phase.status === 'in_progress' ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-100'}`}>
                                {/* Background number */}
                                <div className="absolute -right-3 -top-5 text-8xl font-black text-gray-50 pointer-events-none select-none">{index + 1}</div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${getStatusStyle(phase.status)}`}>
                                            {getStatusLabel(phase.status)}
                                        </span>
                                        <span className="text-sm font-bold text-gray-800">{phase.progress || 0}%</span>
                                    </div>

                                    <h4 className="font-bold text-gray-900 mb-1">{phase.name}</h4>
                                    <p className="text-xs text-gray-500 mb-4">{phase.notes || 'Tidak ada catatan.'}</p>

                                    {/* Progress bar */}
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
                                        <div className={`h-1.5 rounded-full transition-all duration-500 ${getProgressColor(phase.status)}`} style={{ width: `${phase.progress || 0}%` }}></div>
                                    </div>

                                    {isEditing ? (
                                        <div className="space-y-3 border-t border-gray-100 pt-3">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-[10px] font-semibold text-gray-500 uppercase">Mulai</label>
                                                    <input type="date" value={editData.start_date} onChange={e => setEditData({...editData, start_date: e.target.value})} className="w-full rounded-md border-gray-200 text-xs py-1.5" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-semibold text-gray-500 uppercase">Selesai</label>
                                                    <input type="date" value={editData.end_date} onChange={e => setEditData({...editData, end_date: e.target.value})} className="w-full rounded-md border-gray-200 text-xs py-1.5" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-semibold text-gray-500 uppercase">Status</label>
                                                <select value={editData.status} onChange={e => setEditData({...editData, status: e.target.value})} className="w-full rounded-md border-gray-200 text-xs py-1.5">
                                                    <option value="pending">Pending</option>
                                                    <option value="in_progress">Berjalan</option>
                                                    <option value="completed">Selesai</option>
                                                    <option value="overdue">Overdue</option>
                                                </select>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => saveEdit(phase.id)} className="flex-1 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-bold hover:bg-indigo-700 transition-colors">Simpan</button>
                                                <button onClick={() => setEditingPhase(null)} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md text-xs font-medium hover:bg-gray-200 transition-colors">Batal</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 border-t border-gray-50 pt-3">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500">Mulai:</span>
                                                <span className="font-medium text-gray-800">{new Date(phase.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500">Selesai:</span>
                                                <span className="font-medium text-gray-800">{new Date(phase.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                            </div>
                                            {canManage && (
                                                <button onClick={() => startEdit(phase)} className="w-full mt-2 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-md text-xs font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-gray-100">
                                                    ✏️ Update Fase
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
