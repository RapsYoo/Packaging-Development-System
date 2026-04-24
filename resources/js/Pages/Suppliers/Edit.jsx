import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ auth, supplier }) {
    const { data, setData, put, processing, errors } = useForm({
        name: supplier.name || '',
        code: supplier.code || '',
        contact_person: supplier.contact_person || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        capabilities: supplier.capabilities || '',
        status: supplier.status || 'active'
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('suppliers.update', supplier.id));
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Edit Data Vendor / Supplier">
            <Head title={`Edit Vendor - ${supplier.name}`} />

            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-gray-800">Ubah Profil Vendor</h3>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">{supplier.code}</p>
                        </div>
                        <Link href={route('suppliers.show', supplier.id)} className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
                            &larr; Batal & Kembali
                        </Link>
                    </div>

                    <form onSubmit={submit} className="p-6 sm:p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Perusahaan Vendor <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    value={data.name} 
                                    onChange={e => setData('name', e.target.value)}
                                    className={`w-full rounded-lg text-sm ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`}
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-600 font-medium">{errors.name}</p>}
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status Operasional <span className="text-red-500">*</span></label>
                                <select 
                                    value={data.status} 
                                    onChange={e => setData('status', e.target.value)}
                                    className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm font-medium"
                                >
                                    <option value="active">Active (Rutin)</option>
                                    <option value="inactive">Inactive (Jarang Order)</option>
                                    <option value="blacklisted">Blacklisted (Di-Banned)</option>
                                </select>
                            </div>

                            <div className="col-span-2">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Informasi Kontak & Alamat</h4>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nama PIC (Contact Person) <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    value={data.contact_person} 
                                    onChange={e => setData('contact_person', e.target.value)}
                                    className={`w-full rounded-lg text-sm ${errors.contact_person ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`}
                                />
                                {errors.contact_person && <p className="mt-1 text-xs text-red-600 font-medium">{errors.contact_person}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Email <span className="text-red-500">*</span></label>
                                <input 
                                    type="email" 
                                    value={data.email} 
                                    onChange={e => setData('email', e.target.value)}
                                    className={`w-full rounded-lg text-sm ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`}
                                />
                                {errors.email && <p className="mt-1 text-xs text-red-600 font-medium">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon / WhatsApp</label>
                                <input 
                                    type="text" 
                                    value={data.phone} 
                                    onChange={e => setData('phone', e.target.value)}
                                    className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Lengkap Pabrik</label>
                                <textarea 
                                    value={data.address} 
                                    onChange={e => setData('address', e.target.value)}
                                    rows="3"
                                    className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm"
                                ></textarea>
                            </div>

                            <div className="col-span-2">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Spesialisasi Produksi</h4>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Kapabilitas / Jenis Kemasan</label>
                                <input 
                                    type="text" 
                                    value={data.capabilities} 
                                    onChange={e => setData('capabilities', e.target.value)}
                                    className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm"
                                />
                            </div>

                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                            <button 
                                type="submit" 
                                disabled={processing}
                                className="px-6 py-2.5 bg-indigo-600 border border-transparent text-white rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-md disabled:opacity-50 text-sm"
                            >
                                {processing ? 'Menyimpan...' : 'Perbarui Data Vendor'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
