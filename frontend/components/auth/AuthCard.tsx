'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { LogIn, UserPlus, Zap, Shield, Key, Sparkles, ArrowRight } from 'lucide-react';

interface DemoAccount {
  name: string;
  username: string;
  password: string;
  role: string;
  color: string;
  bgLight: string;
  borderLight: string;
  description: string;
  keys: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    name: 'Alice (Sender)',
    username: 'alice_demo',
    password: 'Demo@1234',
    role: 'Primary Sender',
    color: '#8b5cf6',
    bgLight: '#f5f3ff',
    borderLight: '#ddd6fe',
    description: 'Pre-seeded with Kyber-512 & Dilithium-2 keys for sending encrypted mail.',
    keys: 'Kyber + Dilithium Active',
  },
  {
    name: 'Bob (Receiver)',
    username: 'bob_demo',
    password: 'Demo@1234',
    role: 'Recipient',
    color: '#10b981',
    bgLight: '#ecfdf5',
    borderLight: '#a7f3d0',
    description: 'Decrypts incoming Level 1, Level 2 (KEM), and Level 3 (OTP) emails.',
    keys: 'Decapsulation Keys Ready',
  },
  {
    name: 'Judge (Auditor)',
    username: 'judge_demo',
    password: 'Demo@1234',
    role: 'Neutral Evaluator',
    color: '#f59e0b',
    bgLight: '#fffbeb',
    borderLight: '#fde68a',
    description: 'Neutral inspection account to verify wire interception & crypto security.',
    keys: 'Inspection Mode',
  },
];

export const AuthCard: React.FC = () => {
  const { login, signup, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [activeDemoLoggingIn, setActiveDemoLoggingIn] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        await login({ username, password });
        showToast(`Welcome back, ${username}!`, 'success');
        router.push('/');
      } else {
        if (!email) {
          showToast('Email address is required for registration.', 'error');
          return;
        }
        await signup({ username, email, password });
        showToast(`Account created! Post-quantum keys automatically generated for ${username}.`, 'success');
        router.push('/');
      }
    } catch (err: any) {
      showToast(err.message || 'Authentication failed. Please verify credentials.', 'error');
    }
  };

  const handleDemoLogin = async (demo: DemoAccount) => {
    setUsername(demo.username);
    setPassword(demo.password);
    setActiveDemoLoggingIn(demo.username);
    try {
      await login({ username: demo.username, password: demo.password });
      showToast(`Logged in as ${demo.name}!`, 'success');
      router.push('/');
    } catch (err: any) {
      showToast(err.message || `Failed to login as ${demo.name}. Make sure demo accounts are seeded.`, 'error');
    } finally {
      setActiveDemoLoggingIn(null);
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '1.5rem',
        width: '100%',
        alignItems: 'stretch',
      }}
    >
      {/* 1-Click Demo Accounts Card */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                padding: '6px',
                borderRadius: '8px',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Zap size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                1-Click Demo Accounts
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Instant access with pre-generated post-quantum keys
              </p>
            </div>
          </div>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.2rem 0.5rem',
              borderRadius: '9999px',
              background: '#e0f2fe',
              color: '#0284c7',
            }}
          >
            Ready to Test
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {DEMO_ACCOUNTS.map((demo) => {
            const isLoggingThis = activeDemoLoggingIn === demo.username;
            return (
              <div
                key={demo.username}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.9rem',
                  borderRadius: '10px',
                  background: demo.bgLight,
                  border: `1px solid ${demo.borderLight}`,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      background: demo.color,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      flexShrink: 0,
                    }}
                  >
                    {demo.username.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b' }}>
                        {demo.name}
                      </span>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          padding: '0.1rem 0.35rem',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.8)',
                          color: demo.color,
                          border: `1px solid ${demo.borderLight}`,
                        }}
                      >
                        {demo.role}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: '0.725rem',
                        color: '#64748b',
                        margin: '0.15rem 0 0',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {demo.description}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  isLoading={isLoggingThis}
                  disabled={isLoading || !!activeDemoLoggingIn}
                  onClick={() => handleDemoLogin(demo)}
                  style={{
                    flexShrink: 0,
                    marginLeft: '0.5rem',
                    fontSize: '0.75rem',
                    padding: '0.35rem 0.75rem',
                    borderColor: demo.borderLight,
                    background: '#ffffff',
                    color: demo.color,
                    fontWeight: 700,
                  }}
                  icon={!isLoggingThis ? <Sparkles size={13} color={demo.color} /> : undefined}
                >
                  {isLoggingThis ? 'Signing in...' : 'Login'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Standard Form Login / Sign Up Card */}
      <div 
        className="card" 
        style={{ 
          padding: '2rem', 
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
          border: '1px solid #f1f5f9'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Shield size={24} color="#0284c7" />
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
            {mode === 'login' ? 'Enter your credentials to access your secure mail.' : 'Join QuantumMail and communicate securely.'}
          </p>
        </div>

        {/* Modern Segmented Tab Switcher */}
        <div
          style={{
            background: '#f8fafc',
            padding: '4px',
            borderRadius: '12px',
            display: 'flex',
            gap: '4px',
            marginBottom: '2rem',
            border: '1px solid #e2e8f0'
          }}
        >
          <button
            type="button"
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: mode === 'login' ? 700 : 500,
              color: mode === 'login' ? '#0f172a' : '#64748b',
              background: mode === 'login' ? '#ffffff' : 'transparent',
              boxShadow: mode === 'login' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onClick={() => setMode('login')}
          >
            Log In
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: mode === 'signup' ? 700 : 500,
              color: mode === 'signup' ? '#0f172a' : '#64748b',
              background: mode === 'signup' ? '#ffffff' : 'transparent',
              boxShadow: mode === 'signup' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  paddingLeft: '2.5rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  color: '#0f172a',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.target.style.background = '#ffffff';
                  e.target.style.borderColor = '#0284c7';
                  e.target.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.background = '#f8fafc';
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <Sparkles size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    paddingLeft: '2.5rem',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    color: '#0f172a',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.background = '#ffffff';
                    e.target.style.borderColor = '#0284c7';
                    e.target.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.background = '#f8fafc';
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <Sparkles size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  paddingLeft: '2.5rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  color: '#0f172a',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.target.style.background = '#ffffff';
                  e.target.style.borderColor = '#0284c7';
                  e.target.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.background = '#f8fafc';
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <Key size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            style={{ 
              width: '100%', 
              marginTop: '0.75rem', 
              padding: '0.85rem 1.25rem', 
              fontSize: '1rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
              transition: 'all 0.2s ease'
            }}
            isLoading={isLoading && !activeDemoLoggingIn}
            disabled={isLoading || !!activeDemoLoggingIn}
            icon={mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
          >
            {mode === 'login' ? 'Log In to QuantumMail' : 'Create Secure Account'}
          </Button>
        </form>
      </div>
    </div>
  );
};


