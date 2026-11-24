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

    public function setInitialCapital(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1000',
            'notes'  => 'nullable|string',
            'date'   => 'nullable|date',
        ]);

        $lastBalance = CashFlow::latest('id')->value('balance_after') ?? 0;
        $amount = (float) $request->amount;
        $date = $request->date ?? today()->toDateString();
        $notes = $request->notes ?: 'Modal Awal Kas Toko (Setoran Usaha)';

        $cashFlow = CashFlow::create([
            'type'             => 'income',
            'source_type'      => 'capital',
            'source_id'        => 0,
            'amount'           => $amount,
            'description'      => $notes,
            'transaction_date' => $date,
            'balance_after'    => $lastBalance + $amount,
        ]);

        return response()->json([
            'message'   => 'Modal awal berhasil dicatat ke buku kas toko.',
            'cash_flow' => $cashFlow,
        ], 201);
    }
}
