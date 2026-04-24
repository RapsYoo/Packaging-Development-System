import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function RbacIndex({ auth, roles, permissions, modules }) {
    // Build initial matrix state based on existing role_permissions
    const initialMatrix = {};
    roles.forEach(role => {
        initialMatrix[role.id] = {};
        permissions.forEach(perm => {
            const hasPerm = role.permissions.find(p => p.id === perm.id);
            initialMatrix[role.id][perm.id] = hasPerm ? hasPerm.pivot.access_level : 'none';
        });
    });

    const [matrix, setMatrix] = useState(initialMatrix);
    const [isSaving, setIsSaving] = useState(false);

    const handleAccessChange = (roleId, permId, level) => {
        setMatrix(prev => ({
            ...prev,
            [roleId]: {
                ...prev[roleId],
                [permId]: level
            }
        }));
    };

    const handleSave = () => {
        setIsSaving(true);
        router.put(route('admin.rbac.update'), { matrix }, {
            preserveScroll: true,
            onFinish: () => setIsSaving(false)
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header="RBAC Setup (Matriks Akses)">
            <Head title="RBAC Setup" />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Matriks Hak Akses Sistem</h3>
                        <p className="text-sm text-gray-500 mt-1">Atur wewenang fitur untuk setiap role. "All" (Bisa Edit/Hapus), "Own" (Hanya miliknya), "Read" (Hanya Lihat), "None" (Tidak ada akses).</p>
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex items-center justify-center px-6 py-2.5 bg-indigo-600 border border-transparent rounded-lg font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm text-sm disabled:opacity-50"
                    >
                        {isSaving ? 'Menyimpan...' : 'Simpan Matriks'}
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-100/50 text-gray-700 font-bold border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 sticky left-0 z-10 bg-gray-100/90 backdrop-blur-sm min-w-[200px] border-r border-gray-200 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                    Modul / Fitur
                                </th>
                                {roles.map(role => (
                                    <th key={role.id} className="px-6 py-4 text-center min-w-[150px]">
                                        {role.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {Object.entries(modules).map(([moduleName, perms]) => (
                                <React.Fragment key={moduleName}>
                                    <tr className="bg-indigo-50/30">
                                        <td colSpan={roles.length + 1} className="px-6 py-3 font-bold text-indigo-800 uppercase tracking-wider text-xs">
                                            📦 Modul: {moduleName}
                                        </td>
                                    </tr>
                                    {perms.map(perm => (
                                        <tr key={perm.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 sticky left-0 z-10 bg-white group-hover:bg-gray-50/50 border-r border-gray-100">
                                                <div className="font-semibold text-gray-800">{perm.feature}</div>
                                                <div className="text-gray-400 text-xs mt-0.5">{perm.slug}</div>
                                            </td>
                                            {roles.map(role => (
                                                <td key={`${role.id}-${perm.id}`} className="px-4 py-3 text-center border-l border-gray-50">
                                                    <select 
                                                        value={matrix[role.id]?.[perm.id] || 'none'}
                                                        onChange={(e) => handleAccessChange(role.id, perm.id, e.target.value)}
                                                        className={`text-xs rounded-md border-gray-200 py-1.5 pl-3 pr-8 focus:ring-indigo-500 focus:border-indigo-500 font-medium ${
                                                            matrix[role.id]?.[perm.id] === 'all' ? 'bg-green-50 text-green-700 border-green-200' :
                                                            matrix[role.id]?.[perm.id] === 'own' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                            matrix[role.id]?.[perm.id] === 'read' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                            'bg-gray-50 text-gray-400 border-gray-100'
                                                        }`}
                                                    >
                                                        <option value="none">Block</option>
                                                        <option value="read">Read Only</option>
                                                        <option value="own">Manage Own</option>
                                                        <option value="all">Full Access</option>
                                                    </select>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start shadow-sm mt-6">
                <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div className="text-sm text-blue-800">
                    <strong>Panduan Level Akses:</strong>
                    <ul className="list-disc ml-5 mt-1 space-y-1">
                        <li><strong>Full Access (All)</strong>: User dapat membuat, melihat, mengedit, dan menghapus semua data pada fitur ini.</li>
                        <li><strong>Manage Own (Own)</strong>: User hanya dapat mengedit/menghapus data yang mereka buat sendiri.</li>
                        <li><strong>Read Only (Read)</strong>: User hanya dapat melihat data, tidak bisa menambah atau mengubahnya.</li>
                        <li><strong>Block (None)</strong>: Fitur disembunyikan dan diakses akan diblokir oleh sistem.</li>
                    </ul>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
