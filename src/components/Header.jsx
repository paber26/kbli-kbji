import React from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Database, 
  FileSpreadsheet, 
  BarChart3, 
  Sun, 
  Moon, 
  CheckCircle2
} from 'lucide-react';
import analyticsSummary from '../data/analyticsSummary.json';

export default function Header({ activeTab, setActiveTab, theme, toggleTheme }) {
  const navItems = [
    { id: 'smart-coder', label: 'Asisten Koding', icon: Sparkles, badge: 'Cerdas' },
    { id: 'master-explorer', label: 'Katalog KBLI & KBJI', icon: BookOpen, count: `${analyticsSummary.unique_kbli}+` },
    { id: 'field-database', label: 'Bank Data Minsel', icon: Database, count: analyticsSummary.total_cases },
    { id: 'analytics', label: 'Statistik & Sebaran', icon: BarChart3 }
  ];

  return (
    <header className="header-wrapper">
      <div className="header-content">
        {/* Brand & Identity */}
        <div className="brand-section">
          <div className="brand-logo-badge">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="brand-info">
            <h1>
              SI-KODING
              <span className="brand-tag">BPS MINSEL</span>
            </h1>
            <p>Sistem Cerdas Klasifikasi KBLI 2020 & KBJI 2014</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="nav-tabs-container">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-tab-btn ${isActive ? 'active' : ''}`}
                title={item.label}
              >
                <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
                {item.badge && (
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '10px',
                    background: isActive ? '#0284c7' : 'rgba(255,255,255,0.2)',
                    color: '#ffffff'
                  }}>
                    {item.badge}
                  </span>
                )}
                {item.count && (
                  <span style={{
                    fontSize: '0.7rem',
                    opacity: 0.8,
                    fontWeight: 600
                  }}>
                    ({item.count})
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Actions (Theme Toggle & Status) */}
        <div className="header-actions">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            color: 'rgba(255,255,255,0.85)',
            background: 'rgba(255,255,255,0.08)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981'
            }}></span>
            <span style={{ fontWeight: 600 }}>Offline Ready</span>
          </div>

          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn"
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
