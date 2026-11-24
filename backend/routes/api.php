<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// === Public Routes (tidak butuh auth) ===
Route::post('/login', [AuthController::class, 'login']);

// === Protected Routes (butuh Sanctum token) ===
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard & Report
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/report/cashflow', [ReportController::class, 'cashFlow']);
    Route::post('/report/capital', [ReportController::class, 'setInitialCapital']);

    // Products - Special endpoints dulu
    Route::get('/products/pos', [ProductController::class, 'forPos']);
    Route::get('/products/low-stock', [ProductController::class, 'lowStock']);
    Route::apiResource('/products', ProductController::class);

    // Categories
    Route::apiResource('/categories', CategoryController::class);

    // Suppliers
    Route::apiResource('/suppliers', SupplierController::class);

    // Purchases (Kulakan) - read + create only
    Route::get('/purchases', [PurchaseController::class, 'index']);
    Route::post('/purchases', [PurchaseController::class, 'store']);
    Route::get('/purchases/{purchase}', [PurchaseController::class, 'show']);

    // Sales (POS Kasir) - read + create only
    Route::get('/sales', [SaleController::class, 'index']);
    Route::post('/sales', [SaleController::class, 'store']);
    Route::get('/sales/{sale}', [SaleController::class, 'show']);

    // Expenses (Pengeluaran Operasional)
    Route::get('/expenses', [ExpenseController::class, 'index']);
    Route::post('/expenses', [ExpenseController::class, 'store']);
    Route::get('/expenses/{expense}', [ExpenseController::class, 'show']);
    Route::delete('/expenses/{expense}', [ExpenseController::class, 'destroy']);

    // Admin only: manage users
    Route::middleware('admin')->group(function () {
        Route::post('/register', [UserController::class, 'store']);
        Route::apiResource('/users', UserController::class);
    });
});
