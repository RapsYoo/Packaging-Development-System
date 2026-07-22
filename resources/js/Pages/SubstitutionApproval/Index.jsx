import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ auth, approvals, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('substitusi-approvals.index'), { search, status: statusFilter }, { preserveState: true });
    };

    const getStatusDocColor = (statusDoc) => {
        switch (statusDoc) {
            case 'Draft': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'Pending': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Closed': return 'bg-green-100 text-green-700 border-green-200';
            case 'Cancel': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusApprovalColor = (statusApproval) => {
        switch (statusApproval) {
            case 'Waiting Approval': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Approved': return 'bg-green-100 text-green-700 border-green-200';
            case 'Reject Approval': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-50 text-gray-400 border-gray-100';
        }
    };

    const canCreate = ['admin', 'scm', 'rd'].includes(auth.user.role?.slug);

    return (
        <AuthenticatedLayout user={auth.user} header="Form Approval Substitusi Bahan Kemas">
            <Head title="Form Approval Substitusi Bahan Kemas" />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Daftar Pengajuan Substitusi</h3>
                            <p className="text-sm text-gray-500 mt-1">Kelola dan telusuri sirkulasi approval substitusi bahan kemas (FABK Substitusi).</p>
                        </div>

                        {canCreate && (
                            <Link
                                href={route('substitusi-approvals.create')}
                                className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 border border-transparent rounded-lg font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm text-sm shrink-0"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Buat Form Baru
                            </Link>
                        )}
                    </div>

                    <form onSubmit={handleFilter} className="mt-6 flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Cari nomor dokumen, produk, atau supplier..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            />
                        </div>
                        <div className="sm:w-48">
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm text-gray-700"
                            >
                                <option value="">Semua Status</option>
                                <option value="draft">Draft</option>
                                <option value="submitted">Pending</option>
                                <option value="approved">Closed</option>
                                <option value="rejected">Cancel</option>
                            </select>
                        </div>
                        <button type="submit" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                            Filter
                        </button>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    {approvals.data.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Document Name</th>
                                    <th className="px-6 py-4">Status Doc</th>
                                    <th className="px-6 py-4">Status Approval</th>
                                    <th className="px-6 py-4">Sub Module</th>
                                    <th className="px-6 py-4">Module</th>
                                    <th className="px-6 py-4">PIC</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {approvals.data.map(app => (
                                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <Link href={route('substitusi-approvals.show', app.id)} className="font-mono font-bold text-indigo-600 hover:underline text-sm">
                                                    {app.document_no}
                                                </Link>
                                                <p className="text-xs text-gray-500 mt-0.5">{app.product_name} — {app.supplier}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${getStatusDocColor(app.status_doc_label)}`}>
                                                {app.status_doc_label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold tracking-wider border ${getStatusApprovalColor(app.status_approval_label)}`}>
                                                {app.status_approval_label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                                {app.packaging_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-xs font-semibold">Substitusi Bahan Kemas</td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-md">{app.current_pic}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={route('substitusi-approvals.show', app.id)}
                                                    className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                                                >
                                                    {app.status === 'draft' ? 'Edit' : 'View Detail'}
                                                </Link>
                                                {app.status === 'draft' && canCreate && (
                                                    <Link
                                                        href={route('substitusi-approvals.edit', app.id)}
                                                        className="px-3 py-1.5 text-xs font-bold text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                                                    >
                                                        Edit
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-16 text-center">
                            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h4 className="text-lg font-bold text-gray-700">Belum ada pengajuan</h4>
                            <p className="text-gray-500 mt-1 max-w-md mx-auto">Silakan buat pengajuan form approval baru untuk memulai sirkulasi approval substitusi bahan kemas.</p>
                            {canCreate && (
                                <Link href={route('substitusi-approvals.create')} className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700">
                                    Buat Pengajuan Baru
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {approvals.links && approvals.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm text-gray-500">Menampilkan {approvals.from || 0} - {approvals.to || 0} dari {approvals.total} pengajuan</span>
                        <div className="flex items-center gap-1">
                            {approvals.links.map((link, i) => (
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
