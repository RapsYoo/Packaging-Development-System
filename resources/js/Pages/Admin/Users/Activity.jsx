import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Activity({ auth, user, logs }) {
    
    const getActionColor = (action) => {
        switch(action.toLowerCase()) {
            case 'create': return 'bg-green-100 text-green-800 border-green-200';
            case 'update': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'delete': return 'bg-red-100 text-red-800 border-red-200';
            case 'approve': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'reject': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'login': return 'bg-teal-100 text-teal-800 border-teal-200';
            case 'logout': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} header={`Log Aktivitas: ${user.name}`}>
            <Head title={`Aktivitas ${user.name}`} />

            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* User Profile Summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-2xl border-2 border-indigo-200">
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                            <p className="text-gray-500 text-sm mt-0.5">{user.email} &bull; {user.role?.name || 'No Role'}</p>
                            <p className="text-gray-400 text-xs mt-1">Bergabung: {new Date(user.created_at).toLocaleDateString('id-ID')}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <Link href={route('admin.users.index')} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                            &larr; Kembali ke Daftar
                        </Link>
                    </div>
                </div>

                {/* Timeline Log */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <h3 className="font-bold text-gray-800">Timeline Riwayat Tindakan</h3>
                    </div>

                    <div className="p-6">
                        {logs.data.length > 0 ? (
                            <div className="relative border-l border-gray-200 ml-3 space-y-8 pb-4">
                                {logs.data.map(log => (
                                    <div key={log.id} className="relative pl-8">
                                        <div className={`absolute w-4 h-4 rounded-full -left-[9px] top-1 border-2 border-white shadow-sm ${getActionColor(log.action).split(' ')[0]}`}></div>
                                        
                                        <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${getActionColor(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {log.model_type ? log.model_type.split('\\').pop() : 'Sistem'} {log.model_id ? `#${log.model_id}` : ''}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    {new Date(log.created_at).toLocaleString('id-ID')}
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-600 mb-2">
                                                {log.description || 'Melakukan tindakan di dalam sistem.'}
                                                <span className="text-gray-400 text-xs ml-2">({log.ip_address})</span>
                                            </p>

                                            {(log.old_values || log.new_values) && (
                                                <details className="mt-3 text-xs text-gray-500 cursor-pointer group">
                                                    <summary className="font-medium text-indigo-500 group-hover:text-indigo-700 focus:outline-none flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                                        Lihat Detail JSON
                                                    </summary>
                                                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {log.old_values && (
                                                            <div className="bg-gray-800 rounded-lg p-3 overflow-x-auto">
                                                                <p className="text-red-400 font-bold mb-1 border-b border-gray-700 pb-1">DATA LAMA:</p>
                                                                <pre className="text-green-300 font-mono text-[10px] whitespace-pre-wrap">{JSON.stringify(log.old_values, null, 2)}</pre>
                                                            </div>
                                                        )}
                                                        {log.new_values && (
                                                            <div className="bg-gray-800 rounded-lg p-3 overflow-x-auto">
                                                                <p className="text-blue-400 font-bold mb-1 border-b border-gray-700 pb-1">DATA BARU:</p>
                                                                <pre className="text-green-300 font-mono text-[10px] whitespace-pre-wrap">{JSON.stringify(log.new_values, null, 2)}</pre>
                                                            </div>
                                                        )}
                                                    </div>
                                                </details>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Belum ada riwayat aktivitas untuk pengguna ini.
                            </div>
                        )}

                        {logs.links && logs.links.length > 3 && (
                            <div className="pt-6 mt-4 border-t border-gray-100 flex justify-center">
                                <div className="flex gap-1">
                                    {logs.links.map((link, i) => (
                                        <Link 
                                            key={i} 
                                            href={link.url} 
                                            className={`px-3 py-1 text-sm rounded transition-colors ${link.active ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
