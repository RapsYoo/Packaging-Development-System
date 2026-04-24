import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function AuditIndex({ auth, logs, actions, models, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [actionFilter, setActionFilter] = useState(filters.action || '');
    const [modelFilter, setModelFilter] = useState(filters.model_type || '');
    const [dateFilter, setDateFilter] = useState(filters.date || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.audit.index'), { 
            search, 
            action: actionFilter, 
            model_type: modelFilter,
            date: dateFilter
        }, { preserveState: true });
    };

    const clearFilters = () => {
        setSearch(''); setActionFilter(''); setModelFilter(''); setDateFilter('');
        router.get(route('admin.audit.index'));
    };

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
        <AuthenticatedLayout user={auth.user} header="System Audit Trail">
            <Head title="Audit Trail" />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/30">
                    <h3 className="text-lg font-bold text-gray-800">Catatan Aktivitas Sistem</h3>
                    <p className="text-sm text-gray-500 mt-1">Lacak semua perubahan data dan aktivitas user untuk keperluan keamanan dan audit mutu.</p>

                    <form onSubmit={handleFilter} className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div className="md:col-span-2">
                            <input 
                                type="text" 
                                placeholder="Cari user atau deskripsi..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            />
                        </div>
                        <div>
                            <select 
                                value={actionFilter} 
                                onChange={e => setActionFilter(e.target.value)}
                                className="w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm text-gray-700"
                            >
                                <option value="">Semua Aksi</option>
                                {actions.map(a => <option key={a} value={a}>{a.toUpperCase()}</option>)}
                            </select>
                        </div>
                        <div>
                            <select 
                                value={modelFilter} 
                                onChange={e => setModelFilter(e.target.value)}
                                className="w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm text-gray-700"
                            >
                                <option value="">Semua Tabel</option>
                                {models.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <input 
                                type="date" 
                                value={dateFilter}
                                onChange={e => setDateFilter(e.target.value)}
                                className="flex-1 rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm text-gray-700"
                            />
                            <button type="submit" className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </button>
                            <button type="button" onClick={clearFilters} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition-colors" title="Reset Filters">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            </button>
                        </div>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Waktu</th>
                                <th className="px-6 py-4">Pengguna</th>
                                <th className="px-6 py-4">Aksi</th>
                                <th className="px-6 py-4">Modul / ID</th>
                                <th className="px-6 py-4 w-1/3">Detail Perubahan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {logs.data.length > 0 ? logs.data.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-gray-800 font-medium">{new Date(log.created_at).toLocaleDateString('id-ID')}</div>
                                        <div className="text-gray-500 text-xs">{new Date(log.created_at).toLocaleTimeString('id-ID')} WIB</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                                {log.user?.name.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-800">{log.user?.name || 'Sistem'}</div>
                                                <div className="text-gray-400 text-xs">{log.ip_address}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border uppercase tracking-wider ${getActionColor(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {log.model_type ? (
                                            <>
                                                <div className="font-medium text-gray-700">{log.model_type.split('\\').pop()}</div>
                                                <div className="text-xs text-gray-500">ID: {log.model_id}</div>
                                            </>
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-700 mb-1">{log.description || '-'}</div>
                                        
                                        {/* Perubahan Data JSON (New vs Old) */}
                                        {(log.old_values || log.new_values) && (
                                            <details className="mt-2 text-xs text-gray-500 cursor-pointer">
                                                <summary className="font-medium text-indigo-600 hover:text-indigo-800 focus:outline-none">Lihat Data Mentah (JSON)</summary>
                                                <div className="mt-2 p-3 bg-gray-800 text-green-400 rounded-lg overflow-x-auto font-mono whitespace-pre text-[10px]">
                                                    {log.old_values && <div><span className="text-gray-400">OLD:</span> {JSON.stringify(log.old_values, null, 2)}</div>}
                                                    {log.new_values && <div className="mt-2"><span className="text-gray-400">NEW:</span> {JSON.stringify(log.new_values, null, 2)}</div>}
                                                </div>
                                            </details>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        Tidak ada catatan log ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {logs.links && logs.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <span className="text-sm text-gray-500">Hal. {logs.current_page} dari {logs.last_page}</span>
                        <div className="flex gap-1">
                            {logs.links.map((link, i) => (
                                <Link 
                                    key={i} 
                                    href={link.url} 
                                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${link.active ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
