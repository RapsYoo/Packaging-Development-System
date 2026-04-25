<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     * Usage: middleware('permission:project.create')
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        $user = auth()->user();

        if (!$user->is_active) {
            auth()->logout();
            return redirect()->route('login')->with('error', 'Akun Anda telah dinonaktifkan.');
        }



        if (!$user->hasPermission($permission)) {
            abort(403, 'Anda tidak memiliki izin untuk mengakses fitur ini.');
        }

        // If trying to modify data (POST, PUT, PATCH, DELETE) but only has 'read' access
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            $accessLevel = $user->role->getAccessLevel($permission);
            if ($accessLevel === 'read') {
                if ($request->ajax() || $request->wantsJson()) {
                    return response()->json(['message' => 'Anda hanya memiliki akses baca (Read Only) untuk fitur ini.'], 403);
                }
                abort(403, 'Anda hanya memiliki akses baca (Read Only) untuk fitur ini.');
            }
        }

        return $next($request);
    }
}
