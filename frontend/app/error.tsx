'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled frontend application error:', error);
  }, [error]);

  return (
    <div
      style={{
        maxWidth: '560px',
        margin: '4rem auto',
        padding: '2rem',
        background: '#ffffff',
        border: '1px solid #fecdd3',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-modal)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#fff1f2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto',
        }}
      >
        <AlertTriangle size={28} color="#e11d48" />
      </div>

      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        Something unexpected occurred
      </h2>

      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
        The interface caught an error gracefully. Your cryptographic session and keys remain safe.
      </p>

      {error?.message && (
        <div
          className="font-mono"
          style={{
            background: '#f8fafc',
            border: '1px solid var(--border-color)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem',
            color: '#be123c',
            textAlign: 'left',
            marginBottom: '1.5rem',
            wordBreak: 'break-all',
          }}
        >
          {error.message}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Button variant="primary" onClick={() => reset()} icon={<RotateCcw size={15} />}>
          Try Again
        </Button>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Button variant="secondary" icon={<Home size={15} />}>
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
