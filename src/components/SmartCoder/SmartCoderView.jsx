import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  RotateCcw, 
  Layers, 
  FileText, 
  ExternalLink,
  Zap,
  Copy,
  Check
} from 'lucide-react';
import { matchKbliKbji } from '../../utils/smartMatcher';
import RecommendationCard from './RecommendationCard';
import SimilarCasesModal from './SimilarCasesModal';

const PRESET_EXAMPLES = [
  {
    title: '🌾 Pertanian Padi',
    occtle: 'Mencangkul dan mencabut rumput',
    occmtd: 'Padi',
    bidang: 'Pertanian padi di sawah milik sendiri'
  },
  {
    title: '🌴 Panjat Kelapa',
    occtle: 'DI SEWA MEMANJAT KELAPA MILIK ORANG',
    occmtd: 'JASA PANJAT KELAPA',
    bidang: 'JASA PANJAT KELAPA'
  },
  {
    title: '🥣 Bubur Ayam Keliling',
    occtle: 'Menjual bubur ayam keliling',
    occmtd: 'Bubur ayam',
    bidang: 'Penyediaan makanan keliling'
  },
  {
    title: '🎹 Guru Les Piano',
    occtle: 'Mengajar les piano',
    occmtd: 'Jasa pendidikan musik',
    bidang: 'Sekolah musik / les privat'
  },
  {
    title: '🏪 Warung Sembako',
    occtle: 'WARUNG SEMBAKO',
    occmtd: 'KEBUTUHAN POKOK RUMAH TANGGA',
    bidang: 'PEDAGANG ECERAN'
  },
  {
    title: '🥥 Kuli Kopra Biji',
    occtle: 'BURUH KUPAS KELAPA BIJI',
    occmtd: 'KELAPA BIJI',
    bidang: 'PENGOLAHAN KELAPA'
  },
  {
    title: '🐟 Nelayan Ketinting',
    occtle: 'MENCARI IKAN DI LAUT MEMAKAI PERAHU MOTOR KETINTING',
    occmtd: 'IKAN MENTAH SEGAR',
    bidang: 'BURUH NELAYAN (BEKERJA MENANGKAP IKAN)'
  },
  {
    title: '🛵 Ojek Motor / Online',
    occtle: 'Mengemudi ojek motor',
    occmtd: 'Jasa angkutan penumpang',
    bidang: 'Ojek online / angkutan penumpang'
  },
  {
    title: '🧱 Tukang Bangunan',
    occtle: 'Melakukan pekerjaan tukang bangunan',
    occmtd: 'Jasa konstruksi',
    bidang: 'Perusahaan konstruksi / renovasi rumah'
  },
  {
    title: '🏫 Staf TU Sekolah',
    occtle: 'Staf tata usaha administrasi sekolah',
    occmtd: 'Jasa tata usaha pendidikan',
    bidang: 'Administrasi pemerintahan sekolah SMP'
  }
];

