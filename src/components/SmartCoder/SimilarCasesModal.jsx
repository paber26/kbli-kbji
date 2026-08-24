import React from 'react';
import { X, MapPin, Briefcase, Building, Layers, CheckCircle } from 'lucide-react';

export default function SimilarCasesModal({ isOpen, onClose, cases = [] }) {
  if (!isOpen) return null;

  return (
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
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-card-solid)',
        boxShadow: 'var(--shadow-xl)',
        borderRadius: 'var(--radius-xl)'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              Kasus Riil Serupa dari Survei BPS Minsel
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Ditemukan {cases.length} data responden survei dengan uraian kegiatan pekerjaan yang mirip
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-icon"
            style={{ width: '34px', height: '34px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{
          padding: '20px 24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {cases.map((c, idx) => (
            <div key={c.id || idx} style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px'
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono',
                  color: '#0284c7'
                }}>
                  {c.id} • {c.nama_wilayah || 'Kab. Minahasa Selatan'}
                </span>
                <span className="badge badge-high" style={{ fontSize: '0.7rem' }}>
                  {Math.round((c.score || 0.8) * 100)}% Kemiripan
                </span>
              </div>

              {/* Uraian */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '10px',
                marginBottom: '12px',
                fontSize: '0.84rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    URAIAN PEKERJAAN (OCCTLE):
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                    {c.mjj.occtle}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    KOMODITAS / TUGAS (OCCMTD):
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {c.mjj.occmtd}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    TEMPAT USAHA (BIDANG):
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {c.mjj.bidang}
                  </div>
                </div>
              </div>

              {/* Assigned Codes */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                background: 'var(--bg-card-solid)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="badge badge-kbli">KBLI {c.mjj.kbli_code}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    {c.mjj.kbli_label}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="badge badge-kbji">KBJI {c.mjj.kbji_code}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    {c.mjj.kbji_label}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border-card)',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button onClick={onClose} className="btn btn-primary">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
