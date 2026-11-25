import React, { useState, useEffect, useRef } from 'react';
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

  // Modal Capital (Modal Awal) State
  const [showCapitalModal, setShowCapitalModal] = useState(false);
  const [capitalForm, setCapitalForm] = useState({
    amount: '10000000',
    notes: 'Modal Awal Kas Toko (Setoran Usaha)',
    date: new Date().toISOString().slice(0, 10),
  });
  const [savingCapital, setSavingCapital] = useState(false);

  // Modal Print Preview State
  const [showPreviewModal, setShowPreviewModal] = useState(false);

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

  const handleCreateCapital = async (e) => {
    e.preventDefault();
    setSavingCapital(true);
    try {
      await api.setInitialCapital({
        ...capitalForm,
        amount: Number(capitalForm.amount),
      });
      setShowCapitalModal(false);
      await loadReport();
    } catch (err) {
      alert(err.message || 'Gagal mencatat modal awal');
    } finally {
      setSavingCapital(false);
    }
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.error('Print error:', err);
    }
  };

  const renderReportContent = () => {
    const totalIncome = reportData.summary.total_income || 0;
    const totalExpense = reportData.summary.total_expense || 0;
    const netCash = reportData.summary.net_cash || 0;
    const now = new Date();
    const formattedDate = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const formattedTime = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).replace(/\./g, ':');
    const docNumber = `BK-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${String(reportData.cash_flows.length || 0).padStart(3, '0')}`;

    return (
      <>
        {/* KOP RESMI LAPORAN (Garis Ganda Akuntansi) */}
        <div className="print-header">
          <div className="print-header-logo">
            <img src="/logo.png" alt="Logo Tasazain Swalayan" />
            <div className="print-header-company">
              <h1>TASAZAIN SWALAYAN</h1>
              <p>UNIT USAHA RETAIL, GROSIR & TOKO SWALAYAN TERINTEGRASI</p>
              <p>Jl. Rungkut Madya No. 1, Surabaya, Jawa Timur | Telp: (031) 870-0000</p>
            </div>
          </div>
          <div className="print-header-meta">
            <div className="print-meta-card">
              <div className="print-meta-card-title">DOKUMEN KEUANGAN RESMI</div>
              <table className="print-meta-table">
                <tbody>
                  <tr>
                    <td className="lbl">No. Dokumen</td>
                    <td className="sep">:</td>
                    <td className="val font-mono">{docNumber}</td>
                  </tr>
                  <tr>
                    <td className="lbl">Hari, Tanggal</td>
                    <td className="sep">:</td>
                    <td className="val">{formattedDate}</td>
                  </tr>
                  <tr>
                    <td className="lbl">Waktu Cetak</td>
                    <td className="sep">:</td>
                    <td className="val font-mono">{formattedTime} WIB</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* JUDUL UTAMA DOKUMEN LAPORAN */}
        <div className="print-title-banner">
          <h2 className="print-main-title">BUKU KAS & LAPORAN ARUS KAS</h2>
        </div>

        {/* TABEL RINGKASAN REKAPITULASI BUKU KAS */}
        <p className="print-section-label">I. REKAPITULASI SALDO KAS UMUM</p>
        <table className="print-summary-table">
          <thead>
            <tr>
              <th style={{ width: '35px' }} className="text-center">No</th>
              <th>Komponen Rekapitulasi Kas</th>
              <th style={{ width: '200px' }} className="text-right">Jumlah Nominal (IDR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-center font-mono">1</td>
              <td>Total Kas Masuk (Penerimaan Penjualan POS & Modal Usaha)</td>
              <td className="val-cell">{formatRupiah(totalIncome)}</td>
            </tr>
            <tr>
              <td className="text-center font-mono">2</td>
              <td>Total Kas Keluar (Pengeluaran Kulakan Restock & Beban Operasional)</td>
              <td className="val-cell">{formatRupiah(totalExpense)}</td>
            </tr>
            <tr style={{ fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>
              <td className="text-center font-mono">3</td>
              <td>SALDO KAS AKHIR BERSIH (NET CASH)</td>
              <td className="val-cell" style={{ textDecoration: 'underline' }}>{formatRupiah(netCash)}</td>
            </tr>
          </tbody>
        </table>

        {/* TABEL BUKU KAS UMUM RINCIAN TRANSAKSI */}
        <p className="print-section-label">II. BUKU KAS UMUM — RINCIAN SELURUH ARUS KAS</p>
        <table className="print-table">
          <thead>
            <tr>
              <th style={{ width: '30px' }} className="text-center">No</th>
              <th style={{ width: '110px' }} className="text-center">Tanggal & Waktu</th>
              <th style={{ width: '75px' }} className="text-center">No. Ref</th>
              <th>Uraian Keterangan Transaksi</th>
              <th style={{ width: '110px' }} className="text-right">Debit / Masuk (Rp)</th>
              <th style={{ width: '110px' }} className="text-right">Kredit / Keluar (Rp)</th>
              <th style={{ width: '115px' }} className="text-right">Saldo Kas (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {reportData.cash_flows.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center" style={{ padding: '24px', color: '#555' }}>
                  Tidak ada catatan transaksi arus kas pada periode ini.
                </td>
              </tr>
            ) : (
              reportData.cash_flows.map((cf, idx) => {
                const isIncome = cf.type === 'income';
                const d = new Date(cf.created_at || cf.transaction_date);
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':');
                const dateStr = `${day}/${month}/${year} ${time}`;

                return (
                  <tr key={cf.id || idx}>
                    <td className="text-center font-mono" style={{ fontSize: '8.5px' }}>{idx + 1}</td>
                    <td className="text-center font-mono" style={{ fontSize: '8.5px' }}>{dateStr}</td>
                    <td className="text-center font-mono" style={{ fontSize: '8.5px' }}>
                      {cf.source_type === 'capital' ? 'MODAL' : `${cf.source_type?.toUpperCase()} #${cf.source_id}`}
                    </td>
                    <td>{cf.description}</td>
                    <td className={isIncome ? 'text-right font-mono' : 'text-center font-mono'}>
                      {isIncome ? formatRupiah(cf.amount) : '-'}
                    </td>
                    <td className={!isIncome ? 'text-right font-mono' : 'text-center font-mono'}>
                      {!isIncome ? formatRupiah(cf.amount) : '-'}
                    </td>
                    <td className="text-right font-mono" style={{ fontWeight: 'bold' }}>
                      {formatRupiah(cf.balance_after)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="4" className="text-right" style={{ letterSpacing: '0.5px', paddingRight: '12px' }}>
                JUMLAH TOTAL:
              </td>
              <td className="text-right font-mono">
                {formatRupiah(totalIncome)}
              </td>
              <td className="text-right font-mono">
                {formatRupiah(totalExpense)}
              </td>
              <td className="text-right font-mono" style={{ fontSize: '10px' }}>
                {formatRupiah(netCash)}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* PENGESAHAN TANDA TANGAN */}
        <div className="print-footer">
          <div className="print-sign-box">
            <p className="sign-city-date">Diverifikasi oleh:</p>
            <p className="sign-role">Petugas Kasir / Bagian Kas</p>
            <p className="sign-name">( .................................................... )</p>
            <p className="sign-sub">Tanda Tangan & Tanggal</p>
          </div>
          <div className="print-sign-box">
            <p className="sign-city-date">Surabaya, {now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="sign-role">Mengetahui, Pimpinan / Pemilik Toko</p>
            <p className="sign-name">( .................................................... )</p>
            <p className="sign-sub">Tasazain Swalayan Surabaya</p>
          </div>
        </div>

        {/* LEGAL NOTE */}
        <div className="print-legal">
          Dokumen ini merupakan Rekapitulasi Buku Kas & Arus Keuangan resmi yang dicetak secara otomatis melalui Sistem Komputerisasi Kasir Tasazain Swalayan. Segala pencatatan telah diverifikasi sesuai transaksi fisik toko.
        </div>
      </>
    );
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

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowCapitalModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#181920] hover:bg-[#21222b] text-zinc-200 border border-white/10 hover:border-white/20 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px] text-zinc-300">account_balance_wallet</span>
            <span>+ Modal Awal</span>
          </button>

          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#181920] hover:bg-[#21222b] text-zinc-200 border border-white/10 hover:border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px] text-zinc-300">price_change</span>
            <span>+ Biaya Operasional</span>
          </button>

          <button
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-extrabold transition-all border border-white shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">print</span>
            <span>Pratinjau & Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* 3 Executive Finance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Cash In */}
        <div className="p-5 rounded-2xl bg-[#141519] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Kas Masuk (Pemasukan)</span>
            <div className="w-8 h-8 rounded-lg bg-white/10 text-white border border-white/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">south_west</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white font-mono">
              {formatRupiah(reportData.summary.total_income)}
            </div>
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Dari transaksi penjualan kasir & modal
            </span>
          </div>
        </div>

        {/* Total Cash Out */}
        <div className="p-5 rounded-2xl bg-[#141519] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Kas Keluar (Pengeluaran)</span>
            <div className="w-8 h-8 rounded-lg bg-white/10 text-white border border-white/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">north_east</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white font-mono">
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
            <div className="w-8 h-8 rounded-lg bg-white/10 text-white border border-white/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">account_balance</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold font-mono text-white">
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
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141519] border border-white/10 text-zinc-400 hover:text-white text-xs font-semibold cursor-pointer"
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
                <th className="py-3.5 px-4 w-12 text-center">No</th>
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
                  <td colSpan="7" className="py-12 text-center text-zinc-500">
                    <span className="inline-block w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Memuat buku kas...
                  </td>
                </tr>
              ) : reportData.cash_flows.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-zinc-500">
                    Belum ada catatan transaksi arus kas
                  </td>
                </tr>
              ) : (
                reportData.cash_flows.map((cf, idx) => {
                  const isIncome = cf.type === 'income';

                  return (
                    <tr key={cf.id || idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-center font-mono text-zinc-500 text-xs">
                        {idx + 1}
                      </td>
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
                        <span className={`px-2 py-0.5 rounded border ${
                          cf.source_type === 'capital'
                            ? 'bg-white/15 text-white border-white/20 font-bold'
                            : 'bg-white/5 border-white/10'
                        }`}>
                          {cf.source_type === 'capital' ? 'SETORAN MODAL' : `${cf.source_type} #${cf.source_id}`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isIncome
                              ? 'bg-white/15 text-white border border-white/20'
                              : 'bg-zinc-800 text-zinc-300 border border-white/10'
                          }`}
                        >
                          {isIncome ? 'MASUK' : 'KELUAR'}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-mono font-bold ${
                          isIncome ? 'text-white' : 'text-zinc-300'
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
                <span className="material-symbols-outlined text-white">payments</span>
                <h3 className="text-base font-bold text-white">Catat Pengeluaran Operasional</h3>
              </div>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
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
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingExpense}
                  className="flex-1 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {savingExpense ? (
                    <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Simpan Pengeluaran</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SETOR MODAL AWAL TOKO */}
      {showCapitalModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141519] border border-white/20 rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-white">account_balance_wallet</span>
                <h3 className="text-base font-bold text-white">Setor Modal Awal Kas Toko</h3>
              </div>
              <button onClick={() => setShowCapitalModal(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Mencatat uang modal usaha pemilik toko ke buku kas agar saldo awal kas tidak minus saat digunakan untuk belanja kulakan awal atau biaya operasional.
            </p>

            <form onSubmit={handleCreateCapital} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                  Nominal Modal Awal (Rp)
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  value={capitalForm.amount}
                  onChange={(e) => setCapitalForm({ ...capitalForm, amount: e.target.value })}
                  placeholder="10000000"
                  className="w-full bg-[#181920] border border-white/10 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-white/30"
                />

                {/* Quick Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[2000000, 5000000, 10000000, 25000000, 50000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCapitalForm({ ...capitalForm, amount: String(amt) })}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-zinc-300 transition-colors cursor-pointer"
                    >
                      {formatRupiah(amt)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                  Tanggal Setoran Modal
                </label>
                <input
                  type="date"
                  required
                  value={capitalForm.date}
                  onChange={(e) => setCapitalForm({ ...capitalForm, date: e.target.value })}
                  className="w-full bg-[#181920] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                  Keterangan / Sumber Modal
                </label>
                <input
                  type="text"
                  required
                  value={capitalForm.notes}
                  onChange={(e) => setCapitalForm({ ...capitalForm, notes: e.target.value })}
                  placeholder="Contoh: Modal Awal Kas Usaha Pemilik"
                  className="w-full bg-[#181920] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCapitalModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingCapital}
                  className="flex-1 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {savingCapital ? (
                    <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Setor Modal Awal</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PRATINJAU DOKUMEN CETAK LAPORAN */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-[#141519] border border-white/20 rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
            <div className="p-3.5 sm:p-4 border-b border-white/10 bg-[#181920] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[19px]">print</span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white leading-tight truncate">
                    Pratinjau Dokumen Cetak Laporan Keuangan
                  </h3>
                  <p className="text-[11px] text-zinc-400 truncate">
                    Format resmi akuntansi pembukuan kas toko
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-extrabold transition-all shadow-md active:scale-[0.98] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>Cetak / Unduh PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-[#0a0a0c] flex justify-center">
              <div className="w-full max-w-[820px] bg-white text-black p-6 sm:p-10 rounded-xl shadow-2xl overflow-x-auto select-text font-sans">
                {renderReportContent()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          PRINT-ONLY SECTION — Sumber DOM untuk cetak (Ctrl+P / handlePrint)
          ============================================================ */}
      <div className="print-only print-document-container" id="print-report-area">
        {renderReportContent()}
      </div>
    </div>
  );
}
