'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LogOut, Key, ShieldCheck, User as UserIcon, LogIn, RefreshCw, Zap } from 'lucide-react';
import Link from 'next/link';

const DEMO_USERS = [
  { name: 'Alice (Sender)', username: 'alice_demo', password: 'Demo@1234', color: '#8b5cf6' },
  { name: 'Bob (Receiver)', username: 'bob_demo', password: 'Demo@1234', color: '#10b981' },
  { name: 'Judge (Auditor)', username: 'judge_demo', password: 'Demo@1234', color: '#f59e0b' },
];

export const UserProfileCard: React.FC = () => {
  const { user, logout, login } = useAuth();
  const { showToast } = useToast();
  const [isSwitching, setIsSwitching] = useState<string | null>(null);

  const handleQuickSwitch = async (demo: typeof DEMO_USERS[0]) => {
    setIsSwitching(demo.username);
    try {
      await login({ username: demo.username, password: demo.password });
      showToast(`Switched active session to ${demo.name}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to switch demo account.', 'error');
    } finally {
      setIsSwitching(null);
    }
  };

  if (!user) {
    return (
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
            <UserIcon size={17} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
              Account Session
            </span>
          </div>
          <Badge level={1}>Signed Out</Badge>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
          Sign in with your database credentials or use a 1-click demo account.
        </p>
        <Link href="/login" style={{ textDecoration: 'none' }}>
          <Button variant="primary" style={{ width: '100%', fontSize: '0.85rem' }} icon={<LogIn size={15} />}>
            Sign In / Demo Accounts
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
          <ShieldCheck size={17} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            Active Session
          </span>
        </div>
        <Badge level={3}>Kyber Active</Badge>
      </div>


      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
          {user.username}
        </div>
        <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
          {user.email}
        </div>
      </div>

      <div
        style={{
          background: '#f8fafc',
          padding: '0.75rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          fontSize: '0.75rem',
          marginBottom: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
          <Key size={14} color="var(--accent-purple)" />
          <strong>Public Key:</strong>
        </div>
        <div
          className="font-mono"
          style={{
            color: 'var(--text-secondary)',
            wordBreak: 'break-all',
            maxHeight: '60px',
            overflowY: 'auto',
          }}
        >
          {user.kyber_public_key || 'No key generated'}
        </div>
      </div>

      {/* Quick Demo Switcher */}
      <div
        style={{
          background: '#f1f5f9',
          padding: '0.6rem 0.75rem',
          borderRadius: '8px',
          marginBottom: '0.85rem',
          fontSize: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, color: '#475569', marginBottom: '0.45rem' }}>
          <Zap size={13} color="#0284c7" />
          <span>Switch Demo User:</span>
        </div>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {DEMO_USERS.map((demo) => {
            const isCurrent = user.username === demo.username;
            return (
              <button
                key={demo.username}
                type="button"
                disabled={isCurrent || !!isSwitching}
                onClick={() => handleQuickSwitch(demo)}
                style={{
                  flex: 1,
                  padding: '0.35rem 0.25rem',
                  fontSize: '0.7rem',
                  fontWeight: isCurrent ? 700 : 500,
                  borderRadius: '6px',
                  border: isCurrent ? `1px solid ${demo.color}` : '1px solid #cbd5e1',
                  background: isCurrent ? '#ffffff' : '#ffffff',
                  color: isCurrent ? demo.color : '#64748b',
                  cursor: isCurrent ? 'default' : 'pointer',
                  opacity: isCurrent ? 1 : 0.85,
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                {isSwitching === demo.username ? '...' : demo.name.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Link href="/settings" style={{ flex: 1, textDecoration: 'none' }}>
          <Button variant="secondary" style={{ width: '100%', fontSize: '0.8rem' }}>
            Keys & Settings
          </Button>
        </Link>
        <Button
          variant="danger"
          onClick={logout}
          icon={<LogOut size={14} />}
          style={{ fontSize: '0.8rem' }}
        >
          Log Out
        </Button>
      </div>
    </div>
  );
};

