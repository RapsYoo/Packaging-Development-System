import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ auth, roles }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role_id: '',
        department: '',
        phone: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.users.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Tambah User Baru">
            <Head title="Tambah User" />

            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <h3 className="font-bold text-gray-800">Formulir Pendaftaran Akun</h3>
                        <Link href={route('admin.users.index')} className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
                            &larr; Kembali ke Daftar
                        </Link>
                    </div>

                    <form onSubmit={submit} className="p-6 sm:p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nama Lengkap */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    value={data.name} 
                                    onChange={e => setData('name', e.target.value)}
                                    className={`w-full rounded-lg text-sm ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`}
                                    placeholder="Masukkan nama lengkap user"
                                />
                                {errors.name && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Email <span className="text-red-500">*</span></label>
                                <input 
                                    type="email" 
                                    value={data.email} 
                                    onChange={e => setData('email', e.target.value)}
                                    className={`w-full rounded-lg text-sm ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`}
                                    placeholder="email@priskila.co.id"
                                />
                                {errors.email && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.email}</p>}
                            </div>

                            {/* Role */}
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Role / Hak Akses <span className="text-red-500">*</span></label>
                                <select 
                                    value={data.role_id} 
                                    onChange={e => setData('role_id', e.target.value)}
                                    className={`w-full rounded-lg text-sm ${errors.role_id ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`}
                                >
                                    <option value="">-- Pilih Role --</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                                {errors.role_id && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.role_id}</p>}
                            </div>

                            {/* Password */}
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password Sementara <span className="text-red-500">*</span></label>
                                <input 
                                    type="password" 
                                    value={data.password} 
                                    onChange={e => setData('password', e.target.value)}
                                    className={`w-full rounded-lg text-sm ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`}
                                    placeholder="Minimal 8 karakter"
                                />
                                {errors.password && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.password}</p>}
                            </div>

                            {/* Konfirmasi Password */}
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password <span className="text-red-500">*</span></label>
                                <input 
                                    type="password" 
                                    value={data.password_confirmation} 
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    className={`w-full rounded-lg text-sm border-gray-200 focus:ring-indigo-500`}
                                    placeholder="Ulangi password"
                                />
                            </div>

                            {/* Departemen */}
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Departemen</label>
                                <input 
                                    type="text" 
                                    value={data.department} 
                                    onChange={e => setData('department', e.target.value)}
                                    className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm"
                                    placeholder="Contoh: R&D Packaging"
                                />
                                {errors.department && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.department}</p>}
                            </div>

                            {/* Nomor Telepon */}
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
                                <input 
                                    type="text" 
                                    value={data.phone} 
                                    onChange={e => setData('phone', e.target.value)}
                                    className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm"
                                    placeholder="+62 8..."
                                />
                                {errors.phone && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.phone}</p>}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                            <button 
                                type="submit" 
                                disabled={processing}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Akun Baru'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
