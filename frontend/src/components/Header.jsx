import React, { useState, useEffect, useRef } from 'react';

export default function Header({
  currentView,
  setCurrentView,
  lowStockCount = 0,
  lowStockProducts = [],
  onRefreshStock,
  onOpenNewSale,
  onToggleMobileMenu,
}) {
  const [timeStr, setTimeStr] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = {
        weekday: 'short',
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

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleManualRefresh = async () => {
    if (onRefreshStock) {
      setRefreshing(true);
      try {
        await onRefreshStock();
      } finally {
        setTimeout(() => setRefreshing(false), 400);
      }
    }
  };

  const viewTitles = {
    dashboard: 'Ikhtisar Toko & Finansial',
    pos: 'Terminal Kasir POS',
    products: 'Inventori & Katalog',
    restock: 'Restock Kulakan & Biaya',
    finance: 'Laporan Keuangan',
    users: 'Kelola Pengguna',
  };

  return (
    <header className="fixed top-0 left-0 lg:left-[270px] right-0 h-16 bg-[#0d0e12]/95 backdrop-blur-md border-b border-white/10 z-30 px-3 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Menu Button */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 -ml-1 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer shrink-0"
          title="Buka Menu"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <span className="hidden md:inline text-[11px] font-bold uppercase tracking-wider text-zinc-400 whitespace-nowrap">
          Enterprise Retail POS
        </span>
        <span className="hidden md:inline text-zinc-600 text-xs">/</span>
        <span className="text-xs sm:text-sm font-semibold text-white tracking-tight truncate">
          {viewTitles[currentView] || 'Sistem Operasional Retail'}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Real-time Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141519] border border-white/10 text-zinc-300 text-xs font-mono">
          <span className="material-symbols-outlined text-[15px] text-zinc-400">schedule</span>
          <span>{timeStr || 'Memuat waktu...'}</span>
        </div>

        {/* Low Stock Notification Badge & Popover */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              setShowDropdown((prev) => !prev);
              handleManualRefresh();
            }}
            title={lowStockCount > 0 ? `${lowStockCount} Produk Hampir Habis!` : 'Semua Stok Aman'}
            className="relative p-2 rounded-xl bg-[#141519] hover:bg-[#21222b] text-zinc-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[19px]">notifications</span>
            {lowStockCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-white text-black text-[10px] font-extrabold rounded-full flex items-center justify-center border border-zinc-900 shadow-sm">
                {lowStockCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#141519] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#181920]/70">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-zinc-300">notifications</span>
                  <span className="text-xs font-bold text-white">Notifikasi Stok</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleManualRefresh}
                    disabled={refreshing}
                    className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Perbarui data stok"
                  >
                    <span className={`material-symbols-outlined text-base ${refreshing ? 'animate-spin' : ''}`}>
                      refresh
                    </span>
                  </button>
                  <button
                    onClick={() => setShowDropdown(false)}
                    className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-3 max-h-72 overflow-y-auto">
                {lowStockCount === 0 ? (
                  <div className="p-4 text-center flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-xl">check_circle</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Semua Stok Aman</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Tidak ada produk yang menipis atau di bawah stok minimum.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setCurrentView('products');
                        setShowDropdown(false);
                      }}
                      className="mt-2 text-xs text-zinc-300 hover:text-white font-semibold underline underline-offset-2 cursor-pointer"
                    >
                      Buka Katalog Produk
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-200 px-1">
                      <span>{lowStockCount} Produk Menipis</span>
                      <span className="text-[10px] text-zinc-400">Di bawah min. stok</span>
                    </div>
                    <div className="space-y-1.5">
                      {lowStockProducts.map((p) => (
                        <div
                          key={p.id}
                          className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-colors flex items-center justify-between"
                        >
                          <div>
                            <p className="text-xs font-bold text-white line-clamp-1">{p.name}</p>
                            <p className="text-[10px] text-zinc-400">SKU: {p.sku}</p>
                          </div>
                          <div className="text-right">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-zinc-200 border border-white/15">
                              Sisa {p.stock}
                            </span>
                            <span className="block text-[9px] text-zinc-500 mt-0.5">
                              Min: {p.min_stock}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-white/10 flex gap-2">
                      <button
                        onClick={() => {
                          setCurrentView('restock');
                          setShowDropdown(false);
                        }}
                        className="flex-1 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-extrabold rounded-xl transition-all cursor-pointer text-center"
                      >
                        Order Kulakan Baru
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick action button: New Transaction */}
        <button
          type="button"
          onClick={() => {
            setCurrentView('pos');
            if (onOpenNewSale) onOpenNewSale();
          }}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-bold transition-all active:scale-[0.98] border border-white shadow-md shadow-white/5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[17px]">add_shopping_cart</span>
          <span className="hidden sm:inline">+ Transaksi Kasir</span>
          <span className="sm:hidden font-bold">Kasir</span>
        </button>
      </div>
    </header>
  );
}
