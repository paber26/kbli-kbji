import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  Search, 
  Database, 
  PlusCircle,
  Sun, 
  Moon
} from 'lucide-react';

export default function Header({ 
  theme, 
  toggleTheme, 
  onOpenContribute, 
  pendingCount = 0,
  approvedCount = 137
}) {
  const navItems = [
    { path: '/', label: 'Pencarian Kode', icon: Search },
    { 
      path: '/bank-data', 
      label: 'Bank Data & Konfirmasi', 
      icon: Database, 
      count: approvedCount,
      badge: pendingCount > 0 ? `${pendingCount} Menunggu` : null,
      badgeColor: '#f59e0b'
    }
  ];

  return (
    <header className="header-wrapper">
      <div className="header-content">
        {/* Brand & Identity */}
        <Link to="/" className="brand-section" style={{ textDecoration: 'none' }}>
          <div className="brand-logo-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="brand-info">
            <h1>
              SI-KODING
              <span className="brand-tag">BPS MINSEL</span>
            </h1>
            <p>Klasifikasi KBLI 2025 & KBJI 2014</p>
          </div>
        </Link>

        {/* 2 Main Navigation Tabs */}
        <nav className="nav-tabs-container">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-tab-btn ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none', padding: '10px 18px', fontSize: '0.9rem' }}
                title={item.label}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    <span style={{ fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
                    {item.badge && (
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: item.badgeColor || '#f59e0b',
                        color: '#ffffff'
                      }}>
                        {item.badge}
                      </span>
                    )}
                    {item.count !== undefined && !item.badge && (
                      <span style={{
                        fontSize: '0.75rem',
                        opacity: 0.8,
                        fontWeight: 600
                      }}>
                        ({item.count})
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="header-actions">
          {/* Quick Add Button */}
          <button
            onClick={onOpenContribute}
            className="btn btn-primary"
            style={{
              fontSize: '0.85rem',
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)'
            }}
          >
            <PlusCircle size={16} /> + Tambah Data
          </button>

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
