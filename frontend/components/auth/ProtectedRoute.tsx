'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, LogIn, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isHydrating } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrating && !user) {
      router.push('/login');
    }
  }, [user, isHydrating, router]);

  if (isHydrating) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-primary)',
          zIndex: 2147483647,
          textAlign: 'center',
        }}
      >
        <div
          className="card"
          style={{
            padding: '3rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            className="animate-pulse-ring"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(2, 132, 199, 0.15)',
            }}
          >
            <ShieldCheck className="animate-spin" size={28} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Verifying Quantum Session
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Restoring encrypted session keys from secure storage...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-app" style={{ maxWidth: '480px', margin: '6rem auto', textAlign: 'center' }}>
        <div
          className="card"
          style={{
            padding: '3rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#fef2f2',
              border: '1px solid #fecdd3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lock size={26} color="#e11d48" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Authentication Required
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              This route is protected by post-quantum encryption. Please log in with your credentials or select a demo account.
            </p>
          </div>
          <Link href="/login" style={{ textDecoration: 'none', width: '100%' }}>
            <Button variant="primary" style={{ width: '100%' }} icon={<LogIn size={16} />}>
              Go to Login / Demo Accounts
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
