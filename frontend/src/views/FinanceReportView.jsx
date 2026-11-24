import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function FinanceReportView() {
  const [reportData, setReportData] = useState({
    summary: {
      total_income: 0,
      total_expense: 0,
      net_cash: 0,
    },
    cash_flows: [],
  });
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(false);

  // Modal Expense State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    category: 'Operasional',
    amount: '',
    notes: '',
  });
  const [savingExpense, setSavingExpense] = useState(false);

  const loadReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType !== 'ALL') {
        params.type = filterType;
      }
      const res = await api.getCashFlowReport(params);
      setReportData(res);
    } catch (err) {
      console.error('Error loading finance report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [filterType]);

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    setSavingExpense(true);
    try {
      await api.createExpense({
        ...expenseForm,
        amount: Number(expenseForm.amount),
        expense_date: new Date().toISOString().slice(0, 10),
      });
      setShowExpenseModal(false);
      setExpenseForm({ description: '', category: 'Operasional', amount: '', notes: '' });
      await loadReport();
    } catch (err) {
      alert(err.message || 'Gagal menyimpan biaya pengeluaran');
    } finally {
      setSavingExpense(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-display">
            Laporan Keuangan & Buku Kas
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Arus kas otomatis terintegrasi langsung dari penjualan POS, kulakan restock, & biaya operasional
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-all"
          >
            <span className="material-symbols-outlined text-[17px]">price_change</span>
            <span>+ Catat Biaya Operasional</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-bold transition-all border border-white"
          >
            <span className="material-symbols-outlined text-[17px]">print</span>
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* 3 Executive Finance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Cash In */}
        <div className="p-5 rounded-2xl bg-[#141519] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Kas Masuk (Pemasukan)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">south_west</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              {formatRupiah(reportData.summary.total_income)}
            </div>
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Dari transaksi penjualan kasir
            </span>
          </div>
        </div>

        {/* Total Cash Out */}
        <div className="p-5 rounded-2xl bg-[#141519] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Kas Keluar (Pengeluaran)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">north_east</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-rose-400 font-mono">
              {formatRupiah(reportData.summary.total_expense)}
            </div>
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Kulakan restock & biaya operasional
            </span>
          </div>
        </div>

        {/* Current Balance */}
        <div className="p-5 rounded-2xl bg-[#141519] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Saldo Kas Toko Saat Ini</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">account_balance</span>
            </div>
          </div>
          <div className="mt-4">
            <div className={`text-2xl font-bold font-mono ${reportData.summary.net_cash >= 0 ? 'text-white' : 'text-rose-400'}`}>
              {formatRupiah(reportData.summary.net_cash)}
            </div>
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Pemasukan dikurangi Pengeluaran
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-[#141519] border border-white/10 rounded-xl p-1">
          {[
            { id: 'ALL', label: 'Semua Transaksi' },
            { id: 'income', label: 'Kas Masuk (+)' },
            { id: 'expense', label: 'Kas Keluar (-)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === tab.id
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={loadReport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141519] border border-white/10 text-zinc-400 hover:text-white text-xs font-semibold"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          <span>Segarkan Buku Kas</span>
        </button>
      </div>

      {/* Cash Flow Ledger Table */}
      <div className="rounded-2xl bg-[#141519] border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[#181920]/60 text-zinc-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Tanggal & Waktu</th>
                <th className="py-3.5 px-4">Deskripsi Transaksi</th>
                <th className="py-3.5 px-4">Sumber / Referensi</th>
                <th className="py-3.5 px-4 text-center">Tipe</th>
                <th className="py-3.5 px-4 text-right">Nominal</th>
                <th className="py-3.5 px-4 text-right">Saldo Kas Berjalan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-zinc-500">
                    <span className="inline-block w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Memuat buku kas...
                  </td>
                </tr>
              ) : reportData.cash_flows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-zinc-500">
                    Belum ada catatan transaksi arus kas
                  </td>
                </tr>
              ) : (
                reportData.cash_flows.map((cf) => {
                  const isIncome = cf.type === 'income';

                  return (
                    <tr key={cf.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-mono text-zinc-400 whitespace-nowrap">
                        {new Date(cf.created_at || cf.transaction_date).toLocaleString('id-ID', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {cf.description}
                      </td>
                      <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                          {cf.source_type} #{cf.source_id}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isIncome
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isIncome ? 'MASUK' : 'KELUAR'}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-mono font-bold ${
                          isIncome ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isIncome ? '+' : '-'} {formatRupiah(cf.amount)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        {formatRupiah(cf.balance_after)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD OPERATIONAL EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141519] border border-white/20 rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-400">payments</span>
                <h3 className="text-base font-bold text-white">Catat Pengeluaran Operasional</h3>
              </div>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                  Kategori Biaya
                </label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full bg-[#181920] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                >
                  <option value="Operasional">Operasional Toko (Listrik/Air/Internet)</option>
                  <option value="Sewa">Sewa Tempat / Bangunan</option>
                  <option value="Gaji">Gaji Karyawan / Bonus</option>
                  <option value="Peralatan">Perawatan & Peralatan Toko</option>
                  <option value="Lainnya">Pengeluaran Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                  Keterangan Pengeluaran
                </label>
                <input
                  type="text"
                  required
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  placeholder="Contoh: Pembayaran Token Listrik PLN"
                  className="w-full bg-[#181920] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                  Jumlah Biaya (Rp)
                </label>
                <input
                  type="number"
                  required
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  placeholder="500000"
                  className="w-full bg-[#181920] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows="2"
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  placeholder="Keterangan bon atau nomor referensi..."
                  className="w-full bg-[#181920] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingExpense}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {savingExpense ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Simpan Pengeluaran</span>
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
