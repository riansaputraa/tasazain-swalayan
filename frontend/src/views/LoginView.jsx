import React, { useState } from 'react';
import { api } from '../services/api';

export default function LoginView({ onLoginSuccess }) {
  const [email, setEmail] = useState('admin@swalayan.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(email, password);
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa email & password.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@swalayan.com');
      setPassword('password');
    } else {
      setEmail('kasir@swalayan.com');
      setPassword('password');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0c] p-4 text-white">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-[#0a0a0c] to-[#0a0a0c] pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#141519] border border-white/10 rounded-2xl shadow-2xl p-8 backdrop-blur-xl">
        {/* Brand */}
        <div className="flex flex-col items-center text-center mb-8">
          <img
            src="/logo.png"
            alt="Tasazain Logo"
            className="w-16 h-16 rounded-2xl object-contain mb-3 drop-shadow-xl"
          />
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">
            Tasazain Swalayan
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Enterprise Retail Management • Point of Sale
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Email Pengguna
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-lg">
                mail
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@swalayan.com"
                className="w-full bg-[#181920] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
              Kata Sandi
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-lg">
                lock
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#181920] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 bg-white hover:bg-zinc-200 text-black font-bold text-sm rounded-xl transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">login</span>
                <span>Masuk ke Sistem</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Accounts Quick-Select */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold text-center mb-3">
            Pilih Akun Demo Cepat
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDemoCredentials('admin')}
              className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                email === 'admin@swalayan.com'
                  ? 'border-white/40 bg-white/10 text-white'
                  : 'border-white/10 bg-[#181920] text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="font-semibold text-white">Admin Toko</div>
              <div className="text-[10px] text-zinc-400">admin@swalayan.com</div>
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('kasir')}
              className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                email === 'kasir@swalayan.com'
                  ? 'border-white/40 bg-white/10 text-white'
                  : 'border-white/10 bg-[#181920] text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="font-semibold text-white">Kasir Depan</div>
              <div className="text-[10px] text-zinc-400">kasir@swalayan.com</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
