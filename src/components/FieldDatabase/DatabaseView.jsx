import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Briefcase, 
  Building,
  CheckCircle2
} from 'lucide-react';
import fieldCases from '../../data/fieldCases.json';
import CaseDetailModal from './CaseDetailModal';

export default function DatabaseView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'HAS_SJJ' | 'HAS_MPK'
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const pageSize = 15;

  // Filtered cases
  const filteredCases = useMemo(() => {
    let list = fieldCases;

    if (statusFilter === 'HAS_SJJ') {
      list = list.filter(c => c.sjj !== null);
    } else if (statusFilter === 'HAS_MPK') {
      list = list.filter(c => c.mpk !== null);
    }

    if (sectorFilter !== 'ALL') {
      list = list.filter(c => c.mjj.kbli_category?.code === sectorFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(c => 
        c.id.toLowerCase().includes(q) ||
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
  }, [searchQuery, statusFilter, sectorFilter]);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header card */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-kbli">
                <Database size={13} /> Bank Data Survei Lapangan
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                BPS Kabupaten Minahasa Selatan (Prov 71, Kab 05)
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              Bank Data Kasus Nyata Survei BPS ({fieldCases.length} Kasus)
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge badge-high" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
              <CheckCircle2 size={14} /> 100% Data Riil Lapangan
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="text-input"
              style={{ paddingLeft: '38px', fontSize: '0.88rem' }}
              placeholder="Cari uraian, komoditas, kode..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>

          {/* Job Status Filter */}
          <select
            className="select-input"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="ALL">Semua Jenis Kasus ({fieldCases.length})</option>
            <option value="HAS_SJJ">Memiliki Pekerjaan Tambahan (34)</option>
            <option value="HAS_MPK">Memiliki Pekerjaan Masa Lalu (42)</option>
          </select>

          {/* Sector Filter */}
          <select
            className="select-input"
            value={sectorFilter}
            onChange={(e) => { setSectorFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="ALL">Semua Sektor KBLI</option>
            <option value="A">Kategori A: Pertanian & Perikanan</option>
            <option value="B">Kategori B: Pertambangan</option>
            <option value="C">Kategori C: Industri Pengolahan (Kopra, dsb)</option>
            <option value="F">Kategori F: Konstruksi</option>
            <option value="G">Kategori G: Perdagangan Eceran</option>
            <option value="H">Kategori H: Transportasi (Ojek, dsb)</option>
            <option value="I">Kategori I: Penyediaan Makanan & Minuman</option>
            <option value="P">Kategori P: Pendidikan</option>
            <option value="S">Kategori S: Jasa Lainnya</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="glass-card" style={{ padding: '0px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-card)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, width: '90px' }}>ID Kasus</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Uraian Lapangan Responden</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Klasifikasi KBLI (5-Digit)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Klasifikasi KBJI (4-Digit)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center', width: '80px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCases.length > 0 ? (
                paginatedCases.map((row) => (
                  <tr 
                    key={row.id}
                    style={{ 
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* ID */}
                    <td style={{ padding: '14px 16px', fontFamily: 'JetBrains Mono', fontWeight: 700, color: '#0284c7' }}>
                      {row.id}
                    </td>

                    {/* Uraian */}
                    <td style={{ padding: '14px 16px', maxWidth: '380px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '3px' }}>
                        {row.mjj.occtle}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <span style={{ fontWeight: 600 }}>Komoditas:</span> {row.mjj.occmtd} • <span style={{ fontWeight: 600 }}>Tempat:</span> {row.mjj.bidang}
                      </div>
                      {(row.sjj || row.mpk) && (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                          {row.sjj && <span className="badge badge-high" style={{ fontSize: '0.65rem' }}>+ Pekerjaan Tambahan</span>}
                          {row.mpk && <span className="badge badge-medium" style={{ fontSize: '0.65rem' }}>+ Modalitas Lalu</span>}
                        </div>
                      )}
                    </td>

                    {/* KBLI */}
                    <td style={{ padding: '14px 16px', maxWidth: '280px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                        <span className="badge badge-kbli font-mono">
                          {row.mjj.kbli_code}
                        </span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: row.mjj.kbli_category?.color }}>
                          Kat {row.mjj.kbli_category?.code}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {row.mjj.kbli_label}
                      </div>
                    </td>

                    {/* KBJI */}
                    <td style={{ padding: '14px 16px', maxWidth: '260px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                        <span className="badge badge-kbji font-mono">
                          {row.mjj.kbji_code}
                        </span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: row.mjj.kbji_major?.color }}>
                          Gol {row.mjj.kbji_major?.code}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {row.mjj.kbji_label}
                      </div>
                    </td>

                    {/* Action */}
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <button
                        onClick={() => setSelectedRecord(row)}
                        className="btn btn-secondary btn-icon"
                        style={{ width: '32px', height: '32px' }}
                        title="Lihat Detail Kasus"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Tidak ada data kasus yang cocok dengan filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Menampilkan {filteredCases.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, filteredCases.length)} dari {filteredCases.length} kasus
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn btn-secondary btn-icon"
              style={{ width: '32px', height: '32px', opacity: currentPage === 1 ? 0.4 : 1 }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, padding: '0 8px' }}>
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="btn btn-secondary btn-icon"
              style={{ width: '32px', height: '32px', opacity: currentPage === totalPages ? 0.4 : 1 }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Case Detail Modal */}
      <CaseDetailModal
        isOpen={selectedRecord !== null}
        onClose={() => setSelectedRecord(null)}
        record={selectedRecord}
      />
    </div>
  );
}
