import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SmartCoderView from './components/SmartCoder/SmartCoderView';
import ExplorerView from './components/Explorer/ExplorerView';
import DatabaseView from './components/FieldDatabase/DatabaseView';
import AnalyticsView from './components/Analytics/AnalyticsView';
import AdminModerationView from './components/Admin/AdminModerationView';
import ContributeModal from './components/Contribution/ContributeModal';
import { fetchApprovedCases, fetchStats } from './utils/api';
import localFieldCases from './data/fieldCases.json';

export default function App() {
  const [activeTab, setActiveTab] = useState('smart-coder');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('bps_theme') || 'light';
  });

  const [liveCases, setLiveCases] = useState(localFieldCases);
  const [stats, setStats] = useState({ total: localFieldCases.length, approved: localFieldCases.length, pending: 0, rejected: 0 });
  const [isContributeOpen, setIsContributeOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bps_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const loadData = useCallback(async () => {
    try {
      const [cases, statData] = await Promise.all([
        fetchApprovedCases(),
        fetchStats()
      ]);
      if (cases && cases.length > 0) {
        setLiveCases(cases);
      }
      if (statData) {
        setStats(statData);
      }
    } catch (err) {
      console.warn('Could not sync with API, using local state:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="app-container">
      {/* Header with Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenContribute={() => setIsContributeOpen(true)}
        pendingCount={stats.pending || 0}
        approvedCount={liveCases.length}
      />

      {/* Main Content View */}
      <main className="main-content">
        {activeTab === 'smart-coder' && <SmartCoderView liveCases={liveCases} />}
        {activeTab === 'master-explorer' && <ExplorerView />}
        {activeTab === 'field-database' && <DatabaseView liveCases={liveCases} />}
        {activeTab === 'analytics' && <AnalyticsView liveCases={liveCases} />}
        {activeTab === 'admin-moderation' && (
          <AdminModerationView onCaseApproved={loadData} />
        )}
      </main>

      {/* Public Contribution Modal */}
      <ContributeModal
        isOpen={isContributeOpen}
        onClose={() => setIsContributeOpen(false)}
        onSuccess={loadData}
      />

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
            Database: SQLite • Status: Terhubung
          </div>
        </div>
      </footer>
    </div>
  );
}
