import React, { useState, useEffect, useMemo } from 'react';
import { X, Send, Sparkles, CheckCircle2, User, Building, Briefcase, Layers, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';
import { submitContribution } from '../../utils/api';
import { matchKbliKbji } from '../../utils/smartMatcher';

export default function ContributeModal({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Pencacah Lapangan (PCL)');
  const [occtle, setOcctle] = useState('');
  const [occmtd, setOccmtd] = useState('');
  const [bidang, setBidang] = useState('');
  const [kbliCode, setKbliCode] = useState('');
  const [kbliLabel, setKbliLabel] = useState('');
  const [kbjiCode, setKbjiCode] = useState('');
  const [kbjiLabel, setKbjiLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto prediction as user types
  const predictions = useMemo(() => {
    if (!occtle.trim() && !occmtd.trim() && !bidang.trim()) return null;
    return matchKbliKbji({ occtle, occmtd, bidang });
  }, [occtle, occmtd, bidang]);

  // Auto-fill suggested codes if empty
  const applyPrediction = (recKbli, recKbji) => {
    if (recKbli) {
      setKbliCode(recKbli.code);
      setKbliLabel(recKbli.title);
    }
    if (recKbji) {
      setKbjiCode(recKbji.code);
      setKbjiLabel(recKbji.title);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!occtle.trim() || !occmtd.trim() || !bidang.trim()) {
      setErrorMsg('Harap lengkapi seluruh rincian kuesioner (R.10.2, R.10.3, dan R.10.4).');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // If code was not manually picked, use top prediction
      const finalKbliCode = kbliCode || predictions?.kbliRecommendations[0]?.code || '00000';
      const finalKbliLabel = kbliLabel || predictions?.kbliRecommendations[0]?.title || 'Belum Terklasifikasi';
      const finalKbjiCode = kbjiCode || predictions?.kbjiRecommendations[0]?.code || '0000';
      const finalKbjiLabel = kbjiLabel || predictions?.kbjiRecommendations[0]?.title || 'Belum Terklasifikasi';

      await submitContribution({
        contributor_name: name.trim() || 'Petugas / Responden Lapangan',
        contributor_role: role,
        occtle: occtle.trim(),
        occmtd: occmtd.trim(),
        bidang: bidang.trim(),
        kbli_code: finalKbliCode,
        kbli_label: finalKbliLabel,
        kbji_code: finalKbjiCode,
        kbji_label: finalKbjiLabel
      });

      setSubmitted(true);
      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch {}

      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengirim data kontribusi.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setName('');
    setOcctle('');
    setOccmtd('');
    setBidang('');
    setKbliCode('');
    setKbliLabel('');
    setKbjiCode('');
    setKbjiLabel('');
    setSubmitted(false);
    setErrorMsg('');
    onClose();
  };

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
        maxWidth: '720px',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-kbli">
                <Sparkles size={13} /> Crowdsourcing Data Survei
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '2px' }}>
              Formulir Kontribusi Data Lapangan Baru
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Data yang Anda ajukan akan diverifikasi oleh Admin BPS Minsel sebelum diterbitkan ke Bank Data.
            </p>
          </div>
          <button onClick={handleResetForm} className="btn btn-secondary btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: '#10b981'
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px' }}>
                Kontribusi Berhasil Dikirim!
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 20px' }}>
                Terima kasih atas kontribusi Anda. Data telah masuk ke antrean verifikasi Admin BPS Kabupaten Minahasa Selatan dengan status <span className="badge badge-medium">PENDING</span>.
              </p>
              <button onClick={handleResetForm} className="btn btn-primary">
                Tutup & Selesai
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Contributor Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">
                    <User size={14} color="#0284c7" /> Nama Anda / Petugas
                  </label>
                  <input
                    type="text"
                    className="text-input"
                    placeholder="Contoh: Budi Santoso / Tim PCL Minsel"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">
                    <Building size={14} color="#0284c7" /> Peran / Jabatan
                  </label>
                  <select className="select-input" value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="Pencacah Lapangan (PCL)">Pencacah Lapangan (PCL)</option>
                    <option value="Pengawas Lapangan (PML)">Pengawas Lapangan (PML)</option>
                    <option value="Operator Pengolahan">Operator Pengolahan</option>
                    <option value="Responden / Publik">Responden / Publik</option>
                  </select>
                </div>
              </div>

              {/* R.10.2 OCCTLE */}
              <div className="input-group">
                <label className="input-label">
                  <FileText size={14} color="#0284c7" />
                  <strong>R.10.2 MJJ_OCCTLE:</strong> Apa yang dikerjakan di tempat kerja pada pekerjaan utama?
                </label>
                <input
                  type="text"
                  className="text-input"
                  placeholder="Contoh: Buruh petik cengkeh di kebun milik orang lain..."
                  value={occtle}
                  onChange={(e) => setOcctle(e.target.value)}
                  required
                />
              </div>

              {/* R.10.3 OCCMTD */}
              <div className="input-group">
                <label className="input-label">
                  <Layers size={14} color="#10b981" />
                  <strong>R.10.3 MJJ_OCCMTD:</strong> Komoditas utama yang diproduksi/dihasilkan/dijual/dilayani?
                </label>
                <input
                  type="text"
                  className="text-input"
                  placeholder="Contoh: Bunga cengkeh kering / Jasa panen..."
                  value={occmtd}
                  onChange={(e) => setOccmtd(e.target.value)}
                  required
                />
              </div>

              {/* R.10.4 BIDANG */}
              <div className="input-group">
                <label className="input-label">
                  <Briefcase size={14} color="#f59e0b" />
                  <strong>R.10.4 MJJ_BIDANG:</strong> Bergerak di bidang apakah usaha/tempat bekerja?
                </label>
                <input
                  type="text"
                  className="text-input"
                  placeholder="Contoh: Perkebunan cengkeh rakyat..."
                  value={bidang}
                  onChange={(e) => setBidang(e.target.value)}
                  required
                />
              </div>

              {/* Live AI Recommendation Preview */}
              {predictions && (predictions.kbliRecommendations[0] || predictions.kbjiRecommendations[0]) && (
                <div style={{
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  border: '1px solid var(--border-card)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Sparkles size={14} /> Rekomendasi Kode Otomatis:
                    </div>
                    <button
                      type="button"
                      onClick={() => applyPrediction(predictions.kbliRecommendations[0], predictions.kbjiRecommendations[0])}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                    >
                      Gunakan Kode Rekomendasi Ini
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem' }}>
                    <div>
                      <span className="badge badge-kbli">KBLI [{predictions.kbliRecommendations[0]?.code}]</span>
                      <div style={{ fontWeight: 600, marginTop: '2px' }}>{predictions.kbliRecommendations[0]?.title}</div>
                    </div>
                    <div>
                      <span className="badge badge-kbji">KBJI [{predictions.kbjiRecommendations[0]?.code}]</span>
                      <div style={{ fontWeight: 600, marginTop: '2px' }}>{predictions.kbjiRecommendations[0]?.title}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Manual Code Override */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Kode KBLI 5-Digit (Opsional/Otomatis)</label>
                  <input
                    type="text"
                    className="text-input font-mono"
                    placeholder="Contoh: 01282"
                    value={kbliCode}
                    onChange={(e) => setKbliCode(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Kode KBJI 4-Digit (Opsional/Otomatis)</label>
                  <input
                    type="text"
                    className="text-input font-mono"
                    placeholder="Contoh: 9211"
                    value={kbjiCode}
                    onChange={(e) => setKbjiCode(e.target.value)}
                  />
                </div>
              </div>

              {errorMsg && (
                <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', color: '#dc2626', fontSize: '0.82rem' }}>
                  {errorMsg}
                </div>
              )}

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={handleResetForm} className="btn btn-secondary">
                  Batal
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  <Send size={15} /> {loading ? 'Mengirim...' : 'Kirim Kontribusi Data'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
