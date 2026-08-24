import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SmartCoderView from './components/SmartCoder/SmartCoderView';
import ExplorerView from './components/Explorer/ExplorerView';
import DatabaseView from './components/FieldDatabase/DatabaseView';
import AnalyticsView from './components/Analytics/AnalyticsView';

export default function App() {
  const [activeTab, setActiveTab] = useState('smart-coder');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('bps_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bps_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="app-container">
      {/* Header with Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Content View */}
      <main className="main-content">
        {activeTab === 'smart-coder' && <SmartCoderView />}
        {activeTab === 'master-explorer' && <ExplorerView />}
        {activeTab === 'field-database' && <DatabaseView />}
        {activeTab === 'analytics' && <AnalyticsView />}
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-card)',
        padding: '24px 20px',
        textAlign: 'center',
        fontSize: '0.82rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ maxWidth: '1380px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong>SI-KODING</strong> • Sistem Cerdas Klasifikasi KBLI 2020 & KBJI 2014
          </div>
          <div>
            Badan Pusat Statistik Kabupaten Minahasa Selatan (Provinsi Sulawesi Utara)
          </div>
          <div>
            Standardisasi Statistik Nasional BPS RI
          </div>
        </div>
      </footer>
    </div>
  );
}
