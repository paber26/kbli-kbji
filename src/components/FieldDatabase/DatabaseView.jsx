import React, { useState, useMemo, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Check, 
  X, 
  Edit3, 
  Trash2, 
  PlusCircle, 
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import CaseDetailModal from './CaseDetailModal';
import { 
  fetchAdminContributions, 
  approveContribution, 
  rejectContribution, 
  deleteContribution, 
  fetchStats 
} from '../../utils/api';

export default function DatabaseView({ liveCases, onDataUpdated, onOpenAddModal }) {
  const [activeSubTab, setActiveSubTab] = useState('APPROVED'); // 'APPROVED' | 'PENDING' | 'REJECTED' | 'ALL'
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const [dbList, setDbList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });
  const pageSize = 15;

  // Load items from API based on active sub tab
  const loadData = async () => {
    setLoading(true);
    try {
      const [list, statData] = await Promise.all([
        fetchAdminContributions(activeSubTab),
        fetchStats()
      ]);
      setDbList(list);
      setStats(statData);
    } catch (err) {
      console.warn('Fallback to liveCases:', err);
      setDbList(liveCases || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeSubTab]);

  // Filtered cases by search query & sector
  const filteredCases = useMemo(() => {
    let list = dbList;

    if (sectorFilter !== 'ALL') {
      list = list.filter(c => c.mjj.kbli_category?.code === sectorFilter || (c.mjj.kbli_code && c.mjj.kbli_code.startsWith(sectorFilter)));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(c => 
        c.id.toLowerCase().includes(q) ||
        (c.contributor_name && c.contributor_name.toLowerCase().includes(q)) ||
        c.mjj.occtle.toLowerCase().includes(q) ||
        c.mjj.occmtd.toLowerCase().includes(q) ||
        c.mjj.bidang.toLowerCase().includes(q) ||
        c.mjj.kbli_code.includes(q) ||
        c.mjj.kbli_label.toLowerCase().includes(q) ||
        c.mjj.kbji_code.includes(q) ||
        c.mjj.kbji_label.toLowerCase().includes(q)
      );
    }

    return list;
  }, [dbList, searchQuery, sectorFilter]);

  const totalPages = Math.ceil(filteredCases.length / pageSize) || 1;
  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCases.slice(start, start + pageSize);
  }, [filteredCases, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Actions
  const handleQuickApprove = async (item) => {
    try {
      await approveContribution(item.db_id, { reviewed_by: 'Admin BPS Minsel' });
      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      } catch {}
      await loadData();
      if (onDataUpdated) onDataUpdated();
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
      if (onDataUpdated) onDataUpdated();
    } catch (err) {
      alert(err.message || 'Gagal menyimpan perubahan.');
    }
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectingItem) return;

    try {
      await rejectContribution(rejectingItem.db_id, rejectReason || 'Uraian tidak memenuhi standar klasifikasi BPS.');
      setRejectingItem(null);
      setRejectReason('');
      await loadData();
      if (onDataUpdated) onDataUpdated();
    } catch (err) {
      alert(err.message || 'Gagal menolak data.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus data ini secara permanen dari database?')) return;
    try {
      await deleteContribution(id);
      await loadData();
      if (onDataUpdated) onDataUpdated();
    } catch (err) {
      alert(err.message || 'Gagal menghapus data.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner & Tab Controls */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-kbli">
                <Database size={13} /> Bank Data & Konfirmasi
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                BPS Kabupaten Minahasa Selatan (Prov 71, Kab 05)
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              Pusat Data Lapangan & Verifikasi Koding
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={onOpenAddModal}
              className="btn btn-primary"
              style={{ fontSize: '0.84rem', padding: '7px 14px', background: '#10b981' }}
            >
              <PlusCircle size={15} /> + Tambah Kasus Baru
            </button>
            <button onClick={loadData} className="btn btn-secondary" style={{ fontSize: '0.84rem', padding: '7px 12px' }}>
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Sub-Tabs: Approved vs Pending vs Rejected */}
        <div style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-card)',
          paddingBottom: '12px',
          marginBottom: '16px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => { setActiveSubTab('APPROVED'); setCurrentPage(1); }}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeSubTab === 'APPROVED' ? '#0284c7' : 'var(--bg-subtle)',
              color: activeSubTab === 'APPROVED' ? '#ffffff' : 'var(--text-main)',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <CheckCircle2 size={16} /> Data Terverifikasi ({stats.approved || 0})
          </button>

          <button
            onClick={() => { setActiveSubTab('PENDING'); setCurrentPage(1); }}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: activeSubTab === 'PENDING' ? '1px solid #f59e0b' : 'none',
              background: activeSubTab === 'PENDING' ? '#f59e0b' : 'var(--bg-subtle)',
              color: activeSubTab === 'PENDING' ? '#ffffff' : (stats.pending > 0 ? '#d97706' : 'var(--text-main)'),
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Clock size={16} /> Menunggu Konfirmasi ({stats.pending || 0})
          </button>

          <button
            onClick={() => { setActiveSubTab('REJECTED'); setCurrentPage(1); }}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeSubTab === 'REJECTED' ? '#ef4444' : 'var(--bg-subtle)',
              color: activeSubTab === 'REJECTED' ? '#ffffff' : 'var(--text-main)',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <AlertCircle size={16} /> Ditolak ({stats.rejected || 0})
          </button>

          <button
            onClick={() => { setActiveSubTab('ALL'); setCurrentPage(1); }}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeSubTab === 'ALL' ? 'var(--text-main)' : 'var(--bg-subtle)',
              color: activeSubTab === 'ALL' ? 'var(--bg-main)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.86rem',
              cursor: 'pointer'
            }}
          >
            Semua ({stats.total || 0})
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="text-input"
              style={{ paddingLeft: '38px', fontSize: '0.88rem' }}
              placeholder="Cari uraian, komoditas, tempat kerja, kode..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>

          {/* Sector Filter */}
          <select
            className="select-input"
            value={sectorFilter}
            onChange={(e) => { setSectorFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="ALL">Semua Sektor Lapangan Usaha</option>
            <option value="01">Sektor Pertanian, Perkebunan & Peternakan (01)</option>
            <option value="03">Sektor Perikanan & Kelautan (03)</option>
            <option value="10">Sektor Industri Pengolahan Makanan (10)</option>
            <option value="47">Sektor Perdagangan Eceran / Warung (47)</option>
            <option value="49">Sektor Transportasi Darat / Ojek (49)</option>
            <option value="56">Sektor Penyediaan Makanan & Minuman (56)</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="glass-card" style={{ padding: '0px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>
            Menampilkan {filteredCases.length} Data Kasus
          </div>
          {loading && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Memuat data...</span>}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-card)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, width: '110px' }}>ID Kasus</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Uraian Lapangan Responden</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, width: '220px' }}>KBLI 2025 (5-Digit)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, width: '220px' }}>KBJI 2014 (4-Digit)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center', width: '140px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCases.length > 0 ? (
                paginatedCases.map((row) => (
                  <tr 
                    key={row.db_id || row.id}
                    style={{ 
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* ID & Status */}
                    <td style={{ padding: '14px 16px' }}>
                      <div className="font-mono" style={{ fontWeight: 800, color: '#0284c7', fontSize: '0.85rem' }}>
                        {row.id}
                      </div>
                      <span className={`badge ${row.status === 'APPROVED' ? 'badge-high' : row.status === 'PENDING' ? 'badge-medium' : 'badge-low'}`} style={{ fontSize: '0.66rem', marginTop: '4px' }}>
                        {row.status}
                      </span>
                    </td>

                    {/* Uraian */}
                    <td style={{ padding: '14px 16px', maxWidth: '360px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '3px' }}>
                        {row.mjj.occtle}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <span style={{ fontWeight: 600 }}>Komoditas:</span> {row.mjj.occmtd} • <span style={{ fontWeight: 600 }}>Tempat:</span> {row.mjj.bidang}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {row.sample_count > 1 && (
                          <span className="badge badge-medium" style={{ fontSize: '0.66rem' }}>
                            x{row.sample_count} Sampel Serupa
                          </span>
                        )}
                        {row.contributor_name && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            Oleh: {row.contributor_name}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* KBLI */}
                    <td style={{ padding: '14px 16px' }}>
                      <span className="badge badge-kbli font-mono">
                        {row.mjj.kbli_code}
                      </span>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, marginTop: '3px' }}>
                        {row.mjj.kbli_label}
                      </div>
                    </td>

                    {/* KBJI */}
                    <td style={{ padding: '14px 16px' }}>
                      <span className="badge badge-kbji font-mono">
                        {row.mjj.kbji_code}
                      </span>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, marginTop: '3px' }}>
                        {row.mjj.kbji_label}
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        {row.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => handleQuickApprove(row)}
                              className="btn btn-success"
                              style={{ fontSize: '0.76rem', padding: '5px 10px' }}
                              title="Setujui dan Publikasikan"
                            >
                              <Check size={14} /> Setujui
                            </button>
                            <button
                              onClick={() => setEditingItem(JSON.parse(JSON.stringify(row)))}
                              className="btn btn-secondary btn-icon"
                              style={{ width: '30px', height: '30px' }}
                              title="Edit"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => { setRejectingItem(row); setRejectReason(''); }}
                              className="btn btn-secondary btn-icon"
                              style={{ width: '30px', height: '30px', color: '#dc2626' }}
                              title="Tolak"
                            >
                              <X size={13} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setSelectedRecord(row)}
                              className="btn btn-secondary btn-icon"
                              style={{ width: '32px', height: '32px' }}
                              title="Lihat Rincian Lengkap"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => setEditingItem(JSON.parse(JSON.stringify(row)))}
                              className="btn btn-secondary btn-icon"
                              style={{ width: '32px', height: '32px' }}
                              title="Edit Data"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(row.db_id)}
                              className="btn btn-secondary btn-icon"
                              style={{ width: '32px', height: '32px', color: '#dc2626' }}
                              title="Hapus"
                            >
                              <Trash2 size={14} />
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
                    Tidak ada data kasus yang cocok dengan pencarian atau filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Halaman {currentPage} dari {totalPages} ({filteredCases.length} total kasus)
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn btn-secondary btn-icon"
              style={{ width: '32px', height: '32px' }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="btn btn-secondary btn-icon"
              style={{ width: '32px', height: '32px' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Case Detail Modal */}
      <CaseDetailModal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        record={selectedRecord}
      />

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
            maxWidth: '640px',
            width: '100%',
            backgroundColor: 'var(--bg-card-solid)',
            padding: '24px',
            borderRadius: 'var(--radius-xl)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '4px' }}>
              Edit Data Kasus: {editingItem.id}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Perbaiki uraian atau kode KBLI/KBJI yang sesuai.
            </p>

            <form onSubmit={handleSaveEditAndApprove} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label className="input-label">R.10.2 Uraian Pekerjaan</label>
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
                <label className="input-label">R.10.3 Uraian Komoditas</label>
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
                <label className="input-label">R.10.4 Lapangan Usaha (Bidang)</label>
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
                  <label className="input-label">Kode KBLI 2025</label>
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
                  <label className="input-label">Kode KBJI 2014</label>
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
                  <Check size={14} /> Simpan Perubahan
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
            maxWidth: '500px',
            width: '100%',
            backgroundColor: 'var(--bg-card-solid)',
            padding: '24px',
            borderRadius: 'var(--radius-xl)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '4px', color: '#dc2626' }}>
              Tolak Data: {rejectingItem.id}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Berikan alasan penolakan untuk catatan verifikasi.
            </p>

            <form onSubmit={handleConfirmReject} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label className="input-label">Alasan Penolakan</label>
                <textarea
                  className="textarea-input"
                  placeholder="Contoh: Uraian pekerjaan kurang spesifik..."
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
