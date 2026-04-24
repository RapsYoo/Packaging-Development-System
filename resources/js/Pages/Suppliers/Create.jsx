import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        capabilities: '',
        status: 'active'
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('suppliers.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Pendaftaran Vendor / Supplier">
            <Head title="Daftarkan Vendor Baru" />

            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <h3 className="font-bold text-gray-800">Form Pendaftaran Vendor Rekanan</h3>
                        <Link href={route('suppliers.index')} className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
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
                                    placeholder="PT. Pabrik Kemasan Makmur"
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-600 font-medium">{errors.name}</p>}
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Kode Vendor Sistem (Opsional)</label>
                                <input 
                                    type="text" 
                                    value={data.code} 
                                    onChange={e => setData('code', e.target.value)}
                                    className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm font-mono"
                                    placeholder="VND-001"
                                />
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
                                    placeholder="marketing@pabrik.com"
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
                                    placeholder="+62 812..."
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Lengkap Pabrik</label>
                                <textarea 
                                    value={data.address} 
                                    onChange={e => setData('address', e.target.value)}
                                    rows="3"
                                    className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm"
                                    placeholder="Kawasan Industri..."
                                ></textarea>
                            </div>

                            <div className="col-span-2">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Spesialisasi Produksi</h4>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Kapabilitas / Jenis Kemasan (Pisahkan dengan koma)</label>
                                <input 
                                    type="text" 
                                    value={data.capabilities} 
                                    onChange={e => setData('capabilities', e.target.value)}
                                    className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm"
                                    placeholder="Contoh: Botol Kaca, Pompa Spray, Cetak Offset Box"
                                />
                                <p className="mt-1 text-xs text-gray-500">Membantu pencarian vendor saat tender proyek baru.</p>
                            </div>

                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                            <button 
                                type="submit" 
                                disabled={processing}
                                className="px-6 py-2.5 bg-indigo-600 border border-transparent text-white rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-md disabled:opacity-50 text-sm"
                            >
                                {processing ? 'Mendaftarkan...' : 'Daftarkan Vendor'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
