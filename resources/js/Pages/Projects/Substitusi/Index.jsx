import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ auth, projects, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('projects.substitusi.index'), { search, status: statusFilter }, { preserveState: true });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'submitted': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'active': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'archived': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const canCreateProject = ['admin', 'marketing'].includes(auth.user.role?.slug);

    return (
        <AuthenticatedLayout user={auth.user} header="Manajemen Proyek Kemasan">
            <Head title="Substitusi Bahan Kemas" />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Daftar Proyek Substitusi Bahan Kemas</h3>
                            <p className="text-sm text-gray-500 mt-1">Pantau seluruh pipeline pengembangan kemasan Substitusi dari tahap konsep hingga Go-Live.</p>
                        </div>

                        {canCreateProject && (
                            <Link
                                href={route('projects.substitusi.create')}
                                className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 border border-transparent rounded-lg font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm text-sm shrink-0"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Buat Project Brief Substitusi
                            </Link>
                        )}
                    </div>

                    <form onSubmit={handleFilter} className="mt-6 flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Cari kode atau judul proyek..."
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
                                <option value="submitted">Menunggu Konsep</option>
                                <option value="active">Aktif Berjalan</option>
                                <option value="completed">Selesai (Go-Live)</option>
                            </select>
                        </div>
                        <button type="submit" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                            Filter
                        </button>
                    </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6 bg-gray-50/50">
                    {projects.data.length > 0 ? projects.data.map(project => (
                        <div key={project.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col h-full">
                            <div className="p-5 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getStatusColor(project.status)}`}>
                                        {project.status === 'active' ? 'Aktif' : project.status}
                                    </span>
                                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                        {project.type}
                                    </span>
                                </div>

                                <Link href={route('projects.show', project.id)} className="block group-hover:text-indigo-600 transition-colors">
                                    <h4 className="text-lg font-bold text-gray-900 leading-tight mb-1">{project.title}</h4>
                                    <p className="text-xs font-mono text-gray-500 mb-4">{project.code}</p>
                                </Link>

                                <div className="space-y-3">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        <span className="truncate">PIC: {project.pic?.name || <span className="italic text-gray-400">Belum di-assign</span>}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        Deadline: <span className={new Date(project.deadline) < new Date() && project.status !== 'completed' ? 'text-red-600 font-semibold ml-1' : 'ml-1'}>{project.deadline ? new Date(project.deadline).toLocaleDateString('id-ID') : '-'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between mt-auto">
                                <div className="w-full mr-4">
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="font-medium text-gray-500">Progress</span>
                                        <span className="font-bold text-indigo-700">{project.progress || 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500" style={{ width: `${project.progress || 0}%` }}></div>
                                    </div>
                                </div>
                                <Link
                                    href={route('projects.show', project.id)}
                                    className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </Link>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-16 text-center">
                            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            <h4 className="text-lg font-bold text-gray-700">Belum ada proyek kemasan Substitusi</h4>
                            <p className="text-gray-500 mt-1 max-w-md mx-auto">Mulai dengan membuat pengajuan Project Brief Substitusi pertama Anda.</p>
                            {canCreateProject && (
                                <Link href={route('projects.substitusi.create')} className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700">
                                    Buat Brief Substitusi Sekarang
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {projects.links && projects.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm text-gray-500">Menampilkan {projects.from || 0} - {projects.to || 0} dari {projects.total} proyek</span>
                        <div className="flex items-center gap-1">
                            {projects.links.map((link, i) => (
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
