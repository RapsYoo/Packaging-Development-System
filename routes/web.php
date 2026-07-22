<?php

use App\Http\Controllers\Admin\RbacController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Approval\ApprovalController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Notification\NotificationController;

use App\Http\Controllers\Packaging\ColorStandardController;
use App\Http\Controllers\Packaging\PackagingApprovalController;
use App\Http\Controllers\Packaging\PackagingCategoryController;
use App\Http\Controllers\Packaging\MasterSpecController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Project\ProjectController;
use App\Http\Controllers\QC\InspectionController;
use App\Http\Controllers\Supplier\SupplierController;
use App\Http\Controllers\Supplier\QuotationController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\Project\ScaleUpController;
use App\Http\Controllers\Project\SubstitutionApprovalController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Redirect root to login
Route::get('/', function () {
    return redirect()->route('login');
});

// ──────────────────────────────────────
// Authenticated Routes (all modules)
// ──────────────────────────────────────
Route::middleware(['auth', 'verified', 'auto.logout'])->group(function () {

    // ── Dashboard ──
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ── Profile ──
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar');
    Route::put('/password', [ProfileController::class, 'updatePassword'])->name('password.update');

    // ── Notifications ──
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::post('/{notification}/read', [NotificationController::class, 'markAsRead'])->name('read');
        Route::post('/read-all', [NotificationController::class, 'markAllAsRead'])->name('readAll');
        Route::get('/unread-count', [NotificationController::class, 'unreadCount'])->name('unreadCount');
        Route::get('/latest', [NotificationController::class, 'latest'])->name('latest');
    });

    // ══════════════════════════════════
    // ADMIN PANEL — role: admin
    // ══════════════════════════════════
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {

        // Admin Dashboard
        Route::get('/dashboard', [RbacController::class, 'dashboard'])->name('dashboard');

        // User Management (CRUD)
        Route::middleware('permission:admin.users')->group(function () {
            Route::resource('users', UserController::class)->except(['show']);
            Route::post('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggleStatus');
            Route::post('/users/{user}/reset-password', [UserController::class, 'resetPassword'])->name('users.resetPassword');
            Route::get('/users/{user}/activity', [UserController::class, 'activityLog'])->name('users.activity');
        });

        // RBAC Configuration
        Route::get('/rbac', [RbacController::class, 'index'])->name('rbac.index');
        Route::put('/rbac', [RbacController::class, 'update'])->name('rbac.update');

        // Audit Trail
        Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit.index');

        // Broadcast Notification
        Route::post('/broadcast', [NotificationController::class, 'broadcast'])->name('broadcast');
    });

    // ══════════════════════════════════
    // PROJECT MANAGEMENT
    // ══════════════════════════════════
    Route::prefix('projects')->name('projects.')->group(function () {

        // All authenticated users can view
        Route::get('/', [ProjectController::class, 'index'])->name('index');
        Route::get('/npd', [ProjectController::class, 'npdIndex'])->name('npd.index');
        Route::get('/epd', [ProjectController::class, 'epdIndex'])->name('epd.index');
        Route::get('/substitusi', [ProjectController::class, 'substitusiIndex'])->name('substitusi.index');

        // Admin & Marketing: create/edit brief
        Route::middleware('role:admin,marketing')->group(function () {
            Route::get('/create/new', [ProjectController::class, 'create'])->name('create');
            Route::post('/', [ProjectController::class, 'store'])->name('store');
            
            // NPD Type Routes
            Route::get('/npd/create', [ProjectController::class, 'npdCreate'])->name('npd.create');
            Route::post('/npd', [ProjectController::class, 'npdStore'])->name('npd.store');

            // EPD Type Routes
            Route::get('/epd/create', [ProjectController::class, 'epdCreate'])->name('epd.create');
            Route::post('/epd', [ProjectController::class, 'epdStore'])->name('epd.store');

            // Substitusi Type Routes
            Route::get('/substitusi/create', [ProjectController::class, 'substitusiCreate'])->name('substitusi.create');
            Route::post('/substitusi', [ProjectController::class, 'substitusiStore'])->name('substitusi.store');
        });

        Route::get('/{project}', [ProjectController::class, 'show'])->name('show');
        Route::get('/{project}/timeline', [ProjectController::class, 'timeline'])->name('timeline');
        Route::get('/{project}/phases-json', [ProjectController::class, 'phasesJson'])->name('phases.json');

        Route::middleware('role:admin,marketing')->group(function () {
            Route::get('/{project}/edit', [ProjectController::class, 'edit'])->name('edit');
            Route::put('/{project}', [ProjectController::class, 'update'])->name('update');
            Route::delete('/{project}', [ProjectController::class, 'destroy'])->name('destroy');
        });

        // Admin & Marketing: manage timeline
        Route::middleware('role:admin,marketing')->group(function () {
            Route::put('/phases/{phase}', [ProjectController::class, 'updatePhase'])->name('phases.update');
        });

        // Archive project
        Route::middleware('role:admin,marketing')->post('/{project}/archive', [ProjectController::class, 'archive'])->name('archive');
    });

    // ══════════════════════════════════
    // APPROVAL & WORKFLOW
    // ══════════════════════════════════
    Route::prefix('approvals')->name('approvals.')->group(function () {

        Route::get('/', [ApprovalController::class, 'index'])->name('index');
        Route::get('/history', [ApprovalController::class, 'history'])->name('history');
        Route::get('/{workflow}', [ApprovalController::class, 'show'])->name('show');

        // Create concept approval (Admin, Marketing)
        Route::middleware('role:admin,marketing')
            ->post('/concept/{project}', [ApprovalController::class, 'createConceptApproval'])->name('concept.create');

        // Create artwork approval (Admin, Marketing, R&D, QC, QA)
        Route::middleware('role:admin,marketing,rd,qc,qa')
            ->post('/artwork/{project}', [ApprovalController::class, 'createArtworkApproval'])->name('artwork.create');

        // Create drawing approval (Admin, R&D)
        Route::middleware('role:admin,rd')
            ->post('/drawing/{project}', [ApprovalController::class, 'createDrawingApproval'])->name('drawing.create');

        // Decide on a step (approve/reject)
        Route::post('/step/{step}/decide', [ApprovalController::class, 'decide'])->name('step.decide');

        // Upload attachment to workflow
        Route::post('/{workflow}/upload', [ApprovalController::class, 'uploadAttachment'])->name('upload');
    });

    // ══════════════════════════════════
    // PACKAGING MANAGEMENT
    // ══════════════════════════════════
    Route::prefix('packaging')->name('packaging.')->group(function () {

        // Packaging Categories (Admin & R&D)
        Route::middleware('role:admin,rd')->group(function () {
            Route::get('/categories', [PackagingCategoryController::class, 'index'])->name('categories.index');
            Route::put('/categories/{category}', [PackagingCategoryController::class, 'update'])->name('categories.update');
        });

        // Color Standards
        Route::get('/colors', [ColorStandardController::class, 'index'])->name('colors.index');
        Route::middleware('role:admin,rd')->group(function () {
            Route::get('/colors/create', [ColorStandardController::class, 'create'])->name('colors.create');
            Route::post('/colors', [ColorStandardController::class, 'store'])->name('colors.store');
            Route::get('/colors/{colorStandard}/edit', [ColorStandardController::class, 'edit'])->name('colors.edit');
            Route::put('/colors/{colorStandard}', [ColorStandardController::class, 'update'])->name('colors.update');
        });
        Route::middleware('role:admin,rd,qc,qa,marketing')
            ->post('/colors/{colorStandard}/approval', [ColorStandardController::class, 'createApproval'])->name('colors.approval');

        // Master Spec (view for all authenticated users)
        Route::get('/master-spec', [MasterSpecController::class, 'index'])->name('master-spec.index');
    });

    // ══════════════════════════════════
    // SUPPLIER MANAGEMENT
    // ══════════════════════════════════
    Route::prefix('suppliers')->name('suppliers.')->group(function () {

        // View for all authenticated roles
        Route::get('/', [SupplierController::class, 'index'])->name('index');

        // Master Supplier (CRUD: Admin & SCM)
        Route::middleware('role:admin,scm')->group(function () {
            Route::get('/create/new', [SupplierController::class, 'create'])->name('create');
            Route::post('/', [SupplierController::class, 'store'])->name('store');
        });

        // Quotation Management (Admin, SCM)
        Route::middleware('role:admin,scm')->group(function () {
            Route::get('/quotations', [QuotationController::class, 'index'])->name('quotations.index');
            Route::post('/quotations', [QuotationController::class, 'store'])->name('quotations.store');
            Route::post('/quotations/{quotation}/review', [QuotationController::class, 'review'])->name('quotations.review');
        });

        // Evaluations (Admin, SCM)
        Route::middleware('role:admin,scm')->group(function () {
            Route::post('/{supplier}/evaluate', [SupplierController::class, 'evaluate'])->name('evaluate');
        });

        // Pitching & Trial (Admin, R&D, SCM)
        Route::middleware('role:admin,rd,scm')->group(function () {
            Route::post('/trials', [SupplierController::class, 'storeTrial'])->name('trials.store');
            Route::post('/trials/{supplierTrial}/review', [SupplierController::class, 'reviewTrial'])->name('trials.review');
        });

        Route::middleware('role:admin,scm')->group(function () {
            Route::get('/{supplier}/edit', [SupplierController::class, 'edit'])->name('edit');
            Route::put('/{supplier}', [SupplierController::class, 'update'])->name('update');
            Route::delete('/{supplier}', [SupplierController::class, 'destroy'])->name('destroy');
        });

        // The {supplier} wildcard must be at the very bottom
        Route::get('/{supplier}', [SupplierController::class, 'show'])->name('show');
    });

    // ══════════════════════════════════
    // QC & INSPECTION
    // ══════════════════════════════════
    Route::prefix('qc')->name('qc.')->group(function () {

        // Inspections (Admin, QC)
        Route::middleware('role:admin,qc')->group(function () {
            Route::get('/inspections', [InspectionController::class, 'index'])->name('inspections.index');
            Route::get('/inspections/create', [InspectionController::class, 'create'])->name('inspections.create');
            Route::post('/inspections', [InspectionController::class, 'store'])->name('inspections.store');
            Route::get('/inspections/{inspection}', [InspectionController::class, 'show'])->name('inspections.show');

            // Transport Test
            Route::post('/inspections/{inspection}/transport-test', [InspectionController::class, 'createTransportTest'])->name('inspections.transport.store');
        });

        // View History (Admin, R&D, SCM, QC, QA)
        Route::middleware('role:admin,rd,scm,qc,qa')->group(function () {
            Route::get('/history', [InspectionController::class, 'history'])->name('history');
            Route::get('/history/{packagingItem}', [InspectionController::class, 'packagingHistory'])->name('history.packaging');
        });
    });

    // ══════════════════════════════════
    // FORM APPROVAL BAHAN KEMAS
    // ══════════════════════════════════
    Route::prefix('packaging-approvals')->name('packaging-approvals.')->group(function () {

        // View & Print (SCM, R&D, QC, QA, Admin)
        Route::middleware('role:admin,scm,rd,qc,qa')->group(function () {
            Route::get('/', [PackagingApprovalController::class, 'index'])->name('index');
            Route::get('/{packagingApproval}', [PackagingApprovalController::class, 'show'])->name('show');
            Route::get('/{packagingApproval}/print', [PackagingApprovalController::class, 'print'])->name('print');
        });

        // Create & Edit (Admin, SCM)
        Route::middleware('role:admin,scm')->group(function () {
            Route::get('/create/new', [PackagingApprovalController::class, 'create'])->name('create');
            Route::post('/', [PackagingApprovalController::class, 'store'])->name('store');
            Route::get('/{packagingApproval}/edit', [PackagingApprovalController::class, 'edit'])->name('edit');
            Route::put('/{packagingApproval}', [PackagingApprovalController::class, 'update'])->name('update');
            Route::delete('/{packagingApproval}', [PackagingApprovalController::class, 'destroy'])->name('destroy');
        });

        // Submit for review (Admin, SCM)
        Route::middleware('role:admin,scm')->group(function () {
            Route::post('/{packagingApproval}/submit', [PackagingApprovalController::class, 'submit'])->name('submit');
        });

        // Decide — approve/reject (Admin, R&D, QC, QA)
        Route::middleware('role:admin,rd,qc,qa')->group(function () {
            Route::post('/{packagingApproval}/decide', [PackagingApprovalController::class, 'decide'])->name('decide');
        });
    });

    // ══════════════════════════════════
    // FORM APPROVAL SUBSTITUSI BAHAN KEMAS
    // ══════════════════════════════════
    Route::prefix('substitusi-approvals')->name('substitusi-approvals.')->group(function () {
        // View all approvals
        Route::get('/', [SubstitutionApprovalController::class, 'index'])->name('index');
        
        // Form wizard & management (SCM, Packaging Dev, Admin)
        Route::middleware('role:admin,scm,rd')->group(function () {
            Route::get('/baru', [SubstitutionApprovalController::class, 'create'])->name('create');
            Route::post('/', [SubstitutionApprovalController::class, 'store'])->name('store');
            Route::get('/{substitutionApproval}/edit', [SubstitutionApprovalController::class, 'edit'])->name('edit');
            Route::put('/{substitutionApproval}', [SubstitutionApprovalController::class, 'update'])->name('update');
            Route::delete('/{substitutionApproval}', [SubstitutionApprovalController::class, 'destroy'])->name('destroy');
            Route::post('/{substitutionApproval}/submit', [SubstitutionApprovalController::class, 'submit'])->name('submit');
        });

        // Detail and Print (All authenticated roles)
        Route::get('/{substitutionApproval}', [SubstitutionApprovalController::class, 'show'])->name('show');
        Route::get('/{substitutionApproval}/print', [SubstitutionApprovalController::class, 'print'])->name('print');

        // Approve and Sign signatures (QC Supervisor, QC Manager, SCM Manager, QA Manager, Admin)
        Route::post('/{substitutionApproval}/decide', [SubstitutionApprovalController::class, 'decide'])->name('decide');
    });

    // ══════════════════════════════════
    // SCALE UP (Admin, R&D, QC)
    // ══════════════════════════════════
    Route::prefix('scale-ups')->name('scaleups.')->group(function () {

        // View for authorized roles
        Route::middleware('role:admin,rd,qc,qa,scm')->group(function () {
            Route::get('/', [ScaleUpController::class, 'index'])->name('index');
            Route::get('/{scaleUp}', [ScaleUpController::class, 'show'])->name('show');
        });

        // Create & Edit (Admin, R&D, QC)
        Route::middleware('role:admin,rd,qc')->group(function () {
            Route::get('/create/new', [ScaleUpController::class, 'create'])->name('create');
            Route::post('/', [ScaleUpController::class, 'store'])->name('store');
            Route::get('/{scaleUp}/edit', [ScaleUpController::class, 'edit'])->name('edit');
            Route::put('/{scaleUp}', [ScaleUpController::class, 'update'])->name('update');
            Route::delete('/{scaleUp}', [ScaleUpController::class, 'destroy'])->name('destroy');
        });

        // Workflow Actions
        Route::middleware('role:admin,rd,qc')->group(function () {
            Route::post('/{scaleUp}/submit', [ScaleUpController::class, 'submitReview'])->name('submit');
        });

        Route::middleware('role:admin,qc')->group(function () {
            Route::post('/{scaleUp}/approve', [ScaleUpController::class, 'approve'])->name('approve');
            Route::post('/{scaleUp}/reject', [ScaleUpController::class, 'reject'])->name('reject');
        });

        Route::middleware('role:admin')->group(function () {
            Route::post('/{scaleUp}/publish', [ScaleUpController::class, 'publish'])->name('publish');
        });

        // Print (Admin, QC)
        Route::middleware('role:admin,qc')->group(function () {
            Route::get('/{scaleUp}/print', [ScaleUpController::class, 'print'])->name('print');
        });
    });

    // ══════════════════════════════════
    // REPORTS & ANALYTICS
    // ══════════════════════════════════
    Route::middleware('role:admin,marketing,scm,qc,qa,bod')->prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [\App\Http\Controllers\ReportController::class, 'index'])->name('index');
        Route::get('/export/projects', [\App\Http\Controllers\ReportController::class, 'exportProjects'])->name('export.projects');
        Route::get('/export/suppliers', [\App\Http\Controllers\ReportController::class, 'exportSuppliers'])->name('export.suppliers');
    });
});

require __DIR__.'/auth.php';
