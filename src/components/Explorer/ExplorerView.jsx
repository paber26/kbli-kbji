import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Copy, 
  Check, 
  Star, 
  Layers, 
  Filter, 
  Tag,
  Building,
  Briefcase,
  ChevronRight
} from 'lucide-react';
import masterKbli from '../../data/masterKbli.json';
import masterKbji from '../../data/masterKbji.json';
import analyticsSummary from '../../data/analyticsSummary.json';

export default function ExplorerView() {
  const [activeCatalog, setActiveCatalog] = useState('kbli'); // 'kbli' | 'kbji'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [copiedCode, setCopiedCode] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bps_koding_favs') || '[]');
    } catch {
      return [];
    }
  });

  const toggleFavorite = (code) => {
    setFavorites(prev => {
      const next = prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code];
      try {
        localStorage.setItem('bps_koding_favs', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filter KBLI list
  const filteredKbli = useMemo(() => {
    let list = masterKbli;
    if (selectedCategory !== 'ALL') {
      list = list.filter(k => k.category?.code === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(k => 
        k.code.includes(q) || 
        k.title.toLowerCase().includes(q) || 
        (k.division_name && k.division_name.toLowerCase().includes(q)) ||
        (k.sample_cases && k.sample_cases.some(c => c.toLowerCase().includes(q)))
      );
    }
    return list;
  }, [searchQuery, selectedCategory]);

  // Filter KBJI list
  const filteredKbji = useMemo(() => {
    let list = masterKbji;
    if (selectedCategory !== 'ALL') {
      list = list.filter(k => k.major?.code === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(k => 
        k.code.includes(q) || 
        k.title.toLowerCase().includes(q) || 
        (k.submajor_name && k.submajor_name.toLowerCase().includes(q)) ||
        (k.sample_cases && k.sample_cases.some(c => c.toLowerCase().includes(q)))
      );
    }
    return list;
  }, [searchQuery, selectedCategory]);

  const isKbli = activeCatalog === 'kbli';
  const currentList = isKbli ? filteredKbli : filteredKbji;

  const categoriesMeta = analyticsSummary.categories_meta || {};
  const kbjiMajorsMeta = analyticsSummary.kbji_majors_meta || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className={`badge ${isKbli ? 'badge-kbli' : 'badge-kbji'}`}>
                <BookOpen size={13} /> Katalog Master Standar BPS
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {isKbli ? 'Klasifikasi Baku Lapangan Usaha Indonesia (KBLI 2025)' : 'Klasifikasi Baku Jabatan Indonesia (KBJI 2014)'}
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              {isKbli ? 'Eksplorasi Katalog Master KBLI' : 'Eksplorasi Katalog Master KBJI'}
            </h2>
          </div>

          {/* Catalog Switcher */}
          <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-subtle)', padding: '4px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-card)' }}>
            <button
              onClick={() => { setActiveCatalog('kbli'); setSelectedCategory('ALL'); }}
              className={`btn ${isKbli ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.84rem', padding: '8px 16px' }}
            >
              <Building size={16} /> Katalog KBLI 2025 ({masterKbli.length})
            </button>
            <button
              onClick={() => { setActiveCatalog('kbji'); setSelectedCategory('ALL'); }}
              className={`btn ${!isKbli ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.84rem', padding: '8px 16px' }}
            >
              <Briefcase size={16} /> Katalog KBJI 2014 ({masterKbji.length})
            </button>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="text-input"
              style={{ paddingLeft: '42px', fontSize: '0.95rem' }}
              placeholder={isKbli ? "Cari kode KBLI, nama lapangan usaha, sektor, atau komoditas..." : "Cari kode KBJI, nama jabatan, profesi, tugas..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button
              onClick={() => setSelectedCategory('ALL')}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: '1px solid var(--border-card)',
                background: selectedCategory === 'ALL' ? 'var(--text-main)' : 'var(--bg-card-solid)',
                color: selectedCategory === 'ALL' ? 'var(--text-inverse)' : 'var(--text-main)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Semua Kategori
            </button>

            {isKbli ? (
              Object.entries(categoriesMeta).map(([catKey, catInfo]) => {
                const countInCat = masterKbli.filter(k => k.category?.code === catKey).length;
                if (countInCat === 0) return null;
                const isSelected = selectedCategory === catKey;
                return (
                  <button
                    key={catKey}
                    onClick={() => setSelectedCategory(catKey)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      border: `1px solid ${isSelected ? catInfo.color : 'var(--border-card)'}`,
                      background: isSelected ? catInfo.color : 'var(--bg-card-solid)',
                      color: isSelected ? '#ffffff' : 'var(--text-main)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span>Kat {catKey} ({countInCat})</span>
                  </button>
                );
              })
            ) : (
              Object.entries(kbjiMajorsMeta).map(([majKey, majInfo]) => {
                const countInMaj = masterKbji.filter(k => k.major?.code === majKey).length;
                if (countInMaj === 0) return null;
                const isSelected = selectedCategory === majKey;
                return (
                  <button
                    key={majKey}
                    onClick={() => setSelectedCategory(majKey)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      border: `1px solid ${isSelected ? majInfo.color : 'var(--border-card)'}`,
                      background: isSelected ? majInfo.color : 'var(--bg-card-solid)',
                      color: isSelected ? '#ffffff' : 'var(--text-main)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span>Gol {majKey}: {majInfo.name} ({countInMaj})</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Menampilkan {currentList.length} entri {isKbli ? 'KBLI 5-Digit' : 'KBJI 4-Digit'}
        </div>
      </div>

      {/* Card Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: '16px'
      }}>
        {currentList.map((item) => {
          const isFav = favorites.includes(item.code);
          const isCopied = copiedCode === item.code;
          const catColor = isKbli ? (item.category?.color || '#0284c7') : (item.major?.color || '#10b981');

          return (
            <div 
              key={item.code} 
              className="glass-card glass-card-interactive"
              style={{
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: `4px solid ${catColor}`
              }}
            >
              <div>
                {/* Top badges */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="font-mono" style={{
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: catColor
                    }}>
                      [{item.code}]
                    </span>
                    {isKbli && item.category && (
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-full)',
                        background: `${catColor}15`,
                        color: catColor,
                        border: `1px solid ${catColor}35`
                      }}>
                        Kategori {item.category.code}
                      </span>
                    )}
                    {!isKbli && item.major && (
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-full)',
                        background: `${catColor}15`,
                        color: catColor,
                        border: `1px solid ${catColor}35`
                      }}>
                        Golongan {item.major.code}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      onClick={() => toggleFavorite(item.code)}
                      className="btn btn-secondary btn-icon"
                      style={{ width: '30px', height: '30px' }}
                      title={isFav ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
                    >
                      <Star size={14} color={isFav ? '#f59e0b' : 'currentColor'} fill={isFav ? '#f59e0b' : 'none'} />
                    </button>
                    <button
                      onClick={() => handleCopy(item.code)}
                      className="btn btn-secondary btn-icon"
                      style={{ width: '30px', height: '30px' }}
                      title="Salin Kode"
                    >
                      {isCopied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '8px', lineHeight: 1.4 }}>
                  {item.title}
                </h4>

                {/* Division / Submajor Info */}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  {isKbli ? (
                    <div>{item.division_name || item.category?.name}</div>
                  ) : (
                    <div>{item.submajor_name || item.major?.name}</div>
                  )}
                </div>
              </div>

              {/* Sample Cases from Survey */}
              {item.sample_cases && item.sample_cases.length > 0 && (
                <div style={{
                  marginTop: '10px',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '0.76rem'
                }}>
                  <div style={{ color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>
                    Kasus Nyata Lapangan ({item.frequency || item.sample_cases.length}x):
                  </div>
                  <div style={{ fontStyle: 'italic', color: 'var(--text-main)' }}>
                    "{item.sample_cases[0]}"
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
