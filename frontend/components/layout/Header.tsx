'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import {
  Inbox,
  Send,
  FileEdit,
  Activity,
  Key,
  LogOut,
  LogIn,
  ShieldCheck,
} from 'lucide-react';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navLinks = [
    { href: '/inbox', label: 'Inbox', icon: <Inbox size={16} /> },
    { href: '/sent', label: 'Sent', icon: <Send size={16} /> },
    { href: '/drafts', label: 'Drafts', icon: <FileEdit size={16} /> },
    { href: '/audit', label: 'Wire Log / Audit', icon: <Activity size={16} /> },
    { href: '/settings', label: 'Keys', icon: <Key size={16} /> },
  ];

  return (
    <header
      style={{
        borderBottom: '1px solid var(--border-color)',
        background: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '0.85rem 1.5rem',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
          {/* Brand Name */}
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              QuantumMail
            </span>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Post-Quantum Encrypted Client
            </span>
          </Link>

          {/* Navigation Items */}
          <nav style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href === '/inbox' && pathname === '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    color: isActive ? '#0284c7' : 'var(--text-secondary)',
                    background: isActive ? '#e0f2fe' : 'transparent',
                    border: `1px solid ${isActive ? '#bae6fd' : 'transparent'}`,
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Session Auth Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Link href="/settings" style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#f8fafc',
                    border: '1px solid var(--border-color)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <ShieldCheck size={16} color="#059669" />
                  <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {user.username}
                  </span>
                </div>
              </Link>

              <Button
                variant="danger"
                onClick={logout}
                icon={<LogOut size={14} />}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                title="Log Out"
              >
                Log Out
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <Button
                  variant="primary"
                  icon={<LogIn size={15} />}
                  style={{ fontSize: '0.825rem' }}
                >
                  Sign In / Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
