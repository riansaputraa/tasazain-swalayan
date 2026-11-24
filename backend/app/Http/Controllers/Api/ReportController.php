<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashFlow;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function cashFlow(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
        ]);

        $cashFlows = CashFlow::whereBetween('transaction_date', [
                $request->start_date,
                $request->end_date,
            ])
            ->orderBy('transaction_date')
            ->orderBy('id')
            ->get();

        $totalIncome  = $cashFlows->where('type', 'income')->sum('amount');
        $totalExpense = $cashFlows->where('type', 'expense')->sum('amount');
        $netProfit    = $totalIncome - $totalExpense;

        return response()->json([
            'summary' => [
                'total_income'  => (float) $totalIncome,
                'total_expense' => (float) $totalExpense,
                'net_profit'    => (float) $netProfit,
                'start_date'    => $request->start_date,
                'end_date'      => $request->end_date,
            ],
            'data' => $cashFlows,
        ]);
    }
}
