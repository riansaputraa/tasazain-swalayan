import React, { useState, useEffect, useRef, useMemo } from 'react';
import { api } from '../services/api';

export default function PosCashierView({ user }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quickNotice, setQuickNotice] = useState('');

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // cash, qris, transfer
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  // Receipt Modal State
  const [completedSale, setCompletedSale] = useState(null);

  const searchInputRef = useRef(null);

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

  const showToast = (msg) => {
    setQuickNotice(msg);
    setTimeout(() => {
      setQuickNotice('');
    }, 2500);
  };

  // Add product to cart
  const addToCart = (product) => {
    if (product.stock <= 0) {
      showToast(`Stok "${product.name}" sedang habis!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          showToast(`Batas stok tercapai (${product.stock} unit)`);
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

  // Quick submit on search enter (e.g. barcode scanner or typing exact SKU/name)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim().toLowerCase();
    // Prioritaskan exact match SKU, lalu name match
    const exactSku = products.find((p) => p.sku.toLowerCase() === query);
    const found = exactSku || products.find((p) => p.name.toLowerCase().includes(query));

    if (found) {
      if (found.stock > 0) {
        addToCart(found);
        setSearchQuery('');
        showToast(`+ Ditambahkan: ${found.name}`);
      } else {
        showToast(`Stok "${found.name}" habis!`);
      }
    } else {
      showToast(`Produk "${searchQuery}" tidak ditemukan`);
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
              showToast(`Maksimal stok tersedia: ${item.stock}`);
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
  const totalAmount = useMemo(
    () => cart.reduce((acc, item) => acc + item.subtotal, 0),
    [cart]
  );
  const totalItemsCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  // Map cart items for quick lookup in product cards
  const cartItemQuantities = useMemo(() => {
    const map = {};
    cart.forEach((it) => {
      map[it.product_id] = it.quantity;
    });
    return map;
  }, [cart]);

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'ALL' || String(p.category_id) === String(selectedCategory);
      const matchesSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

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
      window.dispatchEvent(new CustomEvent('stock:updated'));
      await loadData();
    } catch (err) {
      setPaymentError(err.message || 'Gagal menyimpan transaksi');
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-[1600px] mx-auto pb-6 select-none">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#141519] border border-white/10 rounded-2xl px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">point_of_sale</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight font-display">
                Kasir & Transaksi POS
              </h1>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Kasir Aktif
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Petugas: <span className="text-zinc-200 font-semibold">{user?.name || 'Kasir Swalayan'}</span> • Tasazain Retail
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {quickNotice && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-in fade-in flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">check_circle</span>
              <span>{quickNotice}</span>
            </div>
          )}

          <button
            onClick={loadData}
            title="Muat ulang data stok"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#181920] hover:bg-[#21222b] text-zinc-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">sync</span>
            <span className="hidden sm:inline">Segarkan Stok</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* LEFT COLUMN: Product Catalog & Instant Search */}
        <div className="flex-1 w-full bg-[#141519] border border-white/10 rounded-2xl flex flex-col overflow-hidden">
          {/* Search Bar & Category Header */}
          <div className="p-4 border-b border-white/10 bg-[#181920]/40 flex flex-col gap-3">
            {/* Instant Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-zinc-400 text-xl pointer-events-none">
                search
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama produk atau kode SKU..."
                className="w-full bg-[#0d0e12] border border-white/10 rounded-xl pl-11 pr-10 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-zinc-400 hover:text-white p-1 cursor-pointer"
                  title="Hapus pencarian"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </form>

            {/* Clean Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === 'ALL'
                    ? 'bg-white text-black shadow-sm font-bold'
                    : 'bg-[#181920] text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                Semua Produk ({products.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    String(selectedCategory) === String(cat.id)
                      ? 'bg-white text-black shadow-sm font-bold'
                      : 'bg-[#181920] text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid Area */}
          <div className="p-4 min-h-[500px] max-h-[680px] overflow-y-auto">
            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center text-zinc-500 text-xs">
                <span className="inline-block w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mb-2" />
                <span>Memuat katalog produk...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-zinc-500 text-xs">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-2xl text-zinc-400">inventory_2</span>
                </div>
                <span className="font-semibold text-zinc-300">Tidak ada produk yang cocok</span>
                <span className="text-[11px] text-zinc-500 mt-0.5">
                  Coba kata kunci lain atau pilih kategori berbeda
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map((prod) => {
                  const isOutOfStock = prod.stock <= 0;
                  const isLowStock = prod.stock > 0 && prod.stock <= prod.min_stock;
                  const inCartQty = cartItemQuantities[prod.id] || 0;

                  return (
                    <div
                      key={prod.id}
                      onClick={() => !isOutOfStock && addToCart(prod)}
                      className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all select-none relative group ${
                        isOutOfStock
                          ? 'opacity-40 border-white/5 bg-[#181920] cursor-not-allowed'
                          : inCartQty > 0
                          ? 'bg-[#181920] hover:bg-[#21222b] border-emerald-500/40 hover:border-emerald-500/60 cursor-pointer shadow-sm shadow-emerald-500/5'
                          : 'bg-[#181920] hover:bg-[#21222b] border-white/10 hover:border-white/25 cursor-pointer hover:-translate-y-0.5'
                      }`}
                    >
                      {/* In-Cart Floating Badge */}
                      {inCartQty > 0 && (
                        <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-extrabold font-mono shadow-md flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[11px]">shopping_cart</span>
                          <span>{inCartQty}x</span>
                        </div>
                      )}

                      {/* Top Header in Card: SKU & Stock Status */}
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className="text-[10px] font-mono text-zinc-400 bg-[#0d0e12] px-2 py-0.5 rounded-md border border-white/5">
                            {prod.sku}
                          </span>

                          {isOutOfStock ? (
                            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-md border border-rose-500/20">
                              Habis
                            </span>
                          ) : isLowStock ? (
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20">
                              Sisa {prod.stock}
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              {prod.stock} unit
                            </span>
                          )}
                        </div>

                        {/* Product Title */}
                        <h3 className="text-xs font-bold text-white leading-snug line-clamp-2 group-hover:text-zinc-100">
                          {prod.name}
                        </h3>
                      </div>

                      {/* Bottom Footer in Card: Price & Add Button */}
                      <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-between">
                        <span className="text-sm font-bold text-white font-mono tracking-tight">
                          {formatRupiah(prod.sell_price)}
                        </span>

                        <button
                          type="button"
                          disabled={isOutOfStock}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                            isOutOfStock
                              ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                              : inCartQty > 0
                              ? 'bg-emerald-500 text-black font-bold hover:bg-emerald-400'
                              : 'bg-white/10 group-hover:bg-white text-zinc-300 group-hover:text-black'
                          }`}
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

        {/* RIGHT COLUMN: Active Order Cart & Payment */}
        <div className="w-full lg:w-[410px] bg-[#141519] border border-white/10 rounded-2xl flex flex-col overflow-hidden sticky top-4">
          {/* Cart Header */}
          <div className="p-4 border-b border-white/10 bg-[#181920]/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-white text-xl">shopping_cart</span>
              <span className="font-bold text-sm text-white">Keranjang Kasir</span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-mono font-bold text-zinc-300">
                {totalItemsCount}
              </span>
            </div>

            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer flex items-center gap-1"
                title="Kosongkan Keranjang"
              >
                <span className="material-symbols-outlined text-sm">delete_sweep</span>
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="p-4 overflow-y-auto max-h-[380px] min-h-[220px] space-y-2.5">
            {cart.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-zinc-500 text-xs text-center">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800/40 flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-2xl text-zinc-500">
                    add_shopping_cart
                  </span>
                </div>
                <span className="font-semibold text-zinc-300">Keranjang Masih Kosong</span>
                <span className="text-[11px] text-zinc-500 mt-1 max-w-[200px]">
                  Klik produk pada katalog di sebelah kiri untuk menambah pesanan
                </span>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product_id}
                  className="p-3 rounded-xl bg-[#181920] border border-white/5 flex flex-col gap-2 hover:border-white/15 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col flex-1">
                      <span className="text-xs font-bold text-white line-clamp-1 leading-snug">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        {formatRupiah(item.price)} / unit
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product_id)}
                      className="text-zinc-500 hover:text-rose-400 p-1 rounded-md hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Hapus barang ini"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {/* Stepper Quantity Control */}
                    <div className="flex items-center bg-[#0d0e12] rounded-lg border border-white/10 p-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product_id, -1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title="Kurangi 1"
                      >
                        <span className="material-symbols-outlined text-[14px]">remove</span>
                      </button>
                      <span className="w-8 text-center text-xs font-bold font-mono text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product_id, 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title="Tambah 1"
                      >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                      </button>
                    </div>

                    {/* Subtotal */}
                    <span className="text-xs font-bold font-mono text-white">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Summary & Checkout Button */}
          <div className="p-4 border-t border-white/10 bg-[#181920]/80 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Total Item Belanja</span>
              <span className="font-mono text-white font-semibold">{totalItemsCount} Barang</span>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Total Tagihan
                </span>
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  {formatRupiah(totalAmount)}
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={cart.length === 0}
              onClick={handleOpenCheckout}
              className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:pointer-events-none text-black font-extrabold text-sm rounded-xl transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">payments</span>
              <span>Bayar Transaksi ({formatRupiah(totalAmount)})</span>
            </button>
          </div>
        </div>
      </div>

      {/* CHECKOUT & PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141519] border border-white/20 rounded-2xl shadow-2xl p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">point_of_sale</span>
                <h3 className="text-base font-bold text-white">Pembayaran Kasir</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
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
              <span className="text-3xl font-bold font-mono text-emerald-400 mt-1">
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
                  { id: 'transfer', label: 'Transfer', icon: 'account_balance' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
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
                    Uang Diterima dari Pelanggan (Rp)
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
                    className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-semibold cursor-pointer"
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
                          className="px-2.5 py-1.5 rounded-lg bg-[#181920] hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-mono cursor-pointer"
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
                    Uang Kembalian
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
                className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={processingPayment}
                onClick={handleProcessSale}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
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
          <div className="w-full max-w-sm bg-white text-black rounded-2xl shadow-2xl p-6 font-mono text-xs flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
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
                className="flex-1 py-2.5 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-black transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Cetak Struk</span>
              </button>
              <button
                type="button"
                onClick={() => setCompletedSale(null)}
                className="px-4 py-2.5 rounded-lg bg-zinc-200 text-zinc-800 font-bold text-xs hover:bg-zinc-300 transition-all cursor-pointer"
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
