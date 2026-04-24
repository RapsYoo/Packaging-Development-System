<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AutoLogout
{
    /**
     * Handle an incoming request.
     * Auto logout after 30 minutes of inactivity.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check()) {
            $lastActivity = session('last_activity_time');
            $timeout = 30 * 60; // 30 minutes in seconds

            if ($lastActivity && (time() - $lastActivity > $timeout)) {
                auth()->logout();
                session()->flush();
                return redirect()->route('login')->with('warning', 'Sesi Anda telah berakhir karena tidak ada aktivitas selama 30 menit.');
            }

            session(['last_activity_time' => time()]);
        }

        return $next($request);
    }
}
