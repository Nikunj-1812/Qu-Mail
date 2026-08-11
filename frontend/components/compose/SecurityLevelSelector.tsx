'use client';

import React from 'react';
import { SecurityLevel } from '@/types/mail';
import { SECURITY_LEVELS } from '@/lib/constants';

interface SecurityLevelSelectorProps {
  value: SecurityLevel;
  onChange: (level: SecurityLevel) => void;
}

export const SecurityLevelSelector: React.FC<SecurityLevelSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="form-group">
      <label className="form-label">Encryption Security Level</label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
        {SECURITY_LEVELS.map((lvl) => {
          const isSelected = value === lvl.level;
          return (
            <div
              key={lvl.level}
              onClick={() => onChange(lvl.level)}
              style={{
                background: isSelected ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-secondary)',
                border: `1px solid ${isSelected ? lvl.color : 'var(--border-color)'}`,
                boxShadow: isSelected ? `0 0 12px ${lvl.color}33` : 'none',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: lvl.color }}>
                  {lvl.shortName}
                </span>
                <input
                  type="radio"
                  name="security-level"
                  checked={isSelected}
                  onChange={() => onChange(lvl.level)}
                  style={{ accentColor: lvl.color }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                {lvl.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
