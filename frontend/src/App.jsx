import React, { useState, useEffect } from 'react';
import { api, getStoredUser, setAuthToken, setStoredUser, getAuthToken } from './services/api';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import PosCashierView from './views/PosCashierView';
import ProductsView from './views/ProductsView';
import RestockView from './views/RestockView';
import FinanceReportView from './views/FinanceReportView';
import UsersView from './views/UsersView';

export default function App() {
  const [user, setUser] = useState(getStoredUser());
  const [currentView, setCurrentView] = useState('dashboard');
  const [lowStockCount, setLowStockCount] = useState(0);

  // Check auth and fetch low stock count
  const checkInitialStatus = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await api.getLowStockProducts();
      setLowStockCount(res?.length || 0);
    } catch (err) {
      console.error('Error fetching low stock status:', err);
    }
  };

  useEffect(() => {
    if (user) {
      checkInitialStatus();
    }

    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [user]);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setCurrentView(loggedInUser.role === 'kasir' ? 'pos' : 'dashboard');
    checkInitialStatus();
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
  };

  // If unauthenticated, show luxury login view
  if (!user) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex">
      {/* Executive Sidebar */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="pl-[260px] min-h-screen flex-1 flex flex-col bg-[#0a0a0c]">
        {/* Executive Header */}
        <Header
          currentView={currentView}
          setCurrentView={setCurrentView}
          lowStockCount={lowStockCount}
          onOpenNewSale={() => setCurrentView('pos')}
        />

        {/* Dynamic Page Views */}
        <main className="w-full pt-20 px-6 pb-8 flex-1">
          {currentView === 'dashboard' && <DashboardView setCurrentView={setCurrentView} />}
          {currentView === 'pos' && <PosCashierView user={user} />}
          {currentView === 'products' && <ProductsView />}
          {currentView === 'restock' && <RestockView />}
          {currentView === 'finance' && <FinanceReportView />}
          {currentView === 'users' && <UsersView />}
        </main>
      </div>
    </div>
  );
}
