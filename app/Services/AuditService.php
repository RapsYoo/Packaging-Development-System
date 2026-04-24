<?php

namespace App\Services;

use App\Models\AuditLog;

class AuditService
{
    /**
     * Log an audit action.
     */
    public static function log(
        string $action,
        ?string $modelType = null,
        ?int $modelId = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?string $description = null
    ): AuditLog {
        return AuditLog::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'model_type' => $modelType,
            'model_id' => $modelId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'description' => $description,
        ]);
    }

    /**
     * Log a login action.
     */
    public static function logLogin(int $userId): AuditLog
    {
        return AuditLog::create([
            'user_id' => $userId,
            'action' => 'login',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'description' => 'User logged in',
        ]);
    }

    /**
     * Log a logout action.
     */
    public static function logLogout(): AuditLog
    {
        return AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'logout',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'description' => 'User logged out',
        ]);
    }
}
