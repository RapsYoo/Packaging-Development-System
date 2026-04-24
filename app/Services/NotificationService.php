<?php

namespace App\Services;

use App\Models\AppNotification;
use App\Models\User;
use App\Models\Role;

class NotificationService
{
    /**
     * Send notification to a specific user.
     */
    public static function sendToUser(int $userId, string $title, string $message, string $type = 'info', ?string $link = null, ?array $data = null): AppNotification
    {
        return AppNotification::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'link' => $link,
            'data' => $data,
        ]);
    }

    /**
     * Send notification to all users with a specific role.
     */
    public static function sendToRole(string $roleSlug, string $title, string $message, string $type = 'info', ?string $link = null, ?array $data = null): void
    {
        $role = Role::where('slug', $roleSlug)->first();
        if (!$role) return;

        $users = User::where('role_id', $role->id)->where('is_active', true)->get();

        foreach ($users as $user) {
            self::sendToUser($user->id, $title, $message, $type, $link, $data);
        }
    }

    /**
     * Send notification to multiple roles.
     */
    public static function sendToRoles(array $roleSlugs, string $title, string $message, string $type = 'info', ?string $link = null, ?array $data = null): void
    {
        foreach ($roleSlugs as $slug) {
            self::sendToRole($slug, $title, $message, $type, $link, $data);
        }
    }

    /**
     * Send notification to all active users (broadcast).
     */
    public static function broadcast(string $title, string $message, string $type = 'info', ?string $link = null, ?array $data = null): void
    {
        $users = User::where('is_active', true)->get();

        foreach ($users as $user) {
            self::sendToUser($user->id, $title, $message, $type, $link, $data);
        }
    }
}