export default function SmartCoderView({ liveCases }) {
  const [mode, setMode] = useState('standard'); // 'standard' (3 fields) | 'quick' (1 query)
  const [occtle, setOcctle] = useState('');
  const [occmtd, setOccmtd] = useState('');
  const [bidang, setBidang] = useState('');
  const [quickQuery, setQuickQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  // Compute recommendations
  const results = useMemo(() => {
    if (mode === 'standard') {
      return matchKbliKbji({ occtle, occmtd, bidang, cases: liveCases });
    } else {
      return matchKbliKbji({ query: quickQuery, cases: liveCases });
    }
  }, [mode, occtle, occmtd, bidang, quickQuery, liveCases]);

  const topKbli = results.kbliRecommendations[0];
  const topKbji = results.kbjiRecommendations[0];

  const handleApplyPreset = (preset) => {
    if (mode === 'standard') {
      setOcctle(preset.occtle);
      setOccmtd(preset.occmtd);
      setBidang(preset.bidang);
    } else {
      setQuickQuery(`${preset.occtle} - ${preset.occmtd} - ${preset.bidang}`);
    }
  };

  const handleReset = () => {
    setOcctle('');
    setOccmtd('');
    setBidang('');
    setQuickQuery('');
  };

  const handleCopyAll = () => {
    if (!topKbli || !topKbji) return;
    const textToCopy = `KBLI: [${topKbli.code}] ${topKbli.title}\nKBJI: [${topKbji.code}] ${topKbji.title}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const hasInput = mode === 'standard' 
    ? (occtle.trim() || occmtd.trim() || bidang.trim())
    : quickQuery.trim();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hero Intro Banner */}
      <div className="glass-card" style={{
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(2, 69, 122, 0.08) 0%, rgba(1, 138, 190, 0.12) 100%)',
        borderLeft: '4px solid #0284c7'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-kbli">
                <Search size={13} /> Pencarian & Rekomendasi Kode
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Didukung Data Kasus Lapangan BPS Kabupaten Minahasa Selatan
              </span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '6px' }}>
              Pencarian Kode KBLI 2025 & KBJI 2014
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '750px' }}>
              Ketikkan uraian pekerjaan, komoditas, atau tempat usaha responden. Sistem mencocokkan kode statistik standar BPS berdasarkan kemiripan kata kunci dan data riil survei.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-card-solid)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
            <button
              onClick={() => setMode('standard')}
              className={`btn ${mode === 'standard' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.82rem', padding: '8px 14px' }}
            >
              Form 3 Kolom BPS
            </button>
            <button
              onClick={() => setMode('quick')}
              className={`btn ${mode === 'quick' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.82rem', padding: '8px 14px' }}
            >
              <Zap size={15} /> 1 Kalimat Cepat
            </button>
          </div>
        </div>

        {/* Preset Sample Pills */}
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Contoh Kasus yang Sering Ada:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {PRESET_EXAMPLES.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(preset)}
                style={{
                  fontSize: '0.78rem',
                  padding: '5px 11px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-card)',
                  background: 'var(--bg-card-solid)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0284c7';
                  e.currentTarget.style.background = 'var(--bg-subtle)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-card)';
                  e.currentTarget.style.background = 'var(--bg-card-solid)';
                }}
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '4px',
              background: '#0284c7',
              color: '#ffffff'
            }}>
              BLOK X KETENAGAKERJAAN
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Kuesioner Standar BPS (R.10.2 s/d R.10.4)
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
            Tanyakan jika MJJ_MULT = 1, 2
          </span>
        </div>

        {mode === 'standard' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* 10.2 MJJ_OCCTLE */}
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#0284c7' }}>
                  <FileText size={15} />
                  <span>R.10.2 MJJ_OCCTLE</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 600, marginTop: '2px' }}>
                  Apa yang dikerjakan (NAMA) di tempat kerja pada pekerjaan utama?
                </div>
              </label>
              <input
                type="text"
                className="text-input"
                placeholder="Contoh: Mencangkul dan mencabut rumput / Mengemudi ojek..."
                value={occtle}
                onChange={(e) => setOcctle(e.target.value)}
              />
              <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontStyle: 'italic', background: 'var(--bg-subtle)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
                <strong>Bacakan jika dibutuhkan:</strong> Mencangkul dan mencabut rumput, mengemudi ojek motor, menjual bubur ayam keliling, melakukan pekerjaan tukang bangunan, mengajar les piano, staf tata usaha, dll.
              </div>
            </div>

            {/* 10.3 MJJ_OCCMTD */}
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#10b981' }}>
                  <Layers size={15} />
                  <span>R.10.3 MJJ_OCCMTD</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 600, marginTop: '2px' }}>
                  Apa komoditas utama yang diproduksi/dihasilkan/dijual/dilayani?
                </div>
              </label>
              <input
                type="text"
                className="text-input"
                placeholder="Contoh: Padi / Meja kayu / Jasa angkutan penumpang..."
                value={occmtd}
                onChange={(e) => setOccmtd(e.target.value)}
              />
              <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontStyle: 'italic', background: 'var(--bg-subtle)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
                <strong>Bacakan jika dibutuhkan:</strong> Padi, meja/kursi kayu, jasa angkutan penumpang, jasa pendidikan, jasa pemerintahan, jasa konstruksi, dll.
              </div>
            </div>

            {/* 10.4 MJJ_BIDANG */}
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#f59e0b' }}>
                  <Search size={15} />
                  <span>R.10.4 MJJ_BIDANG</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 600, marginTop: '2px' }}>
                  Bergerak di bidang apakah usaha/perusahaan/kantor tempat bekerja?
                </div>
              </label>
              <input
                type="text"
                className="text-input"
                placeholder="Contoh: Pertanian padi sawah sendiri / Ojek online / Konstruksi..."
                value={bidang}
                onChange={(e) => setBidang(e.target.value)}
              />
              <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontStyle: 'italic', background: 'var(--bg-subtle)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
                <strong>Bacakan jika dibutuhkan:</strong> Pertanian padi di sawah milik sendiri, penyediaan makanan/minuman, ojek online, perusahaan konstruksi, sekolah musik, dll.
              </div>
            </div>
          </div>
        ) : (
          <div className="input-group">
            <label className="input-label">
              <Zap size={16} color="#0284c7" />
              Ketik Kalimat Bebas Uraian Pekerjaan & Lapangan Usaha (Gabungan R.10.2 - R.10.4)
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="text-input"
                placeholder="Contoh: mencangkul padi di sawah milik sendiri / mengemudi ojek motor angkutan penumpang..."
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                style={{ fontSize: '1rem', padding: '14px 18px' }}
              />
            </div>
          </div>
        )}

        {/* Input Actions */}
        {hasInput && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', gap: '10px' }}>
            <button onClick={handleReset} className="btn btn-secondary" style={{ fontSize: '0.82rem' }}>
              <RotateCcw size={15} /> Bersihkan Form
            </button>
          </div>
        )}
      </div>

      {/* Results Section */}
      {hasInput ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Action Header */}
          {topKbli && topKbji && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              padding: '4px 2px'
            }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                🎯 Hasil Rekomendasi Kode Terpilih:
              </div>

              <button
                onClick={handleCopyAll}
                className="btn btn-primary"
                style={{ fontSize: '0.82rem', padding: '7px 14px' }}
              >
                {copiedAll ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedAll ? 'Tersalin!' : 'Salin Pasangan KBLI & KBJI'}</span>
              </button>
            </div>
          )}

          {/* Primary Recommendation Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '20px'
          }}>
            {/* KBLI Primary Card */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                🏢 Klasifikasi Lapangan Usaha (KBLI 2025):
              </div>
              {topKbli ? (
                <RecommendationCard type="kbli" data={topKbli} rank={1} />
              ) : (
                <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Tidak ada kecocokan KBLI yang memadai. Coba perluas uraian kata kunci.
                </div>
              )}
            </div>

            {/* KBJI Primary Card */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                👤 Klasifikasi Jabatan / Profesi (KBJI 2014):
              </div>
              {topKbji ? (
                <RecommendationCard type="kbji" data={topKbji} rank={1} />
              ) : (
                <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Tidak ada kecocokan KBJI yang memadai. Coba perluas uraian kata kunci.
                </div>
              )}
            </div>
          </div>

          {/* Similar Cases Link */}
          {results.similarCases.length > 0 && (
            <div className="glass-card" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(2, 132, 199, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0284c7'
                }}>
                  <Layers size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                    Ditemukan {results.similarCases.length} Kasus Lapangan Serupa di Minsel
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Lihat bagaimana responden survei sebelumnya dengan profil pekerjaan serupa diberi kode klasifikasi oleh BPS.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-secondary"
                style={{ fontSize: '0.84rem' }}
              >
                Lihat Bukti Kasus Serupa <ExternalLink size={14} />
              </button>
            </div>
          )}

          {/* Alternative Candidates */}
          {(results.kbliRecommendations.length > 1 || results.kbjiRecommendations.length > 1) && (
            <div style={{ marginTop: '10px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px' }}>
                Opsi Alternatif Terdekat:
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '16px'
              }}>
                {results.kbliRecommendations.slice(1, 3).map((alt, i) => (
                  <RecommendationCard key={alt.code} type="kbli" data={alt} rank={i + 2} />
                ))}
                {results.kbjiRecommendations.slice(1, 3).map((alt, i) => (
                  <RecommendationCard key={alt.code} type="kbji" data={alt} rank={i + 2} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#0284c7'
          }}>
            <Search size={28} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
            Mulai dengan Mengetikkan Uraian Lapangan
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 20px' }}>
            Pilih salah satu contoh cepat di atas atau isi form uraian kegiatan untuk mendapatkan rekomendasi kode KBLI 2025 & KBJI 2014.
          </p>
        </div>
      )}

      {/* Modal for Similar Cases */}
      <SimilarCasesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cases={results.similarCases}
      />
    </div>
  );
}
