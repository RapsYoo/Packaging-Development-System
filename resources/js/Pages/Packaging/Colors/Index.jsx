import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';

export default function Index({ auth, colors, masterSpecs }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        master_spec_id: '',
        pantone_code: '',
        color_name: '',
        tolerance_de: '',
        status: 'active'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('packaging.colors.store'), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Standar Warna Kemasan">
            <Head title="Standar Warna" />

            <div className="max-w-7xl mx-auto space-y-6">
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Manajemen Standar Warna (Pantone)</h3>
                            <p className="text-sm text-gray-500 mt-1">Kelola batas toleransi Delta E (ΔE) dan target warna kemasan untuk panduan produksi.</p>
                        </div>
                        
                        {['admin', 'rd'].includes(auth.user.role?.slug) && (
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors shadow-sm flex items-center"
                            >
                                <svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                Daftarkan Warna Baru
                            </button>
                        )}
                    </div>

                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {colors.data.length > 0 ? colors.data.map(color => (
                            <div key={color.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                {/* Color Swatch Area */}
                                <div className="h-32 w-full relative flex items-center justify-center bg-gray-50 border-b border-gray-100">
                                    <div className="text-center">
                                        <svg className="w-10 h-10 mx-auto text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M19.36 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.36 8.04A5.994 5.994 0 004 20h15c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.64-4.96z" /></svg>
                                        <p className="text-xs font-mono font-bold text-gray-400 mt-2">{color.pantone_code}</p>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-gray-900 truncate">{color.color_name}</h4>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${color.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {color.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-4">{color.master_spec?.item_name_rm || 'Terkait semua'}</p>
                                    
                                    <div className="flex justify-between items-center text-xs border-t border-gray-100 pt-3">
                                        <span className="text-gray-500">Toleransi (ΔE)</span>
                                        <span className="font-bold text-indigo-600">&le; {color.tolerance_de || '2.0'}</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-12 text-center">
                                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                                <p className="text-gray-500">Belum ada standar warna yang didaftarkan.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Color Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setIsModalOpen(false)}></div>
                            <div className="relative inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                                <h3 className="text-lg font-bold text-gray-900 mb-5">Daftarkan Standar Warna</h3>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Item Kemasan Terkait <span className="text-red-500">*</span></label>
                                        <select 
                                            value={data.master_spec_id} 
                                            onChange={e => setData('master_spec_id', e.target.value)}
                                            className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm"
                                        >
                                            <option value="">-- Pilih Master Spec --</option>
                                            {masterSpecs?.map(item => (
                                                <option key={item.id} value={item.id}>[{item.item_code_rm}] {item.item_name_rm}</option>
                                            ))}
                                        </select>
                                        {errors.master_spec_id && <p className="mt-1 text-xs text-red-600">{errors.master_spec_id}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Warna <span className="text-red-500">*</span></label>
                                        <input type="text" value={data.color_name} onChange={e => setData('color_name', e.target.value)} className="w-full rounded-lg border-gray-200 text-sm" placeholder="Contoh: Red Priskila 01" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Kode Pantone / HEX</label>
                                        <input type="text" value={data.pantone_code} onChange={e => setData('pantone_code', e.target.value)} className="w-full rounded-lg border-gray-200 text-sm font-mono" placeholder="Contoh: PANTONE 185 C" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Toleransi Warna (Delta E / ΔE) <span className="text-red-500">*</span></label>
                                        <input type="number" step="0.1" value={data.tolerance_de} onChange={e => setData('tolerance_de', e.target.value)} className="w-full rounded-lg border-gray-200 text-sm" placeholder="Contoh: 2.0" />
                                    </div>
                                    <div className="mt-6 flex justify-end gap-3">
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
                                        <button type="submit" disabled={processing} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 disabled:opacity-50">Simpan Warna</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
