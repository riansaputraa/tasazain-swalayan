import React from 'react';

export default function Sidebar({
  currentView,
  setCurrentView,
  user,
  onLogout,
  mobileOpen = false,
  onCloseMobile,
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: 'dashboard', roles: ['admin', 'kasir'] },
    { id: 'pos', label: 'Kasir POS', icon: 'point_of_sale', roles: ['admin', 'kasir'] },
    { id: 'products', label: 'Katalog & Stok Produk', icon: 'inventory_2', roles: ['admin'] },
    { id: 'restock', label: 'Kulakan & Biaya', icon: 'local_shipping', roles: ['admin'] },
    { id: 'finance', label: 'Laporan Keuangan', icon: 'query_stats', roles: ['admin'] },
    { id: 'users', label: 'Kelola Pengguna', icon: 'group', roles: ['admin'] },
  ];

  const visibleNav = navItems.filter((item) => !user || item.roles.includes(user.role || 'admin'));

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed left-0 top-0 h-[100dvh] w-[270px] bg-[#0d0e12] border-r border-white/10 z-50 flex flex-col select-none transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[20px]">storefront</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-[15px] tracking-tight">Tasazain Swalayan</span>
              <span className="text-[11px] text-zinc-400 font-medium">Enterprise Retail POS</span>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Tutup Menu"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* User Profile & Logout - Langsung Terlihat di Atas */}
        <div className="p-3 border-b border-white/10 bg-[#141519]/60 shrink-0">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#181920] border border-white/10 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/20 flex items-center justify-center text-white font-bold text-xs uppercase shadow-inner">
                  {user?.name ? user.name.slice(0, 2) : 'AD'}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-zinc-400 ring-2 ring-[#181920]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white leading-tight truncate">
                  {user?.name || 'Administrator'}
                </span>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold mt-0.5">
                  {user?.role === 'admin' ? 'Store Manager' : 'Kasir Toko'}
                </span>
              </div>
            </div>

            {/* Tombol Logout Jelas & Mudah Ditekan */}
            <button
              type="button"
              onClick={onLogout}
              title="Keluar / Logout Akun"
              className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all cursor-pointer shrink-0 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[19px]">logout</span>
            </button>
          </div>
        </div>

        {/* Navigation Links - Scrollable */}
        <nav className="flex-1 overflow-y-auto flex flex-col gap-1 p-3">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-3 py-1">
            Menu Operasional
          </span>
          {visibleNav.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-white text-black shadow-md font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-black' : 'text-zinc-400'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
