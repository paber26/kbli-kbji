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

          {/* Pekerjaan Tambahan (sjj) & (mpk) */}
          {(sjj || mpk) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {sjj && (
                <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '14px', border: '1px solid var(--border-card)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#10b981', marginBottom: '8px' }}>
                    2. Pekerjaan Tambahan (SJJ)
                  </div>
                  <div style={{ fontSize: '0.8rem' }}><strong>Uraian:</strong> {sjj.occtle}</div>
                  <div style={{ fontSize: '0.8rem' }}><strong>Komoditas:</strong> {sjj.occmtd}</div>
                  <div style={{ fontSize: '0.8rem' }}><strong>Bidang:</strong> {sjj.bidang}</div>
                  <div style={{ marginTop: '6px', fontSize: '0.75rem' }}>
                    <span className="badge badge-kbli font-mono">KBLI: {sjj.kbli_code}</span>
                    <span className="badge badge-kbji font-mono" style={{ marginLeft: '4px' }}>KBJI: {sjj.kbji_code}</span>
                  </div>
                </div>
              )}

              {mpk && (
                <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '14px', border: '1px solid var(--border-card)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f59e0b', marginBottom: '8px' }}>
                    3. Pekerjaan Sebelumnya (MPK)
                  </div>
                  <div style={{ fontSize: '0.8rem' }}><strong>Uraian:</strong> {mpk.occtle}</div>
                  <div style={{ fontSize: '0.8rem' }}><strong>Komoditas:</strong> {mpk.occmtd}</div>
                  <div style={{ fontSize: '0.8rem' }}><strong>Bidang:</strong> {mpk.bidang}</div>
                  <div style={{ marginTop: '6px', fontSize: '0.75rem' }}>
                    <span className="badge badge-kbli font-mono">KBLI: {mpk.kbli_code}</span>
                    <span className="badge badge-kbji font-mono" style={{ marginLeft: '4px' }}>KBJI: {mpk.kbji_code}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Variasi Kalimat Responden Serupa */}
          {record.sample_count > 1 && record.variants && record.variants.length > 0 && (
            <div style={{
              background: 'rgba(2, 132, 199, 0.05)',
              border: '1px solid rgba(2, 132, 199, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '14px'
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0284c7', marginBottom: '8px' }}>
                📝 Variasi Kalimat Responden Serupa di Lapangan ({record.sample_count} Sampel):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {record.variants.map((v, idx) => (
                  <div key={idx} style={{
                    fontSize: '0.78rem',
                    background: 'var(--bg-card-solid)',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <strong style={{ color: '#0284c7' }}>Pekerjaan:</strong> "{v.occtle}" • <strong style={{ color: '#10b981' }}>Komoditas:</strong> "{v.occmtd}" • <strong style={{ color: '#f59e0b' }}>Bidang:</strong> "{v.bidang}"
                  </div>
                ))}
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
