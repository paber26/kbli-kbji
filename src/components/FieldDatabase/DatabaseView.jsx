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
  RotateCcw,
  User,
  HelpCircle,
  FileQuestion
} from 'lucide-react';
import confetti from 'canvas-confetti';
import CaseDetailModal from './CaseDetailModal';
import { 
  fetchAdminContributions, 
  approveContribution, 
  rejectContribution, 
  proposeEditContribution, 
  proposeDeleteContribution, 
  fetchStats 
} from '../../utils/api';

export default function DatabaseView({ liveCases, onDataUpdated, onOpenAddModal }) {
  const [activeSubTab, setActiveSubTab] = useState('APPROVED'); // 'APPROVED' | 'PENDING' | 'REJECTED' | 'ALL'
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Proposal Modals
  const [editProposalItem, setEditProposalItem] = useState(null);
  const [deleteProposalItem, setDeleteProposalItem] = useState(null);
  const [proposerName, setProposerName] = useState('');
  const [proposerNotes, setProposerNotes] = useState('');
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);

  // Admin Reject Modal
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const [dbList, setDbList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });
  const pageSize = 15;

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

  // Submit Public Edit Proposal
  const handleSubmitEditProposal = async (e) => {
    e.preventDefault();
    if (!editProposalItem) return;

    setIsSubmittingProposal(true);
    try {
      await proposeEditContribution({
        target_case_id: editProposalItem.db_id,
        contributor_name: proposerName.trim() || 'Pengusul Lapangan',
        occtle: editProposalItem.mjj.occtle,
        occmtd: editProposalItem.mjj.occmtd,
        bidang: editProposalItem.mjj.bidang,
        kbli_code: editProposalItem.mjj.kbli_code,
        kbli_label: editProposalItem.mjj.kbli_label,
        kbji_code: editProposalItem.mjj.kbji_code,
        kbji_label: editProposalItem.mjj.kbji_label,
        notes: proposerNotes.trim()
      });

      alert('Usulan perbaikan data berhasil dikirim! Perubahan akan ditinjau dan disetujui terlebih dahulu oleh Admin BPS.');
      setEditProposalItem(null);
      setProposerName('');
      setProposerNotes('');
      await loadData();
      if (onDataUpdated) onDataUpdated();
    } catch (err) {
      alert(err.message || 'Gagal mengirim usulan perbaikan.');
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  // Submit Public Delete Proposal
  const handleSubmitDeleteProposal = async (e) => {
    e.preventDefault();
    if (!deleteProposalItem) return;

    setIsSubmittingProposal(true);
    try {
      await proposeDeleteContribution({
        target_case_id: deleteProposalItem.db_id,
        contributor_name: proposerName.trim() || 'Pengusul Lapangan',
        reason: proposerNotes.trim() || 'Data tidak sesuai atau duplikasi'
      });

      alert('Permohonan penghapusan data telah diajukan dan menunggu persetujuan Admin BPS.');
      setDeleteProposalItem(null);
      setProposerName('');
      setProposerNotes('');
      await loadData();
      if (onDataUpdated) onDataUpdated();
    } catch (err) {
      alert(err.message || 'Gagal mengirim permohonan penghapusan.');
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  // Admin Approve Action (executes CREATE / UPDATE / DELETE)
  const handleAdminApprove = async (item) => {
    try {
      await approveContribution(item.db_id, { reviewed_by: 'Admin BPS Minsel' });
      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      } catch {}
      await loadData();
      if (onDataUpdated) onDataUpdated();
    } catch (err) {
      alert(err.message || 'Gagal menyetujui usulan.');
    }
  };

  // Admin Reject Action
  const handleAdminReject = async (e) => {
    e.preventDefault();
    if (!rejectingItem) return;

    try {
      await rejectContribution(rejectingItem.db_id, rejectReason || 'Usulan tidak disetujui oleh admin.');
      setRejectingItem(null);
      setRejectReason('');
      await loadData();
      if (onDataUpdated) onDataUpdated();
    } catch (err) {
      alert(err.message || 'Gagal menolak usulan.');
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
              Pusat Data Lapangan & Verifikasi Kode
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={onOpenAddModal}
              className="btn btn-primary"
              style={{ fontSize: '0.84rem', padding: '7px 14px', background: '#10b981' }}
            >
              <PlusCircle size={15} /> + Ajukan Kasus Baru
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
            <AlertCircle size={16} /> Usulan Ditolak ({stats.rejected || 0})
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
          <div style={{ position: 'relative' }}>
            <Search size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="text-input"
              style={{ paddingLeft: '38px', fontSize: '0.88rem' }}
              placeholder="Cari uraian (misal: warung, kelapa, ojek), komoditas, kode..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <select
              className="select-input"
              value={sectorFilter}
              onChange={(e) => { setSectorFilter(e.target.value); setCurrentPage(1); }}
              style={{ flex: 1 }}
            >
              <option value="ALL">🌐 Semua Sektor Lapangan Usaha</option>
              <option value="01">🌾 Sektor Pertanian, Perkebunan & Peternakan (01)</option>
              <option value="03">🐟 Sektor Perikanan & Kelautan (03)</option>
              <option value="10">🏭 Sektor Industri Pengolahan Makanan (10)</option>
              <option value="47">🛒 Sektor Perdagangan Eceran / Warung Sembako (47)</option>
              <option value="49">🛵 Sektor Transportasi Darat / Ojek (49)</option>
              <option value="56">🍲 Sektor Penyediaan Makanan & Minuman / Warung Makan (56)</option>
            </select>

            {sectorFilter !== 'ALL' && (
              <button
                onClick={() => setSectorFilter('ALL')}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '8px 12px', whiteSpace: 'nowrap' }}
                title="Tampilkan Semua Sektor"
              >
                ✕ Reset Sektor
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="glass-card" style={{ padding: '0px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>
            {activeSubTab === 'PENDING' ? 'Antrean Usulan Menunggu Persetujuan Admin' : `Menampilkan ${filteredCases.length} Data Kasus`}
          </div>
          {loading && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Memuat data...</span>}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-card)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, width: '130px' }}>ID & Jenis Usulan</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Uraian Lapangan Responden</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, width: '220px' }}>KBLI 2025 (5-Digit)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, width: '220px' }}>KBJI 2014 (4-Digit)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center', width: '150px' }}>Aksi</th>
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
                    {/* ID & Type */}
                    <td style={{ padding: '14px 16px' }}>
                      <div className="font-mono" style={{ fontWeight: 800, color: '#0284c7', fontSize: '0.83rem' }}>
                        {row.id}
                      </div>

                      {/* Action Type Badge */}
                      {row.action_type === 'CREATE' && (
                        <span className="badge badge-high" style={{ fontSize: '0.65rem', marginTop: '4px' }}>
                          + Usulan Baru
                        </span>
                      )}
                      {row.action_type === 'UPDATE' && (
                        <span className="badge badge-medium" style={{ fontSize: '0.65rem', marginTop: '4px' }}>
                          ✎ Usulan Edit
                        </span>
                      )}
                      {row.action_type === 'DELETE' && (
                        <span className="badge badge-low" style={{ fontSize: '0.65rem', marginTop: '4px' }}>
                          ✕ Permohonan Hapus
                        </span>
                      )}
                    </td>

                    {/* Uraian */}
                    <td style={{ padding: '14px 16px', maxWidth: '360px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '3px' }}>
                        {row.mjj.occtle}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <span style={{ fontWeight: 600 }}>Komoditas:</span> {row.mjj.occmtd} • <span style={{ fontWeight: 600 }}>Tempat:</span> {row.mjj.bidang}
                      </div>
                      
                      {row.proposer_notes && (
                        <div style={{ fontSize: '0.74rem', color: '#0284c7', marginTop: '4px', fontStyle: 'italic' }}>
                          Catatan Pengusul: "{row.proposer_notes}"
                        </div>
                      )}
                      {row.admin_notes && (
                        <div style={{ fontSize: '0.74rem', color: '#dc2626', marginTop: '4px', fontStyle: 'italic' }}>
                          Catatan Admin: "{row.admin_notes}"
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
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
                              onClick={() => handleAdminApprove(row)}
                              className="btn btn-success"
                              style={{ fontSize: '0.76rem', padding: '5px 10px' }}
                              title="Setujui Usulan"
                            >
                              <Check size={14} /> Setujui
                            </button>
                            <button
                              onClick={() => { setRejectingItem(row); setRejectReason(''); }}
                              className="btn btn-secondary btn-icon"
                              style={{ width: '30px', height: '30px', color: '#dc2626' }}
                              title="Tolak Usulan"
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
                              title="Lihat Detail"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => {
                                setEditProposalItem(JSON.parse(JSON.stringify(row)));
                                setProposerName('');
                                setProposerNotes('');
                              }}
                              className="btn btn-secondary btn-icon"
                              style={{ width: '32px', height: '32px' }}
                              title="Ajukan Perbaikan (Edit)"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteProposalItem(row);
                                setProposerName('');
                                setProposerNotes('');
                              }}
                              className="btn btn-secondary btn-icon"
                              style={{ width: '32px', height: '32px', color: '#dc2626' }}
                              title="Ajukan Permohonan Hapus"
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
                  <td colSpan={5} style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ maxWidth: '420px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <Search size={32} style={{ opacity: 0.3 }} />
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                        {searchQuery ? `Tidak ada data '${searchQuery}' pada filter ini.` : 'Tidak ada data dalam kategori ini.'}
                      </div>
                      {sectorFilter !== 'ALL' && (
                        <div style={{ fontSize: '0.82rem' }}>
                          Pencarian Anda saat ini dibatasi oleh pilihan sektor.
                          <div style={{ marginTop: '8px' }}>
                            <button
                              onClick={() => setSectorFilter('ALL')}
                              className="btn btn-primary"
                              style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                            >
                              🌐 Cari di Semua Sektor Lapangan Usaha
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
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

      {/* Public Edit Proposal Modal */}
      {editProposalItem && (
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span className="badge badge-kbli"><Edit3 size={13} /> Ajukan Usulan Perbaikan</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              Usulan Edit Data: {editProposalItem.id}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Perubahan yang Anda ajukan akan masuk ke antrean moderasi dan ditinjau oleh Admin BPS sebelum diterapkan.
            </p>

            <form onSubmit={handleSubmitEditProposal} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="input-group">
                  <label className="input-label">Nama Anda / Petugas</label>
                  <input
                    type="text"
                    className="text-input"
                    placeholder="Contoh: Budi (PCL)"
                    value={proposerName}
                    onChange={(e) => setProposerName(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Alasan / Catatan Perbaikan</label>
                  <input
                    type="text"
                    className="text-input"
                    placeholder="Contoh: Kode KBLI perlu disesuaikan..."
                    value={proposerNotes}
                    onChange={(e) => setProposerNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">R.10.2 Uraian Pekerjaan</label>
                <input
                  type="text"
                  className="text-input"
                  value={editProposalItem.mjj.occtle}
                  onChange={(e) => setEditProposalItem({
                    ...editProposalItem,
                    mjj: { ...editProposalItem.mjj, occtle: e.target.value }
                  })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">R.10.3 Uraian Komoditas</label>
                <input
                  type="text"
                  className="text-input"
                  value={editProposalItem.mjj.occmtd}
                  onChange={(e) => setEditProposalItem({
                    ...editProposalItem,
                    mjj: { ...editProposalItem.mjj, occmtd: e.target.value }
                  })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">R.10.4 Lapangan Usaha (Bidang)</label>
                <input
                  type="text"
                  className="text-input"
                  value={editProposalItem.mjj.bidang}
                  onChange={(e) => setEditProposalItem({
                    ...editProposalItem,
                    mjj: { ...editProposalItem.mjj, bidang: e.target.value }
                  })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                <div className="input-group">
                  <label className="input-label">Kode KBLI 2025</label>
                  <input
                    type="text"
                    className="text-input font-mono"
                    value={editProposalItem.mjj.kbli_code}
                    onChange={(e) => setEditProposalItem({
                      ...editProposalItem,
                      mjj: { ...editProposalItem.mjj, kbli_code: e.target.value }
                    })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Label KBLI</label>
                  <input
                    type="text"
                    className="text-input"
                    value={editProposalItem.mjj.kbli_label}
                    onChange={(e) => setEditProposalItem({
                      ...editProposalItem,
                      mjj: { ...editProposalItem.mjj, kbli_label: e.target.value }
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
                    value={editProposalItem.mjj.kbji_code}
                    onChange={(e) => setEditProposalItem({
                      ...editProposalItem,
                      mjj: { ...editProposalItem.mjj, kbji_code: e.target.value }
                    })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Label KBJI</label>
                  <input
                    type="text"
                    className="text-input"
                    value={editProposalItem.mjj.kbji_label}
                    onChange={(e) => setEditProposalItem({
                      ...editProposalItem,
                      mjj: { ...editProposalItem.mjj, kbji_label: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setEditProposalItem(null)} className="btn btn-secondary">
                  Batal
                </button>
                <button type="submit" disabled={isSubmittingProposal} className="btn btn-primary">
                  <Check size={14} /> {isSubmittingProposal ? 'Mengirim...' : 'Kirim Usulan Edit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Public Delete Proposal Modal */}
      {deleteProposalItem && (
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span className="badge badge-low"><Trash2 size={13} /> Permohonan Hapus Data</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#dc2626' }}>
              Ajukan Hapus Kasus: {deleteProposalItem.id}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Data: "{deleteProposalItem.mjj.occtle}" ({deleteProposalItem.mjj.occmtd})
              <br />
              Permohonan ini akan masuk ke antrean moderasi dan tidak langsung menghapus data sampai disetujui oleh Admin BPS.
            </p>

            <form onSubmit={handleSubmitDeleteProposal} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label className="input-label">Nama Anda / Petugas</label>
                <input
                  type="text"
                  className="text-input"
                  placeholder="Contoh: Andi (PML Minsel)"
                  value={proposerName}
                  onChange={(e) => setProposerName(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Alasan Permohonan Penghapusan</label>
                <textarea
                  className="textarea-input"
                  placeholder="Contoh: Data ganda dengan CASE-012 atau komoditas tidak valid..."
                  value={proposerNotes}
                  onChange={(e) => setProposerNotes(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setDeleteProposalItem(null)} className="btn btn-secondary">
                  Batal
                </button>
                <button type="submit" disabled={isSubmittingProposal} className="btn btn-primary" style={{ background: '#dc2626' }}>
                  {isSubmittingProposal ? 'Mengirim...' : 'Kirim Permohonan Hapus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Reject Confirmation Modal */}
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
              Tolak Usulan: {rejectingItem.id}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Berikan alasan penolakan untuk catatan verifikasi.
            </p>

            <form onSubmit={handleAdminReject} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label className="input-label">Alasan Penolakan Admin</label>
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
