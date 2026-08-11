'use client';

import React, { useState } from 'react';
import { EncryptedPayload } from '@/types/mail';
import { ANATOMY_PROPERTIES } from '@/lib/constants';
import { Code, Info } from 'lucide-react';

interface EnvelopeInspectorProps {
  payload: EncryptedPayload | any;
}

export const EnvelopeInspector: React.FC<EnvelopeInspectorProps> = ({ payload }) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const safePayload = payload && typeof payload === 'object' ? payload : {};
  const keys = Object.keys(safePayload);

  return (
    <div style={{ marginTop: '1.25rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.85rem',
          fontWeight: 700,
          color: '#0284c7',
          marginBottom: '0.5rem',
        }}
      >
        <Code size={16} />
        <span>Cryptographic Envelope Payload (On-The-Wire JSON)</span>
      </div>

      <div
        style={{
          background: '#f8fafc',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem',
          fontSize: '0.8rem',
          fontFamily: 'JetBrains Mono, monospace',
          overflowX: 'auto',
        }}
      >
        <span>{'{'}</span>
        <div style={{ paddingLeft: '1rem' }}>
          {keys.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', margin: '0.2rem 0' }}>
              // No cryptographic envelope properties
            </div>
          ) : (
            keys.map((key, idx) => {
              const val = safePayload[key];
              const valStr = typeof val === 'object' && val !== null ? JSON.stringify(val) : `"${String(val ?? '')}"`;
              const isLast = idx === keys.length - 1;

              return (
                <div key={key} style={{ margin: '0.2rem 0' }}>
                  <span
                    onClick={() => setSelectedKey(key)}
                    style={{
                      color: '#0369a1',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline dotted',
                    }}
                    title="Click to inspect property details"
                  >
                    "{key}"
                  </span>
                  : <span style={{ color: '#047857', wordBreak: 'break-all' }}>{valStr}</span>
                  {!isLast && ','}
                </div>
              );
            })
          )}
        </div>
        <span>{'}'}</span>
      </div>

      {selectedKey && (
        <div
          style={{
            marginTop: '0.65rem',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            fontSize: '0.8rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0369a1', fontWeight: 700, marginBottom: '0.25rem' }}>
            <Info size={14} />
            <span>Field Inspection: {selectedKey}</span>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            {ANATOMY_PROPERTIES[selectedKey] || 'Custom cryptographic envelope property.'}
          </p>
        </div>
      )}
    </div>
  );
};
