import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { 
  Search, 
  BookOpen, 
  Database, 
  BarChart3, 
  ShieldCheck,
  PlusCircle,
  Sun, 
  Moon
} from 'lucide-react';

export default function Header({ 
  theme, 
  toggleTheme, 
  onOpenContribute, 
  pendingCount = 0,
  approvedCount = 234
}) {
  const navItems = [
    { path: '/', label: 'Pencarian Koding', icon: Search },
    { path: '/katalog', label: 'Katalog KBLI & KBJI', icon: BookOpen },
    { path: '/bank-data', label: 'Bank Data Minsel', icon: Database, count: approvedCount },
    { path: '/statistik', label: 'Statistik & Sebaran', icon: BarChart3 },
    { 
      path: '/admin', 
      label: 'Verifikasi Admin', 
      icon: ShieldCheck, 
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
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="brand-info">
            <h1>
              SI-KODING
              <span className="brand-tag">BPS MINSEL</span>
            </h1>
            <p>Sistem Klasifikasi & Pencarian KBLI 2025 & KBJI 2014</p>
          </div>
        </Link>

        {/* Route Navigation */}
        <nav className="nav-tabs-container">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-tab-btn ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
                title={item.label}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '10px',
                        background: item.badgeColor || '#0284c7',
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
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="header-actions">
          {/* Public Contribution Button */}
          <button
            onClick={onOpenContribute}
            className="btn btn-primary"
            style={{
              fontSize: '0.82rem',
              padding: '7px 14px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
            }}
          >
            <PlusCircle size={15} /> + Kontribusi Data
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
