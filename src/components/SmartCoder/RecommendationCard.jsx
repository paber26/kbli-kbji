import React, { useState } from 'react';
import { Copy, Check, Info, ShieldCheck, Tag, ChevronRight } from 'lucide-react';

export default function RecommendationCard({ 
  type = 'kbli', // 'kbli' | 'kbji'
  data, 
  rank = 1,
  onSelectAlternative 
}) {
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const isKbli = type === 'kbli';
  const code = data.code;
  const title = data.title;
  const confidence = data.confidence || 75;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getConfidenceBadgeClass = (score) => {
    if (score >= 80) return 'badge-high';
    if (score >= 60) return 'badge-medium';
    return 'badge-low';
  };

  return (
    <div className={`glass-card ${rank === 1 ? 'glass-card-interactive' : ''}`} style={{
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      borderLeft: `4px solid ${isKbli ? '#0284c7' : '#10b981'}`
    }}>
      {/* Top Meta Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`badge ${isKbli ? 'badge-kbli' : 'badge-kbji'}`}>
            {isKbli ? 'KBLI 5-Digit' : 'KBJI 4-Digit'} {rank === 1 ? '• Rekomendasi Utama' : `• Opsi #${rank}`}
          </span>
          {isKbli && data.category && (
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: `${data.category.color}18`,
              color: data.category.color,
              border: `1px solid ${data.category.color}40`
            }}>
              Kategori {data.category.code}
            </span>
          )}
          {!isKbli && data.major && (
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: `${data.major.color}18`,
              color: data.major.color,
              border: `1px solid ${data.major.color}40`
            }}>
              Golongan {data.major.code}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`badge badge-confidence ${getConfidenceBadgeClass(confidence)}`}>
            {confidence}% Cocok
          </span>
        </div>
      </div>

      {/* Code & Title Section */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '14px'
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '4px'
          }}>
            <span className="font-mono" style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: isKbli ? '#0284c7' : '#10b981',
              letterSpacing: '0.04em'
            }}>
              [{code}]
            </span>
            <button
              onClick={handleCopy}
              className="btn btn-secondary btn-icon"
              style={{ width: '32px', height: '32px' }}
              title="Salin Kode ke Clipboard"
            >
              {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
            </button>
          </div>
          <h3 style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            lineHeight: 1.4,
            color: 'var(--text-main)'
          }}>
            {title}
          </h3>
        </div>
      </div>

      {/* Classification Details */}
      <div style={{
        background: 'var(--bg-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        fontSize: '0.82rem',
        color: 'var(--text-muted)',
        marginBottom: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        {isKbli && (
          <>
            <div><strong>Sektor:</strong> {data.category?.name || '-'}</div>
            {data.division && <div><strong>Golongan Pokok:</strong> {data.division}</div>}
          </>
        )}
        {!isKbli && (
          <>
            <div><strong>Golongan Utama:</strong> {data.major?.name || '-'}</div>
            {data.submajor && <div><strong>Subgolongan:</strong> {data.submajor}</div>}
          </>
        )}
      </div>

      {/* Case Evidence / Reasons */}
      {data.reasons && data.reasons.length > 0 && (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Kasus Serupa di Lapangan: </span>
          {data.reasons.slice(0, 2).map((r, i) => (
            <span key={i} style={{
              display: 'inline-block',
              background: 'var(--bg-card-solid)',
              border: '1px solid var(--border-card)',
              padding: '2px 8px',
              borderRadius: '4px',
              margin: '2px 4px 2px 0',
              fontStyle: 'italic'
            }}>
              "{r}"
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
