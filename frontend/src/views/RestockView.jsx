import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function RestockView() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // New Purchase Order Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [orderItems, setOrderItems] = useState([
    { product_id: '', quantity: 10, buy_price: 0, subtotal: 0 },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [purchRes, suppRes, prodRes] = await Promise.all([
        api.getPurchases(),
        api.getSuppliers(),
        api.getPosProducts(),
      ]);
      setPurchases(purchRes || []);
      setSuppliers(suppRes || []);
      setProducts(prodRes || []);
    } catch (err) {
      console.error('Error loading restock data:', err);
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

  const openOrderModal = () => {
    setSelectedSupplier(suppliers[0]?.id || '');
    setInvoiceNumber('PO-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900));
    setNotes('Kulakan barang dagangan swalayan');
    setOrderItems([
      { product_id: products[0]?.id || '', quantity: 10, buy_price: Number(products[0]?.buy_price) || 0, subtotal: (Number(products[0]?.buy_price) || 0) * 10 },
    ]);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleProductChange = (index, productId) => {
    const prod = products.find((p) => String(p.id) === String(productId));
    const buyPrice = Number(prod?.buy_price) || 0;
    setOrderItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              product_id: productId,
              buy_price: buyPrice,
              subtotal: buyPrice * item.quantity,
            }
          : item
      )
    );
  };

  const handleQtyChange = (index, qty) => {
    const quantity = Math.max(Number(qty) || 1, 1);
    setOrderItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              quantity,
              subtotal: quantity * item.buy_price,
            }
          : item
      )
    );
  };

  const handlePriceChange = (index, price) => {
    const buyPrice = Math.max(Number(price) || 0, 0);
    setOrderItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              buy_price: buyPrice,
              subtotal: item.quantity * buyPrice,
            }
          : item
      )
    );
  };

  const addItemRow = () => {
    const firstProd = products[0];
    const buyPrice = Number(firstProd?.buy_price) || 0;
    setOrderItems([
      ...orderItems,
      { product_id: firstProd?.id || '', quantity: 10, buy_price: buyPrice, subtotal: buyPrice * 10 },
    ]);
  };

  const removeItemRow = (index) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, idx) => idx !== index));
    }
  };

  const totalOrderAmount = orderItems.reduce((acc, item) => acc + item.subtotal, 0);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        supplier_id: selectedSupplier,
        invoice_number: invoiceNumber,
        notes: notes,
        items: orderItems.map((it) => ({
          product_id: it.product_id,
          quantity: it.quantity,
          buy_price: it.buy_price,
        })),
      };

      await api.createPurchase(payload);
      setShowModal(false);
      await loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menyimpan transaksi kulakan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-display">
            Kulakan & Restock Supplier
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Pencatatan pembelian stok barang grosir dari distributor, otomatis menambah saldo stok & kas keluar
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openOrderModal}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-bold transition-all border border-white shadow-md shadow-white/5"
          >
            <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
            <span>+ Buat Kulakan Baru</span>
          </button>
        </div>
      </div>

      {/* Supplier List Pills */}
      <div className="p-4 rounded-2xl bg-[#141519] border border-white/10 flex items-center justify-between overflow-x-auto gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Distributor Rekanan:
          </span>
          <div className="flex items-center gap-2">
            {suppliers.map((s) => (
              <span
                key={s.id}
                className="px-3 py-1 rounded-lg bg-[#181920] border border-white/10 text-xs text-zinc-300 font-medium"
              >
                {s.name} <span className="text-zinc-500">({s.phone})</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Purchases History Table */}
      <div className="rounded-2xl bg-[#141519] border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Riwayat Transaksi Kulakan</h2>
          <button
            onClick={loadData}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[#181920]/60 text-zinc-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">No. Invoice PO</th>
                <th className="py-3 px-4">Tanggal Kulakan</th>
                <th className="py-3 px-4">Distributor / Supplier</th>
                <th className="py-3 px-4">Item Barang</th>
                <th className="py-3 px-4 text-right">Total Pembelian</th>
                <th className="py-3 px-4">Status & Kas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-zinc-500">
                    <span className="inline-block w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Memuat riwayat kulakan...
                  </td>
                </tr>
              ) : purchases.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-zinc-500">
                    Belum ada riwayat kulakan barang. Klik "+ Buat Kulakan Baru" untuk menambah stok.
                  </td>
                </tr>
              ) : (
                purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {p.invoice_number}
                    </td>
                    <td className="py-3 px-4 text-zinc-400 font-mono">
                      {p.purchase_date}
                    </td>
                    <td className="py-3 px-4 font-semibold text-zinc-300">
                      {p.supplier?.name || 'Distributor'}
                    </td>
                    <td className="py-3 px-4 text-zinc-400">
                      <div className="space-y-0.5">
                        {p.items &&
                          p.items.map((it, idx) => (
                            <div key={idx} className="text-[11px]">
                              • {it.product?.name || `Item #${it.product_id}`} ({it.quantity} unit)
                            </div>
                          ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                      - {formatRupiah(p.total_amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        STOK DITAMBAHKAN
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE PURCHASE ORDER MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#141519] border border-white/20 rounded-2xl shadow-2xl p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-white">add_shopping_cart</span>
                <h3 className="text-base font-bold text-white">Order Kulakan Restock Baru</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                    Pilih Distributor / Supplier
                  </label>
                  <select
                    required
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="w-full bg-[#181920] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                    Nomor Invoice PO
                  </label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full bg-[#181920] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              {/* Order Items Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Daftar Barang yang Dipesan
                  </label>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-xs text-white hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span className="material-symbols-outlined text-[15px]">add</span>
                    <span>Tambah Baris</span>
                  </button>
                </div>

                <div className="space-y-2 border border-white/10 rounded-xl p-3 bg-[#181920]/40">
                  {orderItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <select
                          required
                          value={item.product_id}
                          onChange={(e) => handleProductChange(idx, e.target.value)}
                          className="w-full bg-[#181920] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Stok: {p.stock})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleQtyChange(idx, e.target.value)}
                          placeholder="Qty"
                          className="w-full bg-[#181920] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-center font-mono text-white"
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          required
                          value={item.buy_price}
                          onChange={(e) => handlePriceChange(idx, e.target.value)}
                          placeholder="Harga Beli"
                          className="w-full bg-[#181920] border border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono text-right text-white"
                        />
                      </div>

                      <div className="col-span-2 text-right font-mono font-bold text-xs text-zinc-300">
                        {formatRupiah(item.subtotal)}
                      </div>

                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="text-zinc-500 hover:text-rose-400"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="p-3 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400">Total Biaya Kulakan:</span>
                <span className="text-xl font-bold font-mono text-rose-400">
                  {formatRupiah(totalOrderAmount)}
                </span>
              </div>

              <div className="flex gap-3 pt-2">
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
                    <span>Konfirmasi & Tambah Stok</span>
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
