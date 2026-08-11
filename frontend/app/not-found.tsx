'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ShieldAlert, Home, Inbox, Radio } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div
      style={{
        maxWidth: '560px',
        margin: '4.5rem auto 5rem',
        padding: '0 1rem',
        textAlign: 'center',
      }}
    >
      <div
        className="card"
        style={{
          padding: '3rem 2rem',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.06)',
          borderRadius: '16px',
        }}
      >
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
            border: '1px solid #fecdd3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
            boxShadow: '0 4px 12px rgba(225, 29, 72, 0.1)',
          }}
        >
          <ShieldAlert size={34} color="#e11d48" />
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            background: '#ffe4e6',
            color: '#e11d48',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
            marginBottom: '1rem',
          }}
        >
          404 RESOURCE NOT FOUND
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
          Signal Lost in Transit
        </h1>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '420px', margin: '0 auto 2rem' }}>
          The cryptographic mail packet or route you requested could not be located on the quantum mesh network.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Button variant="primary" icon={<Home size={16} />}>
              Return to Dashboard
            </Button>
          </Link>
          <Link href="/inbox" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" icon={<Inbox size={16} />}>
              Open Inbox
            </Button>
          </Link>
          <Link href="/audit" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" icon={<Radio size={16} color="#e11d48" />}>
              Wire Log
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

