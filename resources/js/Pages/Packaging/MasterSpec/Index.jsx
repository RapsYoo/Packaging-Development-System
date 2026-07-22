import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ auth, specs, products, groups, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [fgFilter, setFgFilter] = useState(filters.fg_code || '');
    const [groupFilter, setGroupFilter] = useState(filters.group || '');
    const [expandedRow, setExpandedRow] = useState(null);

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('packaging.master-spec.index'), {
            search, fg_code: fgFilter, group: groupFilter
        }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Master Database Spec PM">
            <Head title="Master Spec Kemasan" />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                {/* Header & Filters */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Master Database Spec Kemasan</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Database spesifikasi material kemasan berdasarkan dokumen Master Spec PM.
                                Total: <span className="font-semibold text-indigo-600">{specs.total}</span> komponen.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleFilter} className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2">
                            <input
                                type="text"
                                placeholder="Cari nama produk, kode item, material, supplier..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            />
                        </div>
                        <div>
                            <select
                                value={fgFilter}
                                onChange={e => setFgFilter(e.target.value)}
                                className="w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm text-gray-700"
                            >
                                <option value="">Semua Produk FG</option>
                                {products.map(p => (
                                    <option key={p.item_code_fg} value={p.item_code_fg}>
                                        {p.item_code_fg} - {(p.item_name_fg || '').substring(0, 40)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={groupFilter}
                                onChange={e => setGroupFilter(e.target.value)}
                                className="w-full rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm text-gray-700"
                            >
                                <option value="">Semua Group</option>
                                {groups.map(g => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                            <button type="submit" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                                Filter
                            </button>
                        </div>
                    </form>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-3 py-3">#</th>
                                <th className="px-3 py-3">Kode FG</th>
                                <th className="px-3 py-3">Nama Produk FG</th>
                                <th className="px-3 py-3">Kode RM</th>
                                <th className="px-3 py-3">Nama Material RM</th>
                                <th className="px-3 py-3">Supplier</th>
                                <th className="px-3 py-3">Bentuk</th>
                                <th className="px-3 py-3">Material</th>
                                <th className="px-3 py-3">Warna Dasar</th>
                                <th className="px-3 py-3">Warna Cetakan</th>
                                <th className="px-3 py-3">Dimensi (P/L/T/Tebal)</th>
                                <th className="px-3 py-3">Berat (g)</th>
                                <th className="px-3 py-3">Volume (ml)</th>
                                <th className="px-3 py-3">Barcode</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {specs.data.length > 0 ? specs.data.map((spec, idx) => (
                                <tr
                                    key={spec.id}
                                    className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${
                                        expandedRow === spec.id ? 'bg-indigo-50/30' : ''
                                    }`}
                                    onClick={() => setExpandedRow(expandedRow === spec.id ? null : spec.id)}
                                >
                                    <td className="px-3 py-2.5 text-gray-400">{specs.from + idx}</td>
                                    <td className="px-3 py-2.5">
                                        <span className="font-mono font-semibold text-indigo-600">{spec.item_code_fg}</span>
                                    </td>
                                    <td className="px-3 py-2.5 max-w-[200px]">
                                        <span className="truncate block text-gray-700 font-medium" title={spec.item_name_fg}>
                                            {(spec.item_name_fg || '').substring(0, 45)}{(spec.item_name_fg || '').length > 45 ? '...' : ''}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <span className="font-mono text-gray-600">{spec.item_code_rm}</span>
                                    </td>
                                    <td className="px-3 py-2.5 max-w-[220px]">
                                        <span className="truncate block text-gray-800" title={spec.item_name_rm}>
                                            {(spec.item_name_rm || '').substring(0, 50)}{(spec.item_name_rm || '').length > 50 ? '...' : ''}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2.5 max-w-[160px]">
                                        <span className="truncate block text-gray-500" title={spec.supplier}>
                                            {(spec.supplier || '').substring(0, 30)}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2.5">
                                        {spec.bentuk && (
                                            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                {spec.bentuk}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-3 py-2.5 text-gray-600">{spec.material}</td>
                                    <td className="px-3 py-2.5 text-gray-600">{spec.warna_dasar}</td>
                                    <td className="px-3 py-2.5 text-gray-600 max-w-[120px]">
                                        <span className="truncate block" title={spec.warna_cetakan}>{spec.warna_cetakan}</span>
                                    </td>
                                    <td className="px-3 py-2.5 text-gray-500 font-mono text-[10px]">
                                        {spec.panjang && spec.lebar && spec.tinggi
                                            ? `${spec.panjang} / ${spec.lebar} / ${spec.tinggi}`
                                            : spec.panjang || '-'}
                                        {spec.tebal ? ` (t: ${spec.tebal})` : ''}
                                    </td>
                                    <td className="px-3 py-2.5 text-gray-500 font-mono">{spec.berat || '-'}</td>
                                    <td className="px-3 py-2.5 text-gray-500 font-mono">{spec.volume || '-'}</td>
                                    <td className="px-3 py-2.5 text-gray-400 font-mono text-[10px]">{spec.barcode || '-'}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="14" className="px-6 py-12 text-center">
                                        <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                        <p className="text-gray-500">Tidak ada data spesifikasi yang ditemukan.</p>
                                        <p className="text-xs text-gray-400 mt-1">Pastikan data master sudah di-import dari dokumen Excel.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Expanded Detail */}
                {expandedRow && specs.data.find(s => s.id === expandedRow) && (
                    <div className="px-6 py-4 bg-indigo-50/30 border-t border-indigo-100">
                        {(() => {
                            const s = specs.data.find(s => s.id === expandedRow);
                            return (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <DetailField label="Kode FG" value={s.item_code_fg} />
                                    <DetailField label="Nama Produk" value={s.item_name_fg} />
                                    <DetailField label="Kode RM" value={s.item_code_rm} />
                                    <DetailField label="Nama Material" value={s.item_name_rm} />
                                    <DetailField label="Supplier" value={s.supplier} />
                                    <DetailField label="Bentuk" value={s.bentuk} />
                                    <DetailField label="Material" value={s.material} />
                                    <DetailField label="Warna Dasar" value={s.warna_dasar} />
                                    <DetailField label="Warna Cetakan" value={s.warna_cetakan} />
                                    <DetailField label="Panjang (mm)" value={s.panjang} />
                                    <DetailField label="Lebar (mm)" value={s.lebar} />
                                    <DetailField label="Tinggi (mm)" value={s.tinggi} />
                                    <DetailField label="Tebal (mm)" value={s.tebal} />
                                    <DetailField label="Tinggi Leher (mm)" value={s.tinggi_leher} />
                                    <DetailField label="Diam. Dalam Mulut (mm)" value={s.diameter_dalam_mulut} />
                                    <DetailField label="Diam. Luar Mulut (mm)" value={s.diameter_luar_mulut} />
                                    <DetailField label="Diam. Dalam (mm)" value={s.diameter_dalam} />
                                    <DetailField label="Diam. Luar (mm)" value={s.diameter_luar} />
                                    <DetailField label="Panjang Selang (mm)" value={s.panjang_selang} />
                                    <DetailField label="Berat (gram)" value={s.berat} />
                                    <DetailField label="Volume (ml)" value={s.volume} />
                                    <DetailField label="Barcode" value={s.barcode} />
                                    <DetailField label="POM NA" value={s.pom_na} />
                                    <DetailField label="Tipe" value={s.tipe} />
                                    <DetailField label="Group" value={s.group} />
                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* Pagination */}
                {specs.links && specs.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                            Menampilkan {specs.from || 0} - {specs.to || 0} dari {specs.total} item
                        </span>
                        <div className="flex items-center gap-1">
                            {specs.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url}
                                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                        link.active ? 'bg-indigo-600 text-white font-medium shadow-sm' : 'text-gray-500 hover:bg-gray-100'
                                    }`}
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

function DetailField({ label, value }) {
    return (
        <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
            <p className="text-gray-700 font-medium mt-0.5">{value || '-'}</p>
        </div>
    );
}
