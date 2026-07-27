<?php

namespace App\Http\Middleware;

use App\Models\AppNotification;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        if ($user) {
            $user->loadMissing(['role.permissions']);
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'department' => $user->department,
                    'phone' => $user->phone,
                    'avatar' => $user->avatar,
                    'is_active' => $user->is_active,
                    'role' => $user->role ? [
                        'id' => $user->role->id,
                        'name' => $user->role->name,
                        'slug' => $user->role->slug,
                    ] : null,
                    'permissions' => $user->role
                        ? $user->role->permissions->pluck('pivot.access_level', 'slug')->toArray()
                        : [],
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
            ],
            'notifications' => $user ? [
                'unreadCount' => fn () => AppNotification::where('user_id', $user->id)->whereNull('read_at')->count(),
                'latest' => fn () => AppNotification::where('user_id', $user->id)
                    ->orderBy('created_at', 'desc')
                    ->take(5)
                    ->get()
                    ->map(fn ($n) => [
                        'id' => $n->id,
                        'title' => $n->title,
                        'message' => $n->message,
                        'type' => $n->type,
                        'link' => $n->link,
                        'read_at' => $n->read_at,
                        'created_at' => $n->created_at->diffForHumans(),
                    ]),
            ] : null,
            'app' => [
                'name' => config('app.name'),
                'session_lifetime' => config('session.lifetime'),
            ],
        ];
    }
}
