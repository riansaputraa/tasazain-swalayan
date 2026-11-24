<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('sku', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->stock_status === 'low') {
            $query->whereRaw('stock <= min_stock');
        } elseif ($request->stock_status === 'empty') {
            $query->where('stock', 0);
        }

        return response()->json($query->orderBy('name')->paginate(15));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'sku'         => 'required|string|unique:products,sku',
            'name'        => 'required|string|max:255',
            'buy_price'   => 'required|numeric|min:0',
            'sell_price'  => 'required|numeric|min:0',
            'stock'       => 'required|integer|min:0',
            'min_stock'   => 'required|integer|min:0',
        ]);

        $product = Product::create($data);
        return response()->json($product->load('category'), 201);
    }

    public function show(Product $product)
    {
        return response()->json($product->load('category'));
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'sku'         => 'required|string|unique:products,sku,' . $product->id,
            'name'        => 'required|string|max:255',
            'buy_price'   => 'required|numeric|min:0',
            'sell_price'  => 'required|numeric|min:0',
            'stock'       => 'required|integer|min:0',
            'min_stock'   => 'required|integer|min:0',
        ]);

        $product->update($data);
        return response()->json($product->load('category'));
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(['message' => 'Produk berhasil dihapus.']);
    }

    // Endpoint khusus: list produk untuk POS (semua, tanpa pagination)
    public function forPos(Request $request)
    {
        $query = Product::with('category')->where('stock', '>', 0);

        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        return response()->json($query->orderBy('name')->get());
    }

    // Endpoint: list produk dengan stok menipis
    public function lowStock()
    {
        $products = Product::with('category')
            ->whereRaw('stock <= min_stock')
            ->orderBy('stock')
            ->get();

        return response()->json($products);
    }
}
