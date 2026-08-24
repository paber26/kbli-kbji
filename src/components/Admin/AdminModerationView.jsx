import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Check, 
  X, 
  Edit3, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  RotateCcw,
  Search,
  Filter,
  LogOut
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  adminLogin, 
  fetchAdminContributions, 
  approveContribution, 
  rejectContribution, 
  deleteContribution,
  fetchStats 
} from '../../utils/api';

export default function AdminModerationView({ onCaseApproved }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('bps_admin_auth') === 'true';
  });
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  const [contributions, setContributions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('PENDING'); // 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });

  // Modals for editing or rejecting
  const [editingItem, setEditingItem] = useState(null);
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [list, statData] = await Promise.all([
        fetchAdminContributions(statusFilter),
        fetchStats()
      ]);
      setContributions(list);
      setStats(statData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      await adminLogin(pin);
      setIsAuthenticated(true);
      localStorage.setItem('bps_admin_auth', 'true');
    } catch (err) {
      setLoginError(err.message || 'PIN Admin salah.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('bps_admin_auth');
    setPin('');
  };

  const handleQuickApprove = async (item) => {
    try {
      await approveContribution(item.db_id, {
        reviewed_by: 'Admin BPS Minsel'
      });
      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      } catch {}
      await loadData();
      if (onCaseApproved) onCaseApproved();
    } catch (err) {
      alert(err.message || 'Gagal menyetujui data.');
    }
  };

  const handleSaveEditAndApprove = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      await approveContribution(editingItem.db_id, {
        occtle: editingItem.mjj.occtle,
        occmtd: editingItem.mjj.occmtd,
        bidang: editingItem.mjj.bidang,
        kbli_code: editingItem.mjj.kbli_code,
        kbli_label: editingItem.mjj.kbli_label,
        kbji_code: editingItem.mjj.kbji_code,
        kbji_label: editingItem.mjj.kbji_label,
        reviewed_by: 'Admin BPS Minsel'
      });
      setEditingItem(null);
      await loadData();
      if (onCaseApproved) onCaseApproved();
    } catch (err) {
      alert(err.message || 'Gagal menyimpan perubahan.');
    }
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectingItem) return;

    try {
      await rejectContribution(rejectingItem.db_id, rejectReason || 'Uraian tidak memenuhi kaidah klasifikasi BPS.');
      setRejectingItem(null);
      setRejectReason('');
      await loadData();
    } catch (err) {
      alert(err.message || 'Gagal menolak data.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini secara permanen?')) return;
    try {
      await deleteContribution(id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Gagal menghapus data.');
    }
  };

  // Filtered by search query
  const displayedItems = contributions.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      item.id.toLowerCase().includes(q) ||
      item.contributor_name.toLowerCase().includes(q) ||
      item.mjj.occtle.toLowerCase().includes(q) ||
      item.mjj.occmtd.toLowerCase().includes(q) ||
      item.mjj.bidang.toLowerCase().includes(q) ||
      item.mjj.kbli_code.includes(q) ||
      item.mjj.kbji_code.includes(q)
    );
  });

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '440px', margin: '60px auto', padding: '0 16px' }}>
        <div className="glass-card" style={{ padding: '36px 28px', textAlign: 'center' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(2, 132, 199, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#0284c7'
          }}>
            <Lock size={26} />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>
            Login Verifikator Admin BPS
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Masukkan PIN Admin untuk memverifikasi dan menyetujui kontribusi data survei KBLI & KBJI.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group">
              <input
                type="password"
                className="text-input"
                placeholder="Masukkan PIN Admin (Default: bps7105)..."
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                style={{ textAlign: 'center', fontSize: '1.1rem', letterSpacing: '0.1em' }}
                autoFocus
              />
            </div>

            {loginError && (
              <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.12)', color: '#dc2626', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
                {loginError}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <Unlock size={16} /> Masuk ke Panel Moderasi
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-kbli">
                <ShieldCheck size={13} /> Panel Moderasi & Verifikasi Admin
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                BPS Kabupaten Minahasa Selatan
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              Konfirmasi & Verifikasi Kontribusi Lapangan
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={loadData} className="btn btn-secondary" style={{ fontSize: '0.82rem' }}>
              <RotateCcw size={14} /> Refresh Data
            </button>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ fontSize: '0.82rem', color: '#dc2626' }}>
              <LogOut size={14} /> Keluar Admin
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginTop: '20px'
        }}>
          {/* Pending */}
          <div 
            onClick={() => setStatusFilter('PENDING')}
            style={{
              background: statusFilter === 'PENDING' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-subtle)',
              border: `1px solid ${statusFilter === 'PENDING' ? '#f59e0b' : 'var(--border-card)'}`,
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d97706', marginBottom: '4px' }}>
              <Clock size={16} />
              <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase' }}>Menunggu Verifikasi</span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {stats.pending || 0}
            </div>
          </div>

          {/* Approved */}
          <div 
            onClick={() => setStatusFilter('APPROVED')}
            style={{
              background: statusFilter === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-subtle)',
              border: `1px solid ${statusFilter === 'APPROVED' ? '#10b981' : 'var(--border-card)'}`,
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', marginBottom: '4px' }}>
              <CheckCircle2 size={16} />
              <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase' }}>Disetujui (Live)</span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {stats.approved || 0}
            </div>
          </div>

          {/* Rejected */}
          <div 
            onClick={() => setStatusFilter('REJECTED')}
            style={{
              background: statusFilter === 'REJECTED' ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-subtle)',
              border: `1px solid ${statusFilter === 'REJECTED' ? '#ef4444' : 'var(--border-card)'}`,
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', marginBottom: '4px' }}>
              <AlertCircle size={16} />
              <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase' }}>Ditolak</span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {stats.rejected || 0}
            </div>
          </div>

          {/* All */}
          <div 
            onClick={() => setStatusFilter('ALL')}
            style={{
              background: statusFilter === 'ALL' ? 'var(--bg-card-hover)' : 'var(--bg-subtle)',
              border: `1px solid ${statusFilter === 'ALL' ? 'var(--border-focus)' : 'var(--border-card)'}`,
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Total Semua Data
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {stats.total || 0}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ marginTop: '16px', position: 'relative' }}>
          <Search size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="text-input"
            style={{ paddingLeft: '38px', fontSize: '0.88rem' }}
            placeholder="Cari nama kontributor, uraian pekerjaan, komoditas, kode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Moderation Items List */}
      <div className="glass-card" style={{ padding: '0px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
            Daftar Kontribusi ({statusFilter}): {displayedItems.length} Data
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-card)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 14px', fontWeight: 700, width: '110px' }}>ID & Status</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Kontributor</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Uraian Lapangan (R.10.2 - R.10.4)</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Usulan KBLI & KBJI</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'center', width: '180px' }}>Aksi Moderasi</th>
              </tr>
            </thead>
            <tbody>
              {displayedItems.length > 0 ? (
                displayedItems.map((row) => (
                  <tr key={row.db_id || row.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    {/* ID & Status */}
                    <td style={{ padding: '14px 14px' }}>
                      <div className="font-mono" style={{ fontWeight: 800, fontSize: '0.8rem', color: '#0284c7', marginBottom: '4px' }}>
                        {row.id}
                      </div>
                      <span className={`badge ${row.status === 'APPROVED' ? 'badge-high' : row.status === 'PENDING' ? 'badge-medium' : 'badge-low'}`}>
                        {row.status}
                      </span>
                    </td>

                    {/* Contributor */}
                    <td style={{ padding: '14px 14px', maxWidth: '160px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        {row.contributor_name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {row.contributor_role}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '2px' }}>
                        {row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID') : '-'}
                      </div>
                    </td>

                    {/* Uraian */}
                    <td style={{ padding: '14px 14px', maxWidth: '320px' }}>
                      <div><strong style={{ color: '#0284c7' }}>R.10.2:</strong> {row.mjj.occtle}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <strong style={{ color: '#10b981' }}>R.10.3:</strong> {row.mjj.occmtd}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <strong style={{ color: '#f59e0b' }}>R.10.4:</strong> {row.mjj.bidang}
                      </div>
                      {row.admin_notes && (
                        <div style={{ fontSize: '0.73rem', color: '#dc2626', fontStyle: 'italic', marginTop: '4px' }}>
                          Catatan: "{row.admin_notes}"
                        </div>
                      )}
                    </td>

                    {/* Codes */}
                    <td style={{ padding: '14px 14px', maxWidth: '240px' }}>
                      <div style={{ marginBottom: '4px' }}>
                        <span className="badge badge-kbli font-mono">KBLI {row.mjj.kbli_code}</span>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, marginTop: '2px' }}>{row.mjj.kbli_label}</div>
                      </div>
                      <div>
                        <span className="badge badge-kbji font-mono">KBJI {row.mjj.kbji_code}</span>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, marginTop: '2px' }}>{row.mjj.kbji_label}</div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {row.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleQuickApprove(row)}
                              className="btn btn-success"
                              style={{ fontSize: '0.76rem', padding: '6px 10px' }}
                              title="Setujui & Publikasikan"
                            >
                              <Check size={14} /> Setujui
                            </button>
                            <button
                              onClick={() => setEditingItem(JSON.parse(JSON.stringify(row)))}
                              className="btn btn-secondary btn-icon"
                              style={{ width: '30px', height: '30px' }}
                              title="Edit & Setujui"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => { setRejectingItem(row); setRejectReason(''); }}
                              className="btn btn-secondary btn-icon"
                              style={{ width: '30px', height: '30px', color: '#dc2626' }}
                              title="Tolak"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                        {row.status === 'APPROVED' && (
                          <>
                            <button
                              onClick={() => setEditingItem(JSON.parse(JSON.stringify(row)))}
                              className="btn btn-secondary"
                              style={{ fontSize: '0.76rem', padding: '5px 10px' }}
                            >
                              <Edit3 size={13} /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(row.db_id)}
                              className="btn btn-secondary btn-icon"
                              style={{ width: '30px', height: '30px', color: '#dc2626' }}
                              title="Hapus"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                        {row.status === 'REJECTED' && (
                          <>
                            <button
                              onClick={() => handleQuickApprove(row)}
                              className="btn btn-secondary"
                              style={{ fontSize: '0.76rem', padding: '5px 10px' }}
                            >
                              <RotateCcw size={13} /> Pulihkan & Setujui
                            </button>
                            <button
                              onClick={() => handleDelete(row.db_id)}
                              className="btn btn-secondary btn-icon"
                              style={{ width: '30px', height: '30px', color: '#dc2626' }}
                              title="Hapus"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Tidak ada data kontribusi dalam status ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit & Approve Modal */}
      {editingItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(6px)',
          padding: '20px'
        }}>
          <div className="glass-card animate-fade-in" style={{
            maxWidth: '680px',
            width: '100%',
            backgroundColor: 'var(--bg-card-solid)',
            padding: '24px',
            borderRadius: 'var(--radius-xl)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '4px' }}>
              Revisi & Setujui Kasus: {editingItem.id}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Perbaiki uraian atau tentukan kode KBLI & KBJI yang tepat sebelum diterbitkan.
            </p>

            <form onSubmit={handleSaveEditAndApprove} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label className="input-label">R.10.2 Uraian Pekerjaan (occtle)</label>
                <input
                  type="text"
                  className="text-input"
                  value={editingItem.mjj.occtle}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    mjj: { ...editingItem.mjj, occtle: e.target.value }
                  })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">R.10.3 Uraian Komoditas (occmtd)</label>
                <input
                  type="text"
                  className="text-input"
                  value={editingItem.mjj.occmtd}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    mjj: { ...editingItem.mjj, occmtd: e.target.value }
                  })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">R.10.4 Lapangan Usaha (bidang)</label>
                <input
                  type="text"
                  className="text-input"
                  value={editingItem.mjj.bidang}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    mjj: { ...editingItem.mjj, bidang: e.target.value }
                  })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                <div className="input-group">
                  <label className="input-label">Kode KBLI (5 Digit)</label>
                  <input
                    type="text"
                    className="text-input font-mono"
                    value={editingItem.mjj.kbli_code}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      mjj: { ...editingItem.mjj, kbli_code: e.target.value }
                    })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Label KBLI</label>
                  <input
                    type="text"
                    className="text-input"
                    value={editingItem.mjj.kbli_label}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      mjj: { ...editingItem.mjj, kbli_label: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                <div className="input-group">
                  <label className="input-label">Kode KBJI (4 Digit)</label>
                  <input
                    type="text"
                    className="text-input font-mono"
                    value={editingItem.mjj.kbji_code}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      mjj: { ...editingItem.mjj, kbji_code: e.target.value }
                    })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Label KBJI</label>
                  <input
                    type="text"
                    className="text-input"
                    value={editingItem.mjj.kbji_label}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      mjj: { ...editingItem.mjj, kbji_label: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setEditingItem(null)} className="btn btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn btn-success">
                  <Check size={14} /> Simpan Perubahan & Setujui
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(6px)',
          padding: '20px'
        }}>
          <div className="glass-card animate-fade-in" style={{
            maxWidth: '520px',
            width: '100%',
            backgroundColor: 'var(--bg-card-solid)',
            padding: '24px',
            borderRadius: 'var(--radius-xl)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '4px', color: '#dc2626' }}>
              Tolak Kontribusi Data: {rejectingItem.id}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Berikan alasan penolakan agar tercatat di log verifikasi admin.
            </p>

            <form onSubmit={handleConfirmReject} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label className="input-label">Alasan Penolakan</label>
                <textarea
                  className="textarea-input"
                  placeholder="Contoh: Uraian pekerjaan terlalu umum / komoditas tidak jelas..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setRejectingItem(null)} className="btn btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#dc2626' }}>
                  Konfirmasi Tolak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
