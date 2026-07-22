import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Index({ auth, categories }) {
    const [editingId, setEditingId] = useState(null);
    const [editDescription, setEditDescription] = useState('');

    const canManage = ['admin', 'rd'].includes(auth.user.role?.slug);

    const startEdit = (category) => {
        setEditingId(category.id);
        setEditDescription(category.description || '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditDescription('');
    };

    const saveDescription = (categoryId) => {
        useForm({}).put(route('packaging.categories.update', categoryId), {
            data: { description: editDescription },
            preserveScroll: true,
            onSuccess: () => {
                setEditingId(null);
                setEditDescription('');
            },
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Kategori Kemasan">
            <Head title="Kategori Kemasan" />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">Daftar Kategori Kemasan</h3>
                    <p className="text-sm text-gray-500 mt-1">Kelola kategori bahan kemas (Premier, Sekunder, Tersier).</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4 w-16">No</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4 w-32 text-center">Jumlah Item</th>
                                <th className="px-6 py-4 w-48 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {categories.map((cat, idx) => (
                                <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-gray-500 font-bold">{idx + 1}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-900">{cat.name}</td>
                                    <td className="px-6 py-4">
                                        {editingId === cat.id ? (
                                            <input
                                                type="text"
                                                value={editDescription}
                                                onChange={e => setEditDescription(e.target.value)}
                                                className="w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                                placeholder="Masukkan deskripsi..."
                                            />
                                        ) : (
                                            <span className="text-gray-600">{cat.description || '-'}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                            {cat.items_count || 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {editingId === cat.id ? (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => cancelEdit()}
                                                    className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                                >
                                                    Batal
                                                </button>
                                                <button
                                                    onClick={() => saveDescription(cat.id)}
                                                    className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                                                >
                                                    Simpan
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => canManage && startEdit(cat)}
                                                disabled={!canManage}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                                                    canManage
                                                        ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                                                        : 'text-gray-400 bg-gray-50 cursor-not-allowed'
                                                }`}
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
