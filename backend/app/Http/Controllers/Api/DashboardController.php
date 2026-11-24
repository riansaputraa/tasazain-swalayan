<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashFlow;
use App\Models\Expense;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->month ?? now()->month;
        $year  = $request->year  ?? now()->year;

        // Total pemasukan dari penjualan bulan ini
        $totalIncome = Sale::whereMonth('sale_date', $month)
            ->whereYear('sale_date', $year)
            ->sum('total_amount');

        // Total pengeluaran (kulakan + operasional) bulan ini
        $totalPurchaseExpense = Purchase::whereMonth('purchase_date', $month)
            ->whereYear('purchase_date', $year)
            ->sum('total_amount');
        $totalOpExpense = Expense::whereMonth('expense_date', $month)
            ->whereYear('expense_date', $year)
            ->sum('amount');
        $totalExpense = $totalPurchaseExpense + $totalOpExpense;

        // Laba bersih
        $netProfit = $totalIncome - $totalExpense;

        // Produk stok menipis
        $lowStockProducts = Product::with('category')
            ->whereRaw('stock <= min_stock')
            ->orderBy('stock')
            ->limit(10)
            ->get();

        // Data grafik: pemasukan vs pengeluaran 6 bulan terakhir
        $chartData = collect(range(5, 0))->map(function ($monthsAgo) {
            $date = now()->subMonths($monthsAgo);
            $income = Sale::whereMonth('sale_date', $date->month)
                ->whereYear('sale_date', $date->year)
                ->sum('total_amount');
            $purchase = Purchase::whereMonth('purchase_date', $date->month)
                ->whereYear('purchase_date', $date->year)
                ->sum('total_amount');
            $expense = Expense::whereMonth('expense_date', $date->month)
                ->whereYear('expense_date', $date->year)
                ->sum('amount');

            return [
                'month'   => $date->format('M Y'),
                'income'  => (float) $income,
                'expense' => (float) ($purchase + $expense),
            ];
        });

        return response()->json([
            'stats' => [
                'total_income'  => (float) $totalIncome,
                'total_expense' => (float) $totalExpense,
                'net_profit'    => (float) $netProfit,
                'low_stock_count' => $lowStockProducts->count(),
            ],
            'low_stock_products' => $lowStockProducts,
            'chart_data'         => $chartData,
        ]);
    }
}
