import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ auth, users, roles, departments, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.users.index'), { search, role: roleFilter, status: statusFilter }, { preserveState: true });
    };

    const toggleStatus = (user) => {
        if (confirm(`Apakah Anda yakin ingin ${user.is_active ? 'menonaktifkan' : 'mengaktifkan'} akun ${user.name}?`)) {
            router.post(route('admin.users.toggleStatus', user.id), {}, { preserveScroll: true });
        }
    };

    const resetPassword = (user) => {
        if (confirm(`Kirim link reset password atau buat password sementara untuk ${user.name}?`)) {
            router.post(route('admin.users.resetPassword', user.id), {}, { preserveScroll: true });
        }
    };

    const destroyUser = (user) => {
        if (user.id === auth.user.id) {
            alert("Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.");
            return;
        }
        if (confirm(`PERINGATAN: Apakah Anda yakin ingin menghapus akun ${user.name}? Data akan masuk ke sistem recycle bin (Soft Delete).`)) {
            router.delete(route('admin.users.destroy', user.id), { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Manajemen User">
            <Head title="Manajemen User" />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header & Filters */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="text-lg font-bold text-gray-800">Daftar Pengguna Sistem</h3>
                        <Link 
                            href={route('admin.users.create')} 
                            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 border border-transparent rounded-lg font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm text-sm"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Tambah User
                        </Link>
                    </div>

                    <form onSubmit={handleFilter} className="mt-6 flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <input 
                                type="text" 
                                placeholder="Cari nama atau email..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            />
                        </div>
                        <div className="sm:w-48">
                            <select 
                                value={roleFilter} 
                                onChange={e => setRoleFilter(e.target.value)}
                                className="w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm text-gray-700"
                            >
                                <option value="">Semua Role</option>
                                {roles.map(r => <option key={r.id} value={r.slug}>{r.name}</option>)}
                            </select>
                        </div>
                        <div className="sm:w-48">
                            <select 
                                value={statusFilter} 
                                onChange={e => setStatusFilter(e.target.value)}
                                className="w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm text-gray-700"
                            >
                                <option value="">Semua Status</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Nonaktif</option>
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
                                <th className="px-6 py-4">User Info</th>
                                <th className="px-6 py-4">Role & Dept</th>
                                <th className="px-6 py-4">Login Terakhir</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.data.length > 0 ? users.data.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-800">{user.name}</div>
                                                <div className="text-gray-500 text-xs">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                            {user.role?.name || 'No Role'}
                                        </span>
                                        <div className="text-gray-500 text-xs mt-1">{user.department || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">
                                        {user.last_login_at ? (
                                            <>
                                                <div>{new Date(user.last_login_at).toLocaleDateString('id-ID')}</div>
                                                <div>{new Date(user.last_login_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})} WIB</div>
                                            </>
                                        ) : 'Belum pernah login'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button 
                                            onClick={() => toggleStatus(user)}
                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                                                user.is_active 
                                                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                                                    : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                            }`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            {user.is_active ? 'Aktif' : 'Nonaktif'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={route('admin.users.edit', user.id)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit Data">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </Link>
                                            <button onClick={() => resetPassword(user)} className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Reset Password">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                                            </button>
                                            <Link href={route('admin.users.activity', user.id)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Audit Trail">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                            </Link>
                                            <button onClick={() => destroyUser(user)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus User">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        Tidak ada data pengguna ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {users.links && users.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm text-gray-500">Menampilkan {users.from || 0} - {users.to || 0} dari {users.total} data</span>
                        <div className="flex items-center gap-1">
                            {users.links.map((link, i) => (
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
