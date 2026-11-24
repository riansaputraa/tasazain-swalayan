import React, { useState, useEffect } from 'react';
import { api, getStoredUser, setStoredUser } from '../services/api';

export default function UsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const currentUser = getStoredUser();

  // Modal Tambah / Edit User
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null = mode tambah, object user = mode edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'kasir',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers();
      setUsers(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const totalAdmins = users.filter((u) => u.role === 'admin').length;
  const totalKasirs = users.filter((u) => u.role === 'kasir').length;

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'kasir',
    });
    setErrorMsg('');
    setShowPassword(false);
    setShowModal(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
    setErrorMsg('');
    setShowPassword(false);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      if (editingUser) {
        // Mode Edit Pengguna
        const payload = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };
        if (formData.password.trim()) {
          payload.password = formData.password.trim();
        }

        const updated = await api.updateUser(editingUser.id, payload);

        // Jika mengedit akun yang sedang login, update cache lokal & kirim event
        if (currentUser && currentUser.id === editingUser.id) {
          const updatedUser = {
            ...currentUser,
            name: updated.name,
            email: updated.email,
            role: updated.role,
          };
          setStoredUser(updatedUser);
          window.dispatchEvent(new CustomEvent('user:updated'));
        }
      } else {
        // Mode Tambah Pengguna Baru
        await api.createUser(formData);
      }

      setShowModal(false);
      await loadUsers();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menyimpan data pengguna.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.id === currentUser?.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif login.');
      return;
    }

    if (user.role === 'admin' && totalAdmins <= 1) {
      alert('Tidak dapat menghapus admin terakhir. Sistem Tasazain harus memiliki minimal 1 akun Administrator.');
      return;
    }

    if (!confirm(`Yakin ingin menghapus akun "${user.name}" (${user.email})?`)) {
      return;
    }

    try {
      await api.deleteUser(user.id);
      await loadUsers();
    } catch (err) {
      alert(err.message || 'Gagal menghapus pengguna.');
    }
  };

  // Apakah role akun yang sedang diedit adalah admin satu-satunya
  const isOnlyAdminEditing = editingUser && editingUser.role === 'admin' && totalAdmins <= 1;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-display">
            Kelola Pengguna & Kasir
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Daftar akun staf kasir dan administrator pengelola sistem retail Tasazain Swalayan
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadUsers}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#141519] hover:bg-[#21222b] text-zinc-300 hover:text-white rounded-xl text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">refresh</span>
            <span>Segarkan</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-bold transition-all border border-white shadow-md shadow-white/5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>+ Tambah Pengguna</span>
          </button>
        </div>
      </div>

      {/* Summary KPI & Protection Notice */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-[#141519] border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-zinc-400">Total Akun Terdaftar</span>
            <div className="text-xl font-bold text-white font-mono mt-1">{users.length} Akun</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">group</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#141519] border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-zinc-400">Administrator (Store Manager)</span>
            <div className="text-xl font-bold text-purple-400 font-mono mt-1">{totalAdmins} Admin</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#141519] border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-zinc-400">Proteksi Akun Sistem</span>
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mt-1">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span>Minimal 1 Admin Terproteksi</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">lock</span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-[#141519] border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[#181920]/60 text-zinc-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Staf / Pengguna</th>
                <th className="py-3.5 px-4">Alamat Email</th>
                <th className="py-3.5 px-4">Hak Akses / Role</th>
                <th className="py-3.5 px-4">Status Akun</th>
                <th className="py-3.5 px-4">Terdaftar Sejak</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-zinc-500">
                    <span className="inline-block w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : !Array.isArray(users) || users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-zinc-500">
                    Belum ada data pengguna
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrent = currentUser && currentUser.id === u.id;
                  const isSoleAdmin = u.role === 'admin' && totalAdmins <= 1;

                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/15 flex items-center justify-center text-white text-xs font-bold uppercase">
                          {u.name.slice(0, 2)}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                                Akun Anda
                              </span>
                            )}
                          </div>
                          {isSoleAdmin && (
                            <span className="text-[10px] text-amber-400/90 font-normal">
                              Admin Utama (Terkunci)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-400">
                        {u.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.role === 'admin'
                              ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                              : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {u.role === 'admin' ? 'Store Manager (Admin)' : 'Staf Kasir'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Aktif
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-400">
                        {new Date(u.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Tombol Edit */}
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            title="Edit Data Pengguna"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[17px]">edit</span>
                          </button>

                          {/* Tombol Hapus */}
                          <button
                            onClick={() => handleDeleteUser(u)}
                            disabled={isCurrent || isSoleAdmin}
                            title={
                              isCurrent
                                ? 'Tidak dapat menghapus akun Anda sendiri yang sedang aktif'
                                : isSoleAdmin
                                ? 'Tidak dapat menghapus admin terakhir (Minimal 1 akun Admin harus ada)'
                                : 'Hapus Pengguna'
                            }
                            className={`p-1.5 rounded-lg transition-colors ${
                              isCurrent || isSoleAdmin
                                ? 'text-zinc-600 cursor-not-allowed opacity-40'
                                : 'text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[17px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH / EDIT PENGGUNA */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141519] border border-white/20 rounded-2xl shadow-2xl p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-white">
                  {editingUser ? 'edit' : 'person_add'}
                </span>
                <h3 className="text-base font-bold text-white">
                  {editingUser ? 'Edit Informasi Pengguna' : 'Tambah Pengguna / Kasir Baru'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#181920] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                  Alamat Email (Untuk Login)
                </label>
                <input
                  type="email"
                  required
                  placeholder="budi@swalayan.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#181920] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                  {editingUser
                    ? 'Password Baru (Kosongkan jika tidak ingin diubah)'
                    : 'Password (Minimal 6 Karakter)'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!editingUser}
                    minLength={editingUser ? undefined : 6}
                    placeholder={editingUser ? 'Biarkan kosong untuk mempertahankan password lama' : '••••••••'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-[#181920] border border-white/10 rounded-xl pl-3 pr-10 py-2 text-xs text-white focus:outline-none focus:border-white/30 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors p-1 flex items-center justify-center cursor-pointer"
                    title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                  Hak Akses / Peran (Role)
                </label>
                <select
                  required
                  value={formData.role}
                  disabled={isOnlyAdminEditing}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className={`w-full bg-[#181920] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30 ${
                    isOnlyAdminEditing ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="kasir">Staf Kasir (Hanya Akses Kasir POS)</option>
                  <option value="admin">Store Manager (Admin - Akses Penuh)</option>
                </select>
                {isOnlyAdminEditing ? (
                  <p className="text-[10px] text-amber-400/90 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">lock</span>
                    Role terkunci sebagai Admin karena merupakan satu-satunya akun Administrator aktif.
                  </p>
                ) : (
                  <p className="text-[10px] text-zinc-500 mt-1">
                    *Staf Kasir hanya bisa melayani POS, sedangkan Store Manager bisa mengelola seluruh laporan dan produk.
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingUser ? 'Simpan Perubahan' : 'Simpan Pengguna'}</span>
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
