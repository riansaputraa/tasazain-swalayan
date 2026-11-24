import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

export default function PosCashierView({ user }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // cash, qris, transfer
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  // Receipt Modal State
  const [completedSale, setCompletedSale] = useState(null);

  const barcodeInputRef = useRef(null);

  // Load products & categories
  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.getPosProducts(),
        api.getCategories(),
      ]);
      setProducts(prodRes || []);
      setCategories(catRes || []);
    } catch (err) {
      console.error('Error loading POS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  // Add product to cart
  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert(`Stok produk "${product.name}" habis!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Maksimal stok tersedia (${product.stock}) telah tercapai!`);
          return prev;
        }
        return prev.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          sku: product.sku,
          price: Number(product.sell_price),
          stock: product.stock,
          quantity: 1,
          subtotal: Number(product.sell_price),
        },
      ];
    });
  };

  // Barcode / SKU Enter handle
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const trimmed = searchQuery.trim().toLowerCase();
    const found = products.find(
      (p) => p.sku.toLowerCase() === trimmed || p.name.toLowerCase().includes(trimmed)
    );

    if (found) {
      addToCart(found);
      setSearchQuery('');
    } else {
      alert(`Produk dengan SKU / nama "${searchQuery}" tidak ditemukan!`);
    }
  };

  // Change quantity
  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product_id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.stock) {
              alert(`Maksimal stok tersedia: ${item.stock}`);
              return item;
            }
            return {
              ...item,
              quantity: newQty,
              subtotal: newQty * item.price,
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove item
  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const clearCart = () => {
    if (cart.length > 0 && confirm('Kosongkan semua keranjang belanja?')) {
      setCart([]);
    }
  };

  // Cart Totals
  const totalAmount = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'ALL' || String(p.category_id) === String(selectedCategory);
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Open Checkout Modal
  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setPaidAmount(String(totalAmount));
    setPaymentError('');
    setShowPaymentModal(true);
  };

  // Quick cash buttons
  const setQuickCash = (amount) => {
    setPaidAmount(String(amount));
  };

  const changeAmount = Math.max((Number(paidAmount) || 0) - totalAmount, 0);

  // Submit Sale to Laravel API
  const handleProcessSale = async () => {
    const paidNum = Number(paidAmount) || 0;
    if (paymentMethod === 'cash' && paidNum < totalAmount) {
      setPaymentError(`Uang pembayaran kurang ${formatRupiah(totalAmount - paidNum)}!`);
      return;
    }

    setProcessingPayment(true);
    setPaymentError('');

    try {
      const payload = {
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          sell_price: item.price,
        })),
        paid_amount: paymentMethod === 'cash' ? paidNum : totalAmount,
        notes: `Pembayaran via ${paymentMethod.toUpperCase()}`,
      };

      const result = await api.createSale(payload);

      // Save completed sale for Receipt Modal
      setCompletedSale(result.sale);
      setShowPaymentModal(false);
      setCart([]);

      // Reload products to refresh stock counts
      await loadData();
    } catch (err) {
      setPaymentError(err.message || 'Gagal menyimpan transaksi');
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-4 select-none">
      {/* LEFT: Product Catalog & Fast SKU Search */}
      <div className="flex-1 flex flex-col bg-[#141519] border border-white/10 rounded-2xl overflow-hidden">
        {/* Search & Barcode Scan Header */}
        <div className="p-4 border-b border-white/10 bg-[#181920]/50 flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleBarcodeSubmit} className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xl">
              barcode_scanner
            </span>
            <input
              ref={barcodeInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Scan Barcode SKU / Cari Nama Produk (Tekan Enter)..."
              className="w-full bg-[#0d0e12] border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-mono"
            />
          </form>

          {/* Quick Refresh */}
          <button
            onClick={loadData}
            title="Muat ulang stok"
            className="p-2.5 rounded-xl bg-[#0d0e12] border border-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[19px]">refresh</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="px-4 py-2.5 border-b border-white/10 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-white text-black shadow-sm'
                : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Semua ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                String(selectedCategory) === String(cat.id)
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          {loading ? (
            <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
              <span className="inline-block w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
              Memuat katalog produk...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-sm">
              <span className="material-symbols-outlined text-4xl mb-2 text-zinc-600">inventory_2</span>
              <span>Produk tidak ditemukan</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((prod) => {
                const isOutOfStock = prod.stock <= 0;
                const isLowStock = prod.stock > 0 && prod.stock <= prod.min_stock;

                return (
                  <div
                    key={prod.id}
                    onClick={() => !isOutOfStock && addToCart(prod)}
                    className={`p-3 rounded-xl border flex flex-col justify-between transition-all select-none cursor-pointer ${
                      isOutOfStock
                        ? 'opacity-40 border-white/5 bg-[#181920] cursor-not-allowed'
                        : 'bg-[#181920] hover:bg-[#21222b] border-white/10 hover:border-white/30 hover:scale-[1.01] active:scale-[0.98]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                          {prod.sku}
                        </span>
                        {isOutOfStock ? (
                          <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                            HABIS
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            SISA {prod.stock}
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-emerald-400">
                            Stok {prod.stock}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs font-bold text-white leading-snug line-clamp-2">
                        {prod.name}
                      </h3>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-sm font-bold text-white font-mono">
                        {formatRupiah(prod.sell_price)}
                      </span>
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Active Cashier Order Cart */}
      <div className="w-[380px] flex flex-col bg-[#141519] border border-white/10 rounded-2xl overflow-hidden">
        {/* Cart Header */}
        <div className="p-4 border-b border-white/10 bg-[#181920]/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-white text-xl">shopping_cart</span>
            <span className="font-bold text-sm text-white">Keranjang Kasir</span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-mono font-bold text-zinc-300">
              {totalItemsCount}
            </span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              title="Reset Keranjang"
              className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-xs">
              <span className="material-symbols-outlined text-4xl mb-2 text-zinc-600">
                shopping_cart_checkout
              </span>
              <span>Keranjang masih kosong</span>
              <span className="text-[11px] text-zinc-600 mt-1">
                Pilih barang atau scan barcode
              </span>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product_id}
                className="p-3 rounded-xl bg-[#181920] border border-white/5 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white line-clamp-1">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {formatRupiah(item.price)}
                    </span>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    className="text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {/* Quantity Controls */}
                  <div className="flex items-center bg-[#0d0e12] rounded-lg border border-white/10 p-0.5">
                    <button
                      onClick={() => updateQuantity(item.product_id, -1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10"
                    >
                      <span className="material-symbols-outlined text-[14px]">remove</span>
                    </button>
                    <span className="w-8 text-center text-xs font-bold font-mono text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product_id, 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10"
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span>
                    </button>
                  </div>

                  <span className="text-xs font-bold font-mono text-white">
                    {formatRupiah(item.subtotal)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Calculation & Payment Bar */}
        <div className="p-4 border-t border-white/10 bg-[#181920]/80 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Subtotal ({totalItemsCount} item)</span>
            <span className="font-mono text-white">{formatRupiah(totalAmount)}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Pajak PPN (0%)</span>
            <span className="font-mono text-white">Rp 0</span>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Total Bayar
            </span>
            <span className="text-xl font-bold font-mono text-white">
              {formatRupiah(totalAmount)}
            </span>
          </div>

          <button
            type="button"
            disabled={cart.length === 0}
            onClick={handleOpenCheckout}
            className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:pointer-events-none text-black font-extrabold text-sm rounded-xl transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
          >
            <span className="material-symbols-outlined text-[20px]">payments</span>
            <span>Bayar Sekarang (F9)</span>
          </button>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#141519] border border-white/20 rounded-2xl shadow-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">point_of_sale</span>
                <h3 className="text-base font-bold text-white">Penyelesaian Transaksi</h3>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {paymentError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{paymentError}</span>
              </div>
            )}

            {/* Total Billing Display */}
            <div className="p-4 rounded-xl bg-[#181920] border border-white/10 flex flex-col items-center">
              <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
                Total Tagihan Belanja
              </span>
              <span className="text-3xl font-bold font-mono text-white mt-1">
                {formatRupiah(totalAmount)}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cash', label: 'Tunai (Cash)', icon: 'payments' },
                  { id: 'qris', label: 'QRIS', icon: 'qr_code_2' },
                  { id: 'transfer', label: 'Transfer Bank', icon: 'account_balance' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === m.id
                        ? 'border-emerald-400 bg-emerald-500/10 text-emerald-400 font-bold'
                        : 'border-white/10 bg-[#181920] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">{m.icon}</span>
                    <span className="text-xs">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* If Cash: Nominal & Change Calculation */}
            {paymentMethod === 'cash' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                    Uang Diterima (Rp)
                  </label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder="Masukkan nominal uang..."
                    className="w-full bg-[#0d0e12] border border-white/15 rounded-xl px-4 py-3 text-lg font-mono font-bold text-white focus:outline-none focus:border-emerald-400 transition-all"
                  />
                </div>

                {/* Quick Cash Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickCash(totalAmount)}
                    className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-semibold"
                  >
                    Uang Pas ({formatRupiah(totalAmount)})
                  </button>
                  {[50000, 100000, 150000, 200000, 500000].map((amt) => {
                    if (amt >= totalAmount) {
                      return (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setQuickCash(amt)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#181920] hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-mono"
                        >
                          {formatRupiah(amt)}
                        </button>
                      );
                    }
                    return null;
                  })}
                </div>

                {/* Change */}
                <div className="p-3 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                    Kembalian
                  </span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {formatRupiah(changeAmount)}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={processingPayment}
                onClick={handleProcessSale}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {processingPayment ? (
                  <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>Selesaikan Transaksi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {completedSale && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white text-black rounded-2xl shadow-2xl p-6 font-mono text-xs flex flex-col gap-4">
            {/* Receipt Header */}
            <div className="text-center pb-3 border-b border-dashed border-zinc-400">
              <img
                src="/logo.png"
                alt="Tasazain Logo"
                className="w-10 h-10 mx-auto mb-2 object-contain"
              />
              <h2 className="text-base font-extrabold uppercase tracking-tight">TASAZAIN SWALAYAN</h2>
              <p className="text-[11px] text-zinc-600">Tasazain Retail Enterprise</p>
              <p className="text-[10px] text-zinc-500">Jl. Raya Sukolilo No. 1, Surabaya</p>
              <div className="mt-2 text-[10px] text-zinc-600">
                <div>No: {completedSale.invoice_number}</div>
                <div>Tgl: {completedSale.sale_date}</div>
                <div>Kasir: {user?.name || 'Kasir Toko'}</div>
              </div>
            </div>

            {/* Item list */}
            <div className="space-y-1.5 max-h-52 overflow-y-auto border-b border-dashed border-zinc-400 pb-3">
              {completedSale.items &&
                completedSale.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-start text-[11px]">
                    <div className="flex-1">
                      <div>{it.product ? it.product.name : `Item #${it.product_id}`}</div>
                      <div className="text-zinc-500 text-[10px]">
                        {it.quantity} x {formatRupiah(it.sell_price)}
                      </div>
                    </div>
                    <div className="font-bold">{formatRupiah(it.subtotal)}</div>
                  </div>
                ))}
            </div>

            {/* Summary */}
            <div className="space-y-1 border-b border-dashed border-zinc-400 pb-3 text-[11px]">
              <div className="flex justify-between font-bold text-sm">
                <span>TOTAL:</span>
                <span>{formatRupiah(completedSale.total_amount)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>DIBAYAR:</span>
                <span>{formatRupiah(completedSale.paid_amount)}</span>
              </div>
              <div className="flex justify-between font-bold text-zinc-800">
                <span>KEMBALI:</span>
                <span>{formatRupiah(completedSale.change_amount)}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-zinc-500">
              *** TERIMA KASIH TELAH BERBELANJA ***<br />
              Barang yang sudah dibeli tidak dapat ditukar
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-black transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Cetak Struk</span>
              </button>
              <button
                type="button"
                onClick={() => setCompletedSale(null)}
                className="px-4 py-2.5 rounded-lg bg-zinc-200 text-zinc-800 font-bold text-xs hover:bg-zinc-300 transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
