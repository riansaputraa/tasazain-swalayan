import React from 'react';

export default function Sidebar({ currentView, setCurrentView, user, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: 'dashboard', roles: ['admin', 'kasir'] },
    { id: 'pos', label: 'Kasir POS', icon: 'point_of_sale', roles: ['admin', 'kasir'] },
    { id: 'products', label: 'Katalog & Stok Produk', icon: 'inventory_2', roles: ['admin'] },
    { id: 'restock', label: 'Kulakan & Biaya', icon: 'local_shipping', roles: ['admin'] },
    { id: 'finance', label: 'Laporan Keuangan', icon: 'query_stats', roles: ['admin'] },
    { id: 'users', label: 'Kelola Pengguna', icon: 'group', roles: ['admin'] },
  ];

  const visibleNav = navItems.filter(item => !user || item.roles.includes(user.role || 'admin'));

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-[#0d0e12] border-r border-white/10 z-50 flex flex-col justify-between select-none">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Tasazain Logo"
              className="w-9 h-9 rounded-lg object-contain shadow-sm drop-shadow"
            />
            <div className="flex flex-col">
              <span className="font-bold text-white text-[15px] tracking-tight">Tasazain Swalayan</span>
              <span className="text-[11px] text-zinc-400 font-medium">Enterprise Retail POS</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1 p-3 mt-1">
          {visibleNav.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all text-left ${
                  isActive
                    ? 'bg-white/15 text-white border border-white/15 shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Info & Logout Footer */}
      <div className="p-3 border-t border-white/10 bg-[#0d0e12]">
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/15 flex items-center justify-center text-white font-bold text-xs uppercase">
                {user?.name ? user.name.slice(0, 2) : 'AD'}
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0d0e12]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white leading-tight">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                {user?.role === 'admin' ? 'Store Manager' : 'Kasir Toko'}
              </span>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Keluar / Logout"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
