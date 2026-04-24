import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Timeline({ auth, project, phases }) {

    // Calculate total duration in days for the timeline span
    const startDates = phases.map(p => new Date(p.start_date || project.created_at));
    const endDates = phases.map(p => new Date(p.end_date || project.deadline));

    const minDate = new Date(Math.min(...startDates));
    const maxDate = new Date(Math.max(...endDates));

    // Add buffer to max date
    maxDate.setDate(maxDate.getDate() + 7);

    const totalDays = Math.max(1, Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)));

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return 'bg-gray-100 border-gray-300 text-gray-700';
            case 'in_progress': return 'bg-blue-100 border-blue-400 text-blue-800 shadow-[0_0_10px_rgba(59,130,246,0.3)]';
            case 'review': return 'bg-yellow-100 border-yellow-400 text-yellow-800';
            case 'completed': return 'bg-green-100 border-green-500 text-green-800';
            default: return 'bg-gray-100 border-gray-300 text-gray-700';
        }
    };

    const getProgressColor = (status) => {
        if (status === 'completed') return 'bg-green-500';
        if (status === 'in_progress' || status === 'review') return 'bg-blue-500';
        return 'bg-gray-300';
    };

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

                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600"><span className="w-3 h-3 rounded-full bg-gray-200 border border-gray-300"></span> Pending</div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600"><span className="w-3 h-3 rounded-full bg-blue-200 border border-blue-400"></span> Progress</div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600"><span className="w-3 h-3 rounded-full bg-yellow-200 border border-yellow-400"></span> Review</div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600"><span className="w-3 h-3 rounded-full bg-green-200 border border-green-500"></span> Selesai</div>
                    </div>
                </div>

                {/* Timeline Visualization */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex items-center gap-3 bg-indigo-50/30">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        <h3 className="text-lg font-bold text-gray-800">Gantt Chart & Phase Tracking</h3>
                    </div>

                    <div className="p-6 overflow-x-auto custom-scrollbar">
                        <div className="min-w-[800px] relative">
                            {/* Time Axis Header */}
                            <div className="flex border-b border-gray-200 pb-2 mb-4 ml-48">
                                <div className="text-xs font-bold text-gray-400 w-1/4">Start: {minDate.toLocaleDateString('id-ID')}</div>
                                <div className="text-xs font-bold text-gray-400 w-2/4 text-center">Timeline Proyek ({totalDays} Hari)</div>
                                <div className="text-xs font-bold text-gray-400 w-1/4 text-right">Deadline: {new Date(project.deadline).toLocaleDateString('id-ID')}</div>
                            </div>

                            {/* Phase Bars */}
                            <div className="space-y-6 relative">
                                {/* Vertical Grid Lines */}
                                <div className="absolute inset-0 ml-48 border-l border-r border-gray-100 pointer-events-none flex justify-between">
                                    <div className="w-px h-full bg-gray-100"></div>
                                    <div className="w-px h-full bg-gray-100"></div>
                                    <div className="w-px h-full bg-gray-100"></div>
                                </div>

                                {phases.map((phase, index) => {
                                    // Calculate position and width based on dates
                                    const pStart = new Date(phase.start_date || project.created_at);
                                    const pEnd = new Date(phase.end_date || project.deadline);

                                    const leftPercent = Math.max(0, ((pStart - minDate) / (1000 * 60 * 60 * 24)) / totalDays * 100);
                                    const widthPercent = Math.max(5, ((pEnd - pStart) / (1000 * 60 * 60 * 24)) / totalDays * 100);

                                    return (
                                        <div key={phase.id} className="relative flex items-center group">
                                            {/* Phase Name (Left side fixed) */}
                                            <div className="w-48 shrink-0 pr-4 z-10 bg-white">
                                                <h4 className="font-bold text-gray-800 text-sm truncate" title={phase.name}>{index + 1}. {phase.name}</h4>
                                                <p className="text-[10px] text-gray-500 mt-0.5">{phase.start_date ? new Date(phase.start_date).toLocaleDateString('id-ID') : '-'} s/d {phase.end_date ? new Date(phase.end_date).toLocaleDateString('id-ID') : '-'}</p>
                                            </div>

                                            {/* Track Area */}
                                            <div className="flex-1 relative h-10 bg-transparent rounded-lg">
                                                {/* Gantt Bar */}
                                                <div
                                                    className={`absolute top-1 bottom-1 rounded-md border flex items-center overflow-hidden transition-all duration-300 cursor-help ${getStatusStyle(phase.status)}`}
                                                    style={{
                                                        left: `${Math.min(95, leftPercent)}%`,
                                                        width: `${Math.min(100 - leftPercent, widthPercent)}%`,
                                                        minWidth: '40px'
                                                    }}
                                                    title={`${phase.name} - ${phase.progress}% (${phase.status})`}
                                                >
                                                    {/* Progress Fill inside Bar */}
                                                    <div
                                                        className={`absolute top-0 bottom-0 left-0 opacity-40 ${getProgressColor(phase.status)}`}
                                                        style={{ width: `${phase.progress}%` }}
                                                    ></div>
                                                    <span className="relative z-10 px-2 text-[10px] font-bold truncate hidden sm:block">
                                                        {phase.progress}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Phase Details Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {phases.map((phase, index) => (
                        <div key={phase.id} className={`bg-white rounded-xl shadow-sm border p-5 relative overflow-hidden ${phase.status === 'in_progress' ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-100'}`}>
                            {/* Decorative phase number */}
                            <div className="absolute -right-4 -top-6 text-9xl font-black text-gray-50 opacity-50 pointer-events-none">
                                {index + 1}
                            </div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${phase.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                        phase.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            phase.status === 'review' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                'bg-gray-50 text-gray-600 border-gray-200'
                                        }`}>
                                        {phase.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-sm font-bold text-gray-800">{phase.progress}%</span>
                                </div>

                                <h4 className="font-bold text-gray-900 mb-1">{phase.name}</h4>
                                <p className="text-xs text-gray-500 mb-4 line-clamp-2 min-h-[32px]">{phase.description || 'Tidak ada deskripsi spesifik.'}</p>

                                <div className="space-y-2 border-t border-gray-50 pt-3">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Mulai:</span>
                                        <span className="font-medium text-gray-800">{phase.start_date ? new Date(phase.start_date).toLocaleDateString('id-ID') : '-'}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Selesai:</span>
                                        <span className="font-medium text-gray-800">{phase.end_date ? new Date(phase.end_date).toLocaleDateString('id-ID') : '-'}</span>
                                    </div>
                                </div>

                                {phase.approval_workflow && (
                                    <div className="mt-4 pt-3 border-t border-gray-50">
                                        <Link href={route('approvals.index')} className="text-xs font-bold text-indigo-600 flex items-center hover:text-indigo-800">
                                            <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            Terkoneksi ke Approval Workflow
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
