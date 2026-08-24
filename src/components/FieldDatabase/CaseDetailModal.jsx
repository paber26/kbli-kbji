import React from 'react';
import { X, MapPin, Briefcase, Building, Layers, Calendar, CheckCircle2 } from 'lucide-react';

export default function CaseDetailModal({ isOpen, onClose, record }) {
  if (!isOpen || !record) return null;

  const mjj = record.mjj;
  const sjj = record.sjj;
  const mpk = record.mpk;

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
        maxWidth: '750px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-card-solid)',
        boxShadow: 'var(--shadow-xl)',
        borderRadius: 'var(--radius-xl)'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="font-mono" style={{ fontWeight: 800, color: '#0284c7', fontSize: '1.1rem' }}>
                {record.id}
              </span>
              <span className="badge badge-high">Record Terverifikasi BPS</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Provinsi: 71 (Sulawesi Utara) • Kabupaten: 05 (Minahasa Selatan)
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Pekerjaan Utama (mjj) */}
          <div style={{
            background: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px',
            borderLeft: '4px solid #0284c7'
          }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0284c7', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Briefcase size={17} /> 1. PEKERJAAN UTAMA (MJJ)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>URAIAN PEKERJAAN (OCCTLE):</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: '2px' }}>{mjj.occtle || '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>KOMODITAS / PRODUK (OCCMTD):</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '2px' }}>{mjj.occmtd || '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>LAPANGAN USAHA (BIDANG):</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '2px' }}>{mjj.bidang || '-'}</div>
              </div>
            </div>

            {/* Assigned Codes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
              <div style={{ background: 'var(--bg-card-solid)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
                <div className="badge badge-kbli" style={{ marginBottom: '6px' }}>KBLI 5-Digit [{mjj.kbli_code}]</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{mjj.kbli_label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Kategori {mjj.kbli_category?.code}: {mjj.kbli_category?.name}
                </div>
              </div>

              <div style={{ background: 'var(--bg-card-solid)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
                <div className="badge badge-kbji" style={{ marginBottom: '6px' }}>KBJI 4-Digit [{mjj.kbji_code}]</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{mjj.kbji_label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Golongan {mjj.kbji_major?.code}: {mjj.kbji_major?.name}
                </div>
              </div>
            </div>
          </div>

          {/* Pekerjaan Tambahan (sjj) if exists */}
          {sjj && (
            <div style={{
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              borderLeft: '4px solid #10b981'
            }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#059669', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={16} /> 2. PEKERJAAN TAMBAHAN (SJJ)
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {sjj.kbli_code && (
                  <div style={{ background: 'var(--bg-card-solid)', padding: '10px 14px', borderRadius: 'var(--radius-md)', flex: 1 }}>
                    <span className="badge badge-kbli">KBLI [{sjj.kbli_code}]</span>
                    <div style={{ fontWeight: 600, fontSize: '0.84rem', marginTop: '4px' }}>{sjj.kbli_label}</div>
                  </div>
                )}
                {sjj.kbji_code && (
                  <div style={{ background: 'var(--bg-card-solid)', padding: '10px 14px', borderRadius: 'var(--radius-md)', flex: 1 }}>
                    <span className="badge badge-kbji">KBJI [{sjj.kbji_code}]</span>
                    <div style={{ fontWeight: 600, fontSize: '0.84rem', marginTop: '4px' }}>{sjj.kbji_label}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pekerjaan Masa Lalu (mpk) if exists */}
          {mpk && (
            <div style={{
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              borderLeft: '4px solid #f59e0b'
            }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#d97706', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} /> 3. PEKERJAAN MASA LALU / MODALITAS (MPK)
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {mpk.kbli_code && (
                  <div style={{ background: 'var(--bg-card-solid)', padding: '10px 14px', borderRadius: 'var(--radius-md)', flex: 1 }}>
                    <span className="badge badge-kbli">KBLI [{mpk.kbli_code}]</span>
                    <div style={{ fontWeight: 600, fontSize: '0.84rem', marginTop: '4px' }}>{mpk.kbli_label}</div>
                  </div>
                )}
                {mpk.kbji_code && (
                  <div style={{ background: 'var(--bg-card-solid)', padding: '10px 14px', borderRadius: 'var(--radius-md)', flex: 1 }}>
                    <span className="badge badge-kbji">KBJI [{mpk.kbji_code}]</span>
                    <div style={{ fontWeight: 600, fontSize: '0.84rem', marginTop: '4px' }}>{mpk.kbji_label}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-card)', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-primary">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
