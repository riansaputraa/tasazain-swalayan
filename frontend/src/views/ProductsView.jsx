import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function ProductsView() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category_id: '',
    buy_price: '',
    sell_price: '',
    stock: '',
    min_stock: '5',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.getProducts({ search, category_id: selectedCategory }),
        api.getCategories(),
      ]);
      setProducts(prodRes.data || prodRes || []);
      setCategories(catRes || []);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      sku: 'PRD' + Math.floor(1000 + Math.random() * 9000),
      name: '',
      category_id: categories[0]?.id || '',
      buy_price: '',
      sell_price: '',
      stock: '10',
      min_stock: '5',
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      sku: prod.sku,
      name: prod.name,
      category_id: prod.category_id,
      buy_price: prod.buy_price,
      sell_price: prod.sell_price,
      stock: prod.stock,
      min_stock: prod.min_stock,
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Yakin ingin menghapus produk "${name}"?`)) {
      try {
        await api.deleteProduct(id);
        await loadData();
      } catch (err) {
        alert(err.message || 'Gagal menghapus produk');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData);
      } else {
        await api.createProduct(formData);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menyimpan produk');
    } finally {
      setSubmitting(false);
    }
  };

  const displayedProducts = products.filter((p) => {
    if (filterLowStockOnly) {
      return p.stock <= p.min_stock;
    }
    return true;
  });

  // Calculate profit margin percentage
  const calcMargin = (buy, sell) => {
    const b = Number(buy) || 0;
    const s = Number(sell) || 0;
    if (s <= 0) return 0;
    return Math.round(((s - b) / s) * 100);
  };

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-display">
            Katalog & Stok Produk
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Kelola inventaris, barcode SKU, batas minimum stok, dan penetapan harga jual
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              filterLowStockOnly
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-[#141519] border-white/10 text-zinc-300 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">warning</span>
            <span>Filter Stok Tipis Saja</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-bold transition-all border border-white shadow-md shadow-white/5"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>+ Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#141519] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-96 relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-lg">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama barang atau barcode SKU..."
            className="w-full bg-[#181920] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#181920] border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-white/30"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={loadData}
            title="Refresh tabel"
            className="p-2 rounded-xl bg-[#181920] border border-white/10 text-zinc-400 hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-[#141519] border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[#181920]/60 text-zinc-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">SKU / Barcode</th>
                <th className="py-3 px-4">Nama Produk</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right">Harga Beli</th>
                <th className="py-3 px-4 text-right">Harga Jual</th>
                <th className="py-3 px-4 text-center">Margin</th>
                <th className="py-3 px-4 text-center">Stok</th>
                <th className="py-3 px-4 text-center">Safety Stock</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-zinc-500">
                    <span className="inline-block w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Memuat data produk...
                  </td>
                </tr>
              ) : displayedProducts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-zinc-500">
                    Tidak ada produk yang cocok dengan pencarian
                  </td>
                </tr>
              ) : (
                displayedProducts.map((p) => {
                  const isOutOfStock = p.stock <= 0;
                  const isLowStock = p.stock > 0 && p.stock <= p.min_stock;
                  const margin = calcMargin(p.buy_price, p.sell_price);

                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-zinc-300">
                        {p.sku}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white max-w-xs">
                        {p.name}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px]">
                          {p.category?.name || '-'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-zinc-400">
                        {formatRupiah(p.buy_price)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                        {formatRupiah(p.sell_price)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          +{margin}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono">
                        {isOutOfStock ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            HABIS (0)
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
                            TIPIS ({p.stock})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            AMAN ({p.stock})
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-zinc-400">
                        {p.min_stock}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(p)}
                            title="Edit Produk"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            title="Hapus Produk"
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#141519] border border-white/20 rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-white">
                  {editingProduct ? 'edit_note' : 'add_box'}
                </span>
                <h3 className="text-base font-bold text-white">
                  {editingProduct ? 'Edit Informasi Produk' : 'Tambah Produk Baru'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                    SKU / Barcode
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-[#181920] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                    Kategori
                  </label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full bg-[#181920] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                  Nama Barang / Produk
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Beras Rojolele 5kg"
                  className="w-full bg-[#181920] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                    Harga Beli / Kulakan (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.buy_price}
                    onChange={(e) => setFormData({ ...formData, buy_price: e.target.value })}
                    className="w-full bg-[#181920] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                    Harga Jual Eceran (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.sell_price}
                    onChange={(e) => setFormData({ ...formData, sell_price: e.target.value })}
                    className="w-full bg-[#181920] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                    Stok Awal
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-[#181920] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                    Safety Stock (Batas Min)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.min_stock}
                    onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                    className="w-full bg-[#181920] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              {/* Profit Preview */}
              {formData.buy_price && formData.sell_price && (
                <div className="p-3 rounded-xl bg-[#181920] border border-white/5 flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Keuntungan per item:</span>
                  <span className="font-bold text-emerald-400">
                    {formatRupiah(Number(formData.sell_price) - Number(formData.buy_price))} (+
                    {calcMargin(formData.buy_price, formData.sell_price)}%)
                  </span>
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Simpan Produk</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
