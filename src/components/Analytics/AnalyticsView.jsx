import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  Building2, 
  Briefcase, 
  Layers, 
  Award,
  MapPin
} from 'lucide-react';
import analyticsSummary from '../../data/analyticsSummary.json';

export default function AnalyticsView() {
  const topKbli = analyticsSummary.top_kbli || [];
  const topKbji = analyticsSummary.top_kbji || [];
  const categoryDist = analyticsSummary.category_distribution || {};
  const totalCases = analyticsSummary.total_cases || 234;

  const maxKbliCount = topKbli.length > 0 ? topKbli[0].count : 1;
  const maxKbjiCount = topKbji.length > 0 ? topKbji[0].count : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-kbli">
                <BarChart3 size={13} /> Analisis Lapangan Kerja Daerah
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                BPS Kabupaten Minahasa Selatan (Prov 71, Kab 05)
              </span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>
              Statistik Distribusi KBLI & KBJI di Minahasa Selatan
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '750px' }}>
              Visualisasi pola dan sebaran lapangan usaha (KBLI) dan jenis pekerjaan (KBJI) berdasarkan 
              analisis data historis pendataan responden survei ketenagakerjaan dan sosial ekonomi.
            </p>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginTop: '20px'
        }}>
          {/* Card 1 */}
          <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7', marginBottom: '8px' }}>
              <Users size={18} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Responden</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {totalCases}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Kasus survei terdata</div>
          </div>

          {/* Card 2 */}
          <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '8px' }}>
              <Building2 size={18} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Variasi KBLI</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {analyticsSummary.unique_kbli}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Kode lapangan usaha 5-digit</div>
          </div>

          {/* Card 3 */}
          <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', marginBottom: '8px' }}>
              <Briefcase size={18} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Variasi KBJI</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {analyticsSummary.unique_kbji}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Kode profesi/jabatan 4-digit</div>
          </div>

          {/* Card 4 */}
          <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', marginBottom: '8px' }}>
              <Layers size={18} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Pekerjaan Tambahan</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {analyticsSummary.cases_with_secondary_job}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Responden dengan pekerjaan ganda</div>
          </div>
        </div>
      </div>

      {/* Top 10 Charts Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: '20px'
      }}>
        {/* Top 10 KBLI */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <div className="badge badge-kbli" style={{ marginBottom: '4px' }}>Top 10 Sektor KBLI</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                Lapangan Usaha Paling Dominan di Minsel
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topKbli.map((k, idx) => {
              const pct = (k.count / maxKbliCount) * 100;
              return (
                <div key={k.code} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      #{idx + 1} [{k.code}] {k.title}
                    </span>
                    <span className="font-mono" style={{ fontWeight: 700, color: '#0284c7' }}>
                      {k.count} Kasus
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: '8px', background: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)',
                      borderRadius: '4px',
                      transition: 'width 0.6s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 10 KBJI */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <div className="badge badge-kbji" style={{ marginBottom: '4px' }}>Top 10 Jabatan KBJI</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                Profesi / Pekerjaan Terbanyak di Minsel
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topKbji.map((k, idx) => {
              const pct = (k.count / maxKbjiCount) * 100;
              return (
                <div key={k.code} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      #{idx + 1} [{k.code}] {k.title}
                    </span>
                    <span className="font-mono" style={{ fontWeight: 700, color: '#10b981' }}>
                      {k.count} Kasus
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: '8px', background: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                      borderRadius: '4px',
                      transition: 'width 0.6s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sector Breakdown Card */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>
          Komposisi Lapangan Kerja Berdasarkan Kategori KBLI
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '12px'
        }}>
          {Object.entries(categoryDist).map(([catName, count]) => {
            const pct = ((count / totalCases) * 100).toFixed(1);
            return (
              <div key={catName} style={{
                background: 'var(--bg-subtle)',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', maxWidth: '200px' }}>
                  {catName}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="font-mono" style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0284c7' }}>
                    {count}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {pct}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
