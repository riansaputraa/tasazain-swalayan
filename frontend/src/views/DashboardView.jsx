import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function DashboardView({ setCurrentView }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: {
      total_income: 0,
      total_expense: 0,
      net_profit: 0,
      low_stock_count: 0,
    },
    low_stock_products: [],
    chart_data: [],
  });

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboard();
      setData(res);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Top Banner Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Ikhtisar Finansial & Inventori Toko
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-display">
            Ringkasan Operasional Swalayan
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboard}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#141519] hover:bg-[#21222b] text-zinc-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[17px]">refresh</span>
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* 4 Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="p-5 rounded-xl bg-[#141519] border border-white/10 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Pemasukan (Penjualan)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">trending_up</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white font-mono">
              {formatRupiah(data.stats.total_income)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400 font-semibold">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              <span>Bulan Berjalan</span>
            </div>
          </div>
        </div>

        {/* Total Expense */}
        <div className="p-5 rounded-xl bg-[#141519] border border-white/10 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Pengeluaran (Kulakan + Biaya)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">trending_down</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white font-mono">
              {formatRupiah(data.stats.total_expense)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-rose-400 font-semibold">
              <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
              <span>Kulakan & Operasional</span>
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="p-5 rounded-xl bg-[#141519] border border-white/10 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Laba Bersih Toko</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            </div>
          </div>
          <div className="mt-4">
            <div className={`text-2xl font-bold font-mono ${data.stats.net_profit >= 0 ? 'text-white' : 'text-rose-400'}`}>
              {formatRupiah(data.stats.net_profit)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-zinc-400">
              <span className="text-white font-semibold">Pemasukan dikurangi Pengeluaran</span>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="p-5 rounded-xl bg-[#141519] border border-white/10 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Peringatan Stok Menipis</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-amber-400 font-mono">
              {data.stats.low_stock_count} <span className="text-xs text-zinc-400 font-sans">SKU Perlu Restock</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px]">
              <button
                onClick={() => setCurrentView('products')}
                className="text-amber-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>Lihat Katalog Stok</span>
                <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Financial Trend & Low Stock Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Flow Overview (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#141519] border border-white/10 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Tren Arus Keuangan (6 Bulan Terakhir)
              </h2>
              <p className="text-xs text-zinc-400">Komparasi Pemasukan Penjualan vs Biaya Kulakan</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-zinc-300">Pemasukan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-500" />
                <span className="text-zinc-300">Pengeluaran</span>
              </div>
            </div>
          </div>

          {/* Chart Display */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-white/10">
            {data.chart_data && data.chart_data.length > 0 ? (
              data.chart_data.map((item, idx) => {
                const maxVal = Math.max(
                  ...data.chart_data.map((c) => Math.max(Number(c.income) || 0, Number(c.expense) || 0)),
                  100000
                );
                const incHeight = Math.max(((Number(item.income) || 0) / maxVal) * 100, 6);
                const expHeight = Math.max(((Number(item.expense) || 0) / maxVal) * 100, 6);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1 h-44">
                      {/* Income Bar */}
                      <div
                        style={{ height: `${incHeight}%` }}
                        className="w-1/2 max-w-[24px] bg-emerald-500/80 group-hover:bg-emerald-400 rounded-t transition-all relative"
                        title={`Pemasukan: ${formatRupiah(item.income)}`}
                      />
                      {/* Expense Bar */}
                      <div
                        style={{ height: `${expHeight}%` }}
                        className="w-1/2 max-w-[24px] bg-rose-500/80 group-hover:bg-rose-400 rounded-t transition-all relative"
                        title={`Pengeluaran: ${formatRupiah(item.expense)}`}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400 mt-3 group-hover:text-white transition-colors">
                      {item.month}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
                Belum ada data transaksi
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
            <span>Data tersinkron otomatis dengan kasir & buku kas</span>
            <button
              onClick={() => setCurrentView('finance')}
              className="text-white hover:underline font-semibold flex items-center gap-1"
            >
              <span>Buka Laporan Keuangan Penuh</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Low Stock Watchlist (1 col) */}
        <div className="p-6 rounded-2xl bg-[#141519] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-lg">crisis_alert</span>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Stok Menipis
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[11px] font-bold border border-amber-500/20">
                {data.low_stock_products.length} SKU
              </span>
            </div>

            <p className="text-xs text-zinc-400 mb-4">
              Barang di bawah batas minimal (Safety Stock)
            </p>

            <div className="space-y-3">
              {data.low_stock_products && data.low_stock_products.length > 0 ? (
                data.low_stock_products.slice(0, 5).map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 rounded-xl bg-[#181920] border border-white/5 flex items-center justify-between hover:border-white/20 transition-all"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-white leading-snug line-clamp-1">
                        {prod.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        SKU: {prod.sku} • Min: {prod.min_stock}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded bg-amber-500/15 text-amber-400 font-bold font-mono text-xs border border-amber-500/30">
                        Sisa: {prod.stock}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-zinc-500">
                  <span className="material-symbols-outlined text-3xl text-emerald-400 mb-1 block">
                    check_circle
                  </span>
                  Semua stok produk berada di level aman.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setCurrentView('restock')}
            className="w-full mt-6 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">local_shipping</span>
            <span>Buat Order Kulakan Restock</span>
          </button>
        </div>
      </div>
    </div>
  );
}
