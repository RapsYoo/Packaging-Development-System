import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';

export default function AuthenticatedLayout({ user, header, children }) {
    const { flash, notifications } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const role = user?.role?.slug || '';

    // Menu Definitions based on Roles
    const navigation = [
        { name: 'Dashboard', href: route('dashboard'), icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', show: true },
        
        // Admin
        { name: 'User Management', href: route('admin.users.index'), icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', show: role === 'admin' && user?.permissions?.['admin.users'] !== 'none' },
        { name: 'RBAC Setup', href: route('admin.rbac.index'), icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', show: role === 'admin' && user?.permissions?.['admin.rbac'] !== 'none' },
        { name: 'Audit Trail', href: route('admin.audit.index'), icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', show: role === 'admin' && user?.permissions?.['admin.dashboard'] !== 'none' },

        // Projects
        { name: 'Projects', href: route('projects.index'), icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', show: ['admin', 'marketing', 'bod', 'rd', 'scm', 'qc'].includes(role) },
        
        // Approvals
        { name: 'Approvals', href: route('approvals.index'), icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', show: ['admin', 'bod', 'rd', 'qc', 'scm', 'marketing'].includes(role) },

        // Packaging 
        { name: 'Master Packaging', href: route('packaging.items.index'), icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', show: ['admin', 'rd'].includes(role) },
        { name: 'Color Standards', href: route('packaging.colors.index'), icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01', show: ['admin', 'rd', 'marketing', 'qc'].includes(role) },

        // Suppliers
        { name: 'Suppliers', href: route('suppliers.index'), icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', show: ['admin', 'scm'].includes(role) },
        { name: 'Quotations', href: route('suppliers.quotations.index'), icon: 'M9 14l6-6h-6v6zm-9 4a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2H2a2 2 0 00-2 2v12zm18-12v12H2V6h16zm-5.5 1.5l1.5 1.5-6 6H7v-1.5l6.5-6.5z', show: ['admin', 'scm', 'supplier'].includes(role) },

        // QC Inspections
        { name: 'Inspections', href: route('qc.inspections.index'), icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', show: ['admin', 'qc'].includes(role) },
    ];

    const unreadCount = notifications?.unreadCount || 0;

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans flex text-gray-800">
            {/* Sidebar Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside 
                className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50 transition-transform duration-300 ease-in-out ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-50 bg-white/80 backdrop-blur-md">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <span className="font-bold text-lg tracking-tight text-gray-900 leading-tight">
                            PDS <span className="font-light text-gray-500 text-sm block -mt-1">System</span>
                        </span>
                    </Link>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="py-6 px-4 overflow-y-auto h-[calc(100vh-4rem)] custom-scrollbar">
                    <div className="mb-6 px-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Role Akses</p>
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">
                            {user?.role?.name || 'No Role'}
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {navigation.filter(item => item.show).map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                                    route().current(item.href.split('/').pop() + '*') || route().current() === item.href.split('/').pop()
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                                }`}
                            >
                                <svg 
                                    className={`w-5 h-5 transition-colors ${
                                        route().current(item.href.split('/').pop() + '*') || route().current() === item.href.split('/').pop()
                                            ? 'text-indigo-100' 
                                            : 'text-gray-400 group-hover:text-indigo-500'
                                    }`} 
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={item.icon} />
                                </svg>
                                <span className="font-medium text-sm">{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen transition-all duration-300">
                
                {/* Topbar */}
                <header 
                    className={`sticky top-0 z-30 transition-all duration-200 ${
                        scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'
                    }`}
                >
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            
                            {header && (
                                <h2 className="text-xl font-bold text-gray-800 leading-tight tracking-tight hidden sm:block">
                                    {header}
                                </h2>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Notification Bell */}
                            <Link href={route('notifications.index')} className="relative p-2 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </Link>

                            {/* User Dropdown */}
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="flex items-center gap-3 p-1.5 rounded-full hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all focus:outline-none">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="hidden md:block text-left mr-1">
                                                <p className="text-sm font-semibold text-gray-700 leading-none">{user.name}</p>
                                                <p className="text-xs text-gray-500 mt-1 truncate max-w-[120px]">{user.department || user.email}</p>
                                            </div>
                                            <svg className="w-4 h-4 text-gray-400 hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content align="right" width="48" contentClasses="py-1 bg-white border border-gray-100 shadow-xl rounded-xl">
                                        <div className="px-4 py-3 border-b border-gray-50 block md:hidden">
                                            <p className="text-sm text-gray-900 font-medium">{user.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>
                                        <Dropdown.Link href={route('profile.edit')} className="text-sm font-medium text-gray-700">Profile Settings</Dropdown.Link>
                                        <div className="border-t border-gray-50 my-1"></div>
                                        <Dropdown.Link href={route('logout')} method="post" as="button" className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50">
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 animate-fade-in-down">
                        <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-start shadow-sm">
                            <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-green-800 font-medium">{flash.success}</p>
                        </div>
                    </div>
                )}
                
                {flash?.error && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 animate-fade-in-down">
                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start shadow-sm">
                            <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-red-800 font-medium">{flash.error}</p>
                        </div>
                    </div>
                )}

                {/* Page Content */}
                <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                    {/* Render Header for mobile if passed */}
                    {header && (
                        <h2 className="text-2xl font-bold text-gray-800 leading-tight mb-6 sm:hidden">
                            {header}
                        </h2>
                    )}
                    
                    {children}
                </main>
            </div>
        </div>
    );
}
