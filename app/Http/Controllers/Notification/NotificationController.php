<?php

namespace App\Http\Controllers\Notification;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = AppNotification::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        return view('notifications.index', compact('notifications'));
    }

    public function markAsRead(AppNotification $notification)
    {
        if ($notification->user_id !== auth()->id()) abort(403);
        $notification->markAsRead();
        if ($notification->link) return redirect($notification->link);
        return back();
    }

    public function markAllAsRead()
    {
        AppNotification::where('user_id', auth()->id())->whereNull('read_at')->update(['read_at' => now()]);
        return back()->with('success', 'Semua notifikasi telah dibaca.');
    }

    public function unreadCount()
    {
        return response()->json(['count' => auth()->user()->unreadNotificationsCount()]);
    }

    public function latest()
    {
        $notifications = AppNotification::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')->take(5)->get();
        return response()->json($notifications);
    }
}
