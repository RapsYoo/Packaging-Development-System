import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ auth, items, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('packaging.items.index'), { search, category: categoryFilter, status: statusFilter }, { preserveState: true });
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'in_review': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'approved': return 'bg-green-100 text-green-700 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            case 'obsolete': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const canManage = ['admin', 'rd'].includes(auth.user.role?.slug);

    return (
        <AuthenticatedLayout user={auth.user} header="Master Data Kemasan">
            <Head title="Master Kemasan" />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Pustaka Standar Kemasan</h3>
                            <p className="text-sm text-gray-500 mt-1">Katalog spesifikasi material, dimensi, dan status persetujuan komponen kemasan.</p>
                        </div>
                        
                        {canManage && (
                            <Link 
                                href={route('packaging.items.create')} 
                                className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 border border-transparent rounded-lg font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm text-sm"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Daftarkan Kemasan Baru
                            </Link>
                        )}
                    </div>

                    <form onSubmit={handleFilter} className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2">
                            <input 
                                type="text" 
                                placeholder="Cari nama, kode item, atau material..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            />
                        </div>
                        <div>
                            <select 
                                value={categoryFilter} 
                                onChange={e => setCategoryFilter(e.target.value)}
                                className="w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm text-gray-700"
                            >
                                <option value="">Semua Kategori</option>
                                <option value="Primary">Primer (Botol, Tube)</option>
                                <option value="Secondary">Sekunder (Box, Inner)</option>
                                <option value="Tertiary">Tersier (Karton, Masterbox)</option>
                                <option value="Label">Label & Sticker</option>
                                <option value="Cap/Closure">Tutup & Pompa</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <select 
                                value={statusFilter} 
                                onChange={e => setStatusFilter(e.target.value)}
                                className="w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm text-gray-700"
                            >
                                <option value="">Semua Status</option>
                                <option value="draft">Draft</option>
                                <option value="in_review">Dalam Review</option>
                                <option value="approved">Approved</option>
                                <option value="obsolete">Obsolete (Usang)</option>
                            </select>
                            <button type="submit" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                                Filter
                            </button>
                        </div>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Item Kemasan</th>
                                <th className="px-6 py-4">Kategori & Material</th>
                                <th className="px-6 py-4">Terkait Proyek</th>
                                <th className="px-6 py-4">Status Approval</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {items.data.length > 0 ? items.data.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold text-xs ${
                                                item.category === 'Primary' ? 'bg-blue-50 text-blue-600' :
                                                item.category === 'Secondary' ? 'bg-purple-50 text-purple-600' :
                                                item.category === 'Label' ? 'bg-pink-50 text-pink-600' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {item.category ? item.category.substring(0, 3).toUpperCase() : 'PKG'}
                                            </div>
                                            <div>
                                                <Link href={route('packaging.items.show', item.id)} className="font-semibold text-gray-800 hover:text-indigo-600 block">
                                                    {item.name}
                                                </Link>
                                                <div className="text-gray-500 text-xs font-mono mt-0.5">{item.code}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-800">{item.category}</div>
                                        <div className="text-gray-500 text-xs mt-0.5">{item.material || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.project ? (
                                            <Link href={route('projects.show', item.project_id)} className="text-indigo-600 hover:underline text-xs font-medium">
                                                {item.project.code}
                                            </Link>
                                        ) : (
                                            <span className="text-gray-400 text-xs italic">Independen</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(item.status)}`}>
                                            {item.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={route('packaging.items.show', item.id)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Lihat Detail">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            </Link>
                                            {canManage && (
                                                <Link href={route('packaging.items.edit', item.id)} className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Edit Data">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                        <p className="text-gray-500">Tidak ada data master kemasan yang ditemukan.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {items.links && items.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm text-gray-500">Menampilkan {items.from || 0} - {items.to || 0} dari {items.total} item</span>
                        <div className="flex items-center gap-1">
                            {items.links.map((link, i) => (
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
