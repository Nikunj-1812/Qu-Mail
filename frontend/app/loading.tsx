'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        backgroundColor: 'var(--bg-primary)',
        zIndex: 2147483647,
      }}
    >
      <div
        className="animate-pulse-ring"
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(2, 132, 199, 0.15)',
        }}
      >
        <Loader2 className="animate-spin" size={32} color="#0284c7" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
            marginBottom: '0.25rem',
          }}
        >
          Connecting to Quantum Mesh
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Establishing secure post-quantum channels...
        </p>
      </div>
    </div>
  );
}
