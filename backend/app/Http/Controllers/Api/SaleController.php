<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashFlow;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $query = Sale::with('user')->orderByDesc('sale_date');

        if ($request->start_date && $request->end_date) {
            $query->whereBetween('sale_date', [$request->start_date, $request->end_date]);
        }

        // Kasir hanya lihat transaksinya sendiri
        if ($request->user()->isKasir()) {
            $query->where('user_id', $request->user()->id);
        }

        return response()->json($query->paginate(15));
    }

    public function store(Request $request)
    {
        $request->validate([
            'paid_amount' => 'required|numeric|min:0',
            'notes'       => 'nullable|string',
            'items'       => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            $totalAmount = 0;
            $saleItems = [];

            // Validasi stok dan hitung total
            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['product_id']);

                if ($product->stock < $item['quantity']) {
                    throw new \Exception("Stok {$product->name} tidak mencukupi. Stok tersedia: {$product->stock}");
                }

                $subtotal = $item['quantity'] * $product->sell_price;
                $totalAmount += $subtotal;

                $saleItems[] = [
                    'product_id' => $product->id,
                    'quantity'   => $item['quantity'],
                    'sell_price' => $product->sell_price,
                    'subtotal'   => $subtotal,
                ];
            }

            if ($request->paid_amount < $totalAmount) {
                throw new \Exception('Nominal bayar kurang dari total belanja.');
            }

            // Buat nomor invoice otomatis
            $invoiceNumber = 'INV-' . now()->format('Ymd') . '-' . str_pad(
                Sale::whereDate('created_at', today())->count() + 1,
                4, '0', STR_PAD_LEFT
            );

            // Buat header penjualan
            $sale = Sale::create([
                'user_id'        => $request->user()->id,
                'invoice_number' => $invoiceNumber,
                'sale_date'      => today(),
                'total_amount'   => $totalAmount,
                'paid_amount'    => $request->paid_amount,
                'change_amount'  => $request->paid_amount - $totalAmount,
                'notes'          => $request->notes,
            ]);

            // Simpan detail & kurangi stok
            foreach ($saleItems as $item) {
                SaleItem::create(array_merge(['sale_id' => $sale->id], $item));

                DB::table('products')
                    ->where('id', $item['product_id'])
                    ->decrement('stock', $item['quantity']);
            }

            // Catat ke buku kas (pemasukan)
            $lastBalance = CashFlow::latest('id')->value('balance_after') ?? 0;
            CashFlow::create([
                'type'             => 'income',
                'source_type'      => 'sale',
                'source_id'        => $sale->id,
                'amount'           => $totalAmount,
                'description'      => 'Penjualan POS - ' . $invoiceNumber,
                'transaction_date' => today(),
                'balance_after'    => $lastBalance + $totalAmount,
            ]);

            DB::commit();
            return response()->json($sale->load(['user', 'items.product']), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function show(Sale $sale)
    {
        return response()->json($sale->load(['user', 'items.product']));
    }
}
