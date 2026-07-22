import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ auth, notifications }) {
    const markAllAsRead = () => {
        router.post(route('notifications.readAll'), {}, {
            preserveScroll: true
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Pusat Notifikasi</h2>}
        >
            <Head title="Notifikasi" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">Semua Notifikasi</h3>
                            <button 
                                onClick={markAllAsRead}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                                Tandai semua sudah dibaca
                            </button>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {notifications.data.length > 0 ? (
                                notifications.data.map((notification) => (
                                    <div 
                                        key={notification.id} 
                                        onClick={() => {
                                            if (!notification.read_at) {
                                                router.post(route('notifications.read', notification.id), {}, { preserveScroll: true });
                                            }
                                        }}
                                        className={`p-6 transition-colors ${!notification.read_at ? 'cursor-pointer hover:bg-gray-50' : ''} ${notification.read_at ? 'bg-white' : 'bg-indigo-50/30'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-4">
                                                <div className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${notification.read_at ? 'bg-gray-300' : 'bg-indigo-600'}`}></div>
                                                <div>
                                                    <h4 className={`text-sm ${notification.read_at ? 'text-gray-600 font-medium' : 'text-gray-900 font-bold'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        {new Date(notification.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-gray-500">
                                    <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    <p>Belum ada notifikasi baru.</p>
                                </div>
                            )}
                        </div>
                        
                        {/* Pagination Links */}
                        {notifications.links && notifications.data.length > 0 && (
                            <div className="p-4 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex gap-2">
                                    {notifications.links.map((link, idx) => (
                                        <Link
                                            key={idx}
                                            href={link.url || '#'}
                                            className={`px-3 py-1 rounded text-sm ${
                                                link.active 
                                                    ? 'bg-indigo-600 text-white' 
                                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            onClick={(e) => !link.url && e.preventDefault()}
                                        />
                                    ))}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Menampilkan {notifications.from} - {notifications.to} dari {notifications.total} notifikasi
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
