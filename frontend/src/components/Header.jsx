import React, { useState, useEffect } from 'react';

export default function Header({ currentView, setCurrentView, lowStockCount = 0, onOpenNewSale }) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      };
      setTimeStr(now.toLocaleDateString('id-ID', options) + ' WIB');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const viewTitles = {
    dashboard: 'Ikhtisar Toko & Ringkasan Finansial',
    pos: 'Terminal Kasir POS Swalayan',
    products: 'Inventori & Manajemen Katalog Produk',
    restock: 'Restock Kulakan Supplier & Biaya Toko',
    finance: 'Buku Kas & Laporan Finansial Toko',
    users: 'Hak Akses & Manajemen Akun',
  };

  return (
    <header className="fixed top-0 left-[260px] right-0 h-16 bg-[#0d0e12]/95 backdrop-blur-md border-b border-white/10 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          Enterprise Retail POS
        </span>
        <span className="text-zinc-600 text-xs">/</span>
        <span className="text-sm font-semibold text-white tracking-tight">
          {viewTitles[currentView] || 'Sistem Operasional Retail'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Real-time Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141519] border border-white/10 text-zinc-300 text-xs font-mono">
          <span className="material-symbols-outlined text-[15px] text-zinc-400">schedule</span>
          <span>{timeStr || 'Memuat waktu...'}</span>
        </div>

        {/* Low Stock Notification Badge */}
        <button
          onClick={() => setCurrentView('products')}
          title={lowStockCount > 0 ? `${lowStockCount} Produk Hampir Habis!` : 'Stok Aman'}
          className="relative p-2 rounded-lg bg-[#141519] hover:bg-[#21222b] text-zinc-300 hover:text-white border border-white/10 transition-colors"
        >
          <span className="material-symbols-outlined text-[19px]">notifications</span>
          {lowStockCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-amber-500 text-black text-[10px] font-extrabold rounded-full flex items-center justify-center border border-zinc-900 shadow-sm animate-pulse">
              {lowStockCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
