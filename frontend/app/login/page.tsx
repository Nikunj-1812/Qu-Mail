'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AuthCard } from '@/components/auth/AuthCard';

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  return (
    <div
      style={{
        maxWidth: '1020px',
        margin: '2rem auto 3rem',
        padding: '0 1.25rem',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.3rem 0.85rem',
            borderRadius: '9999px',
            background: '#e0f2fe',
            color: '#0284c7',
            fontSize: '0.75rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
            letterSpacing: '0.03em',
          }}
        >
          <span>NIST FIPS 203 (ML-KEM) & FIPS 204 (ML-DSA)</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
          QuantumMail Authentication
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.4rem', maxWidth: '560px', margin: '0.4rem auto 0' }}>
          Select a 1-click pre-configured demo account or sign in with your credentials.
        </p>
      </div>

      <AuthCard />
    </div>
  );
}


