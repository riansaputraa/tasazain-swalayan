<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashFlow;
use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Expense::with('user')->orderByDesc('expense_date');

        if ($request->start_date && $request->end_date) {
            $query->whereBetween('expense_date', [$request->start_date, $request->end_date]);
        }

        return response()->json($query->paginate(15));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'description'  => 'required|string|max:255',
            'amount'       => 'required|numeric|min:1',
            'expense_date' => 'required|date',
            'category'     => 'in:operasional,lain-lain',
            'notes'        => 'nullable|string',
        ]);

        $expense = Expense::create(array_merge($data, ['user_id' => $request->user()->id]));

        // Catat ke buku kas
        $lastBalance = CashFlow::latest('id')->value('balance_after') ?? 0;
        CashFlow::create([
            'type'             => 'expense',
            'source_type'      => 'expense',
            'source_id'        => $expense->id,
            'amount'           => $data['amount'],
            'description'      => 'Pengeluaran: ' . $data['description'],
            'transaction_date' => $data['expense_date'],
            'balance_after'    => $lastBalance - $data['amount'],
        ]);

        return response()->json($expense, 201);
    }

    public function show(Expense $expense)
    {
        return response()->json($expense->load('user'));
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();
        return response()->json(['message' => 'Pengeluaran berhasil dihapus.']);
    }
}
