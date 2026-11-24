<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashFlow;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function cashFlow(Request $request)
    {
        $startDate = $request->start_date ?? now()->startOfMonth()->toDateString();
        $endDate   = $request->end_date ?? now()->endOfMonth()->toDateString();

        $allQuery = CashFlow::whereBetween('transaction_date', [$startDate, $endDate]);

        $totalIncome  = (clone $allQuery)->where('type', 'income')->sum('amount');
        $totalExpense = (clone $allQuery)->where('type', 'expense')->sum('amount');
        $netProfit    = $totalIncome - $totalExpense;

        $listQuery = CashFlow::query();
        if ($request->start_date && $request->end_date) {
            $listQuery->whereBetween('transaction_date', [$request->start_date, $request->end_date]);
        }
        if ($request->type && $request->type !== 'ALL') {
            $listQuery->where('type', $request->type);
        }

        $cashFlows = $listQuery->orderByDesc('id')->get();

        return response()->json([
            'summary' => [
                'total_income'  => (float) $totalIncome,
                'total_expense' => (float) $totalExpense,
                'net_profit'    => (float) $netProfit,
                'net_cash'      => (float) $netProfit,
                'start_date'    => $startDate,
                'end_date'      => $endDate,
            ],
            'cash_flows' => $cashFlows,
            'data'       => $cashFlows,
        ]);
    }
}
