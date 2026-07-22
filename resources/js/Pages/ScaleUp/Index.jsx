import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ auth, scaleUps, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('scaleups.index'), { search, status: statusFilter, category: categoryFilter }, { preserveState: true });
    };

    const getStatusBadge = (status) => {
        const map = {
            draft: 'bg-gray-100 text-gray-700 border-gray-200',
            in_review: 'bg-amber-100 text-amber-700 border-amber-200',
            approved: 'bg-green-100 text-green-700 border-green-200',
            rejected: 'bg-red-100 text-red-700 border-red-200',
            published: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        };
        const labels = {
            draft: 'Draft',
            in_review: 'Dalam Review',
            approved: 'Disetujui',
            rejected: 'Ditolak',
            published: 'Diterbitkan',
        };
        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${map[status] || map.draft}`}>
                {labels[status] || status}
            </span>
        );
    };

    const getCategoryBadge = (cat) => {
        const map = {
            Primer: 'bg-blue-50 text-blue-700 border-blue-200',
            Sekunder: 'bg-purple-50 text-purple-700 border-purple-200',
            Tersier: 'bg-teal-50 text-teal-700 border-teal-200',
        };
        return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${map[cat] || ''}`}>{cat}</span>;
    };

    const canCreate = ['admin', 'rd', 'qc'].includes(auth.user.role?.slug);

    return (
        <AuthenticatedLayout user={auth.user} header="Scale Up - Spesifikasi Bahan Pengemas">
            <Head title="Scale Up" />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Daftar Scale Up</h3>
                            <p className="text-sm text-gray-500 mt-1">Kelola transisi dari trial/sampling ke produksi massal beserta spesifikasi bahan pengemas.</p>
                        </div>
                        {canCreate && (
                            <Link
                                href={route('scaleups.create')}
                                className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 border border-transparent rounded-lg font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm text-sm shrink-0"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Buat Scale Up
                            </Link>
                        )}
                    </div>

                    <form onSubmit={handleFilter} className="mt-6 flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Cari kode, nama material, atau proyek..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            />
                        </div>
                        <div className="sm:w-44">
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm text-gray-700">
                                <option value="">Semua Status</option>
                                <option value="draft">Draft</option>
                                <option value="in_review">Dalam Review</option>
                                <option value="approved">Disetujui</option>
                                <option value="rejected">Ditolak</option>
                                <option value="published">Diterbitkan</option>
                            </select>
                        </div>
                        <div className="sm:w-40">
                            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm text-gray-700">
                                <option value="">Semua Kategori</option>
                                <option value="Primer">Primer</option>
                                <option value="Sekunder">Sekunder</option>
                                <option value="Tersier">Tersier</option>
                            </select>
                        </div>
                        <button type="submit" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                            Filter
                        </button>
                    </form>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Kode</th>
                                <th className="px-6 py-4">Material</th>
                                <th className="px-6 py-4">Proyek</th>
                                <th className="px-6 py-4">Kategori</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Dibuat oleh</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {scaleUps.data.length > 0 ? scaleUps.data.map(su => (
                                <tr key={su.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-mono font-bold text-indigo-600">{su.code}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-800">{su.material_name}</div>
                                        <div className="text-xs text-gray-500">{su.material_type || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {su.project ? (
                                            <div>
                                                <div className="font-medium text-gray-800">{su.project.code}</div>
                                                <div className="text-xs text-gray-500 max-w-[200px] truncate">{su.project.title}</div>
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4">{getCategoryBadge(su.packaging_category)}</td>
                                    <td className="px-6 py-4">{getStatusBadge(su.status)}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-700">{su.creator?.name || '-'}</div>
                                        <div className="text-xs text-gray-400">{new Date(su.created_at).toLocaleDateString('id-ID')}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={route('scaleups.show', su.id)}
                                            className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors border border-indigo-100"
                                        >
                                            Detail →
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Belum ada data Scale Up.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {scaleUps.links && scaleUps.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm text-gray-500">Menampilkan {scaleUps.from || 0} - {scaleUps.to || 0} dari {scaleUps.total} data</span>
                        <div className="flex items-center gap-1">
                            {scaleUps.links.map((link, i) => (
                                <Link key={i} href={link.url} className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${link.active ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
