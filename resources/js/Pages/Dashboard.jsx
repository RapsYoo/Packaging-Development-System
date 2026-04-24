import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ auth, role, activeProjects, ...props }) {
    
    // Helper component for Stat Cards
    const StatCard = ({ title, value, icon, colorClass, link }) => (
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center justify-between group transition-all hover:shadow-md">
            <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-gray-800">{value || 0}</h3>
                {link && (
                    <Link href={link} className="text-xs text-indigo-600 font-medium hover:underline mt-2 inline-block">
                        Lihat detail &rarr;
                    </Link>
                )}
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorClass}`}>
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
                </svg>
            </div>
        </div>
    );

    // Section for active projects (visible to all roles mostly)
    const ActiveProjectsList = () => (
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden col-span-1 lg:col-span-2">
            <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Proyek Aktif (Terbaru)</h3>
                <Link href={route('projects.index')} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                    Semua Proyek &rarr;
                </Link>
            </div>
            <div className="divide-y divide-gray-50">
                {activeProjects?.length > 0 ? activeProjects.map((project) => (
                    <div key={project.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                {project.type}
                            </div>
                            <div>
                                <Link href={route('projects.show', project.id)} className="font-semibold text-gray-800 hover:text-indigo-600 block">
                                    {project.code} - {project.title}
                                </Link>
                                <p className="text-xs text-gray-500 mt-0.5">PIC: {project.pic?.name || 'Belum ada'} | Deadline: {project.deadline || '-'}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                {project.status.toUpperCase()}
                            </div>
                            <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-2">
                                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${project.progress || 0}%` }}></div>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="px-6 py-8 text-center text-gray-500 text-sm">Belum ada proyek aktif.</div>
                )}
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header="Dashboard Overview"
        >
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Greeting Section */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Selamat datang, {auth.user.name}!</h1>
                        <p className="text-indigo-100 max-w-xl text-sm sm:text-base">
                            Anda login sebagai <span className="font-semibold px-2 py-0.5 rounded bg-white/20">{auth.user.role?.name}</span>. 
                            Pantau dan kelola alur pengembangan kemasan PT. Priskila Prima Makmur.
                        </p>
                    </div>
                    {/* Abstract bg shapes */}
                    <svg className="absolute right-0 bottom-0 opacity-10 w-64 h-64 transform translate-x-1/3 translate-y-1/3" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#FFFFFF" d="M42.7,-73.4C55.9,-67.6,67.6,-56.3,76.5,-42.8C85.4,-29.3,91.5,-14.7,91.8,0.2C92.1,15.1,86.6,30.2,76.7,42.5C66.8,54.8,52.5,64.3,38.2,71.5C23.9,78.7,9.6,83.6,-4.8,88.4C-19.2,93.2,-33.8,97.9,-46.6,92.5C-59.4,87.1,-70.4,71.6,-78.3,55.5C-86.2,39.4,-91.1,22.7,-91.2,6C-91.3,-10.7,-86.6,-27.4,-77.8,-41.8C-69,-56.2,-56.1,-68.3,-41.8,-73.5C-27.5,-78.7,-13.7,-77,1.4,-78.4C16.5,-79.8,33,-84.3,42.7,-73.4Z" transform="translate(100 100)" />
                    </svg>
                </div>

                {/* --- ADMIN DASHBOARD --- */}
                {role === 'admin' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard title="Total Proyek" value={props.totalProjects} icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" colorClass="bg-blue-50 text-blue-600" link={route('projects.index')} />
                            <StatCard title="Approval Pending" value={props.pendingApprovals} icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" colorClass="bg-orange-50 text-orange-600" link={route('approvals.index')} />
                            <StatCard title="Total User Aktif" value={props.totalUsers} icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" colorClass="bg-purple-50 text-purple-600" link={route('admin.users.index')} />
                            <StatCard title="Inspeksi Terbaru" value={props.recentInspections?.length || 0} icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" colorClass="bg-teal-50 text-teal-600" link={route('qc.inspections.index')} />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <ActiveProjectsList />
                            <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 p-6">
                                <h3 className="font-bold text-gray-800 mb-4">Statistik Proyek</h3>
                                <div className="space-y-4">
                                    {props.projectsByType && Object.entries(props.projectsByType).map(([type, count]) => (
                                        <div key={type} className="flex justify-between items-center">
                                            <span className="text-gray-600 font-medium">{type}</span>
                                            <span className="bg-indigo-50 text-indigo-700 py-1 px-3 rounded-full text-xs font-bold">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* --- MARKETING DASHBOARD --- */}
                {role === 'marketing' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard title="Proyek Saya" value={props.myProjects?.length || 0} icon="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" colorClass="bg-blue-50 text-blue-600" link={route('projects.index')} />
                            <StatCard title="Approval Tertunda" value={props.pendingApprovals} icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" colorClass="bg-orange-50 text-orange-600" link={route('approvals.index')} />
                            <StatCard title="Total Proyek Sistem" value={props.totalProjects} icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2" colorClass="bg-gray-50 text-gray-600" />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ActiveProjectsList />
                        </div>
                    </>
                )}

                {/* --- QC DASHBOARD --- */}
                {role === 'qc' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard title="Inspeksi Pending" value={props.pendingInspections} icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" colorClass="bg-red-50 text-red-600" link={route('qc.inspections.index')} />
                            <StatCard title="Review Artwork" value={props.pendingArtworkReviews} icon="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" colorClass="bg-purple-50 text-purple-600" link={route('approvals.index')} />
                            <StatCard title="Inspeksi Selesai (Saya)" value={props.recentInspections?.length || 0} icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" colorClass="bg-green-50 text-green-600" />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <ActiveProjectsList />
                            {/* QC specific list */}
                            <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 p-6">
                                <h3 className="font-bold text-gray-800 mb-4">Inspeksi Terakhir Saya</h3>
                                <div className="space-y-3">
                                    {props.recentInspections?.slice(0, 5).map(insp => (
                                        <div key={insp.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-700">{insp.type} - {insp.packaging_item?.name || 'Item'}</p>
                                                <p className="text-xs text-gray-500">{new Date(insp.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${insp.result === 'Pass' ? 'bg-green-100 text-green-700' : (insp.result === 'Fail' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700')}`}>
                                                {insp.result}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Fallback for other roles (BOD, R&D, SCM, Supplier) */}
                {!['admin', 'marketing', 'qc'].includes(role) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard title="Total Proyek" value={props.totalProjects} icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2" colorClass="bg-blue-50 text-blue-600" link={route('projects.index')} />
                        {props.pendingApprovals !== undefined && (
                            <StatCard title="Approval Tertunda" value={props.pendingApprovals} icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" colorClass="bg-orange-50 text-orange-600" link={route('approvals.index')} />
                        )}
                        {props.pendingConcepts !== undefined && (
                            <StatCard title="Review Konsep Baru" value={props.pendingConcepts} icon="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" colorClass="bg-purple-50 text-purple-600" link={route('approvals.index')} />
                        )}
                        {props.pendingQuotations !== undefined && (
                            <StatCard title="Quotation Baru" value={props.pendingQuotations} icon="M9 14l6-6h-6v6zm-9 4a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2H2a2 2 0 00-2 2v12zm18-12v12H2V6h16z" colorClass="bg-green-50 text-green-600" link={route('suppliers.quotations.index')} />
                        )}
                    </div>
                )}
                
                {/* Always show active projects at the bottom for other roles */}
                {!['admin', 'marketing', 'qc'].includes(role) && (
                    <div className="mt-6">
                        <ActiveProjectsList />
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}
