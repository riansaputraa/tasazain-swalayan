<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashFlow;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    public function index(Request $request)
    {
        $query = Purchase::with(['supplier', 'user', 'items.product'])
            ->orderByDesc('purchase_date');

        if ($request->start_date && $request->end_date) {
            $query->whereBetween('purchase_date', [$request->start_date, $request->end_date]);
        }

        return response()->json($query->paginate(15));
    }

    public function store(Request $request)
    {
        $request->validate([
            'supplier_id'    => 'required|exists:suppliers,id',
            'purchase_date'  => 'required|date',
            'invoice_number' => 'required|string|unique:purchases,invoice_number',
            'notes'          => 'nullable|string',
            'items'          => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'items.*.buy_price'  => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $totalAmount = 0;

            // Hitung subtotal tiap item
            $items = collect($request->items)->map(function ($item) use (&$totalAmount) {
                $subtotal = $item['quantity'] * $item['buy_price'];
                $totalAmount += $subtotal;
                return array_merge($item, ['subtotal' => $subtotal]);
            });

            // Buat header purchase
            $purchase = Purchase::create([
                'supplier_id'    => $request->supplier_id,
                'user_id'        => $request->user()->id,
                'invoice_number' => $request->invoice_number,
                'purchase_date'  => $request->purchase_date,
                'total_amount'   => $totalAmount,
                'notes'          => $request->notes,
            ]);

            // Simpan detail & update stok produk
            foreach ($items as $item) {
                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'product_id'  => $item['product_id'],
                    'quantity'    => $item['quantity'],
                    'buy_price'   => $item['buy_price'],
                    'subtotal'    => $item['subtotal'],
                ]);

                // Update stok produk (+)
                DB::table('products')
                    ->where('id', $item['product_id'])
                    ->increment('stock', $item['quantity']);
            }

            // Catat ke buku kas (pengeluaran)
            $lastBalance = CashFlow::latest('id')->value('balance_after') ?? 0;
            CashFlow::create([
                'type'             => 'expense',
                'source_type'      => 'purchase',
                'source_id'        => $purchase->id,
                'amount'           => $totalAmount,
                'description'      => 'Kulakan dari ' . optional($purchase->supplier)->name,
                'transaction_date' => $request->purchase_date,
                'balance_after'    => $lastBalance - $totalAmount,
            ]);

            DB::commit();
            return response()->json($purchase->load(['supplier', 'items.product']), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menyimpan pembelian: ' . $e->getMessage()], 500);
        }
    }

    public function show(Purchase $purchase)
    {
        return response()->json($purchase->load(['supplier', 'user', 'items.product']));
    }
}
