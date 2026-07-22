import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ auth, packagingApprovals, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || '');

    const userRole = auth.user.role?.slug;
    const canCreate = ['admin', 'scm'].includes(userRole);

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('packaging-approvals.index'), { search, status: statusFilter, category: categoryFilter }, { preserveState: true });
    };

    const getStatusBadge = (status) => {
        const map = {
            draft: 'bg-gray-100 text-gray-700 border-gray-200',
            submitted: 'bg-blue-100 text-blue-700 border-blue-200',
            in_review: 'bg-amber-100 text-amber-700 border-amber-200',
            approved: 'bg-green-100 text-green-700 border-green-200',
            rejected: 'bg-red-100 text-red-700 border-red-200',
        };
        const labels = { draft: 'Draft', submitted: 'Diajukan', in_review: 'Dalam Review', approved: 'Disetujui', rejected: 'Ditolak' };
        return <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${map[status]}`}>{labels[status]}</span>;
    };



    return (
        <AuthenticatedLayout user={auth.user} header="Form Approval Bahan Kemas">
            <Head title="Form Approval Bahan Kemas" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Dokumen formulir persetujuan sampel bahan kemas.</p>
                    </div>
                    {canCreate && (
                        <Link href={route('packaging-approvals.create')} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md inline-flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            Buat Form Baru
                        </Link>
                    )}
                </div>

                {/* Filter */}
                <form onSubmit={handleFilter} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex flex-wrap gap-3 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Cari</label>
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Kode, nama bahan, supplier..." className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500" />
                        </div>
                        <div className="w-40">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500">
                                <option value="">Semua</option>
                                <option value="draft">Draft</option>
                                <option value="submitted">Diajukan</option>
                                <option value="approved">Disetujui</option>
                                <option value="rejected">Ditolak</option>
                            </select>
                        </div>
                        <div className="w-40">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Kategori</label>
                            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500">
                                <option value="">Semua</option>
                                <option value="Primer">Primer</option>
                                <option value="Sekunder">Sekunder</option>
                                <option value="Tersier">Tersier</option>
                            </select>
                        </div>
                        <button type="submit" className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">Filter</button>
                    </div>
                </form>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100">
                                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">Document No.</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">Nama Produk</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">Bahan Kemas</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">Approval</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {packagingApprovals.data?.length > 0 ? packagingApprovals.data.map(item => (
                                    <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors">
                                        <td className="px-5 py-4">
                                            <Link href={route('packaging-approvals.show', item.id)} className="font-mono font-bold text-indigo-600 text-sm hover:underline">
                                                {item.document_no}
                                            </Link>
                                        </td>
                                        <td className="px-5 py-4 text-sm font-medium text-gray-900">{item.product_name}</td>
                                        <td className="px-5 py-4">
                                            <div className="text-sm text-gray-600">{item.packaging_type}</div>
                                            <div className="text-xs text-gray-500">{item.supplier || '-'}</div>
                                        </td>
                                        <td className="px-5 py-4">{getStatusBadge(item.status)}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex gap-1">
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${item.decision_rd === 'approved' ? 'bg-green-500 text-white' : item.decision_rd === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'}`} title="R&D">RD</span>
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${item.approved_by_brand ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`} title="Brand">BR</span>
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${item.approved_by_marketing ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`} title="Marketing">MK</span>
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${item.approved_by_commercial ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`} title="Commercial">CM</span>
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${item.approved_by_bod ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`} title="BOD">BD</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="7" className="px-5 py-12 text-center text-gray-400">Belum ada data Form Approval Bahan Kemas.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
