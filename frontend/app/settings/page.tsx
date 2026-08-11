'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { UserProfileCard } from '@/components/layout/UserProfileCard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Key, Shield, ShieldCheck, RefreshCw, Lock } from 'lucide-react';

export default function SettingsPage() {
  const { user, refreshUserProfile, isLoading } = useAuth();

  return (
    <ProtectedRoute>
      <div className="container-app">
        <div className="grid-main">
          <aside>
            <UserProfileCard />
          </aside>

          <section>
            <div className="card">
              <div className="card-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Key size={20} color="#7c3aed" />
                  <span>Cryptographic Keypair &amp; Security Settings</span>
                </div>
                <Button
                  variant="switch"
                  onClick={refreshUserProfile}
                  isLoading={isLoading}
                  icon={<RefreshCw size={14} />}
                >
                  Refresh Keypair
                </Button>
              </div>

              {user && (
                <div style={{ display: 'grid', gap: '1.25rem' }}>
                  {/* User Summary */}
                  <div
                    style={{
                      padding: '1.25rem',
                      background: '#f8fafc',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0284c7' }}>
                        {user.username}
                      </div>
                      <Badge level={3}>Kyber-1024 + Dilithium Enabled</Badge>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Registered Email: <strong>{user.email}</strong>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Account ID: <code>#{user.id}</code>
                    </div>
                  </div>

                  {/* Kyber-1024 Public Key */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.9rem', color: '#0284c7', marginBottom: '0.4rem' }}>
                      <Shield size={16} />
                      <span>Kyber-1024 Public Encapsulation Key (ML-KEM)</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      This public key is advertised to all users on the network so they can encapsulate symmetric AES keys when sending you emails.
                    </p>
                    <pre className="raw-code" style={{ background: '#ffffff', border: '1px solid var(--border-color)' }}>
                      {user.kyber_public_key || 'No public key generated yet.'}
                    </pre>
                  </div>

                  {/* Dilithium Public Key */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.9rem', color: '#7c3aed', marginBottom: '0.4rem' }}>
                      <ShieldCheck size={16} />
                      <span>Dilithium Public Verification Key (ML-DSA)</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      This public key is used by recipients to verify your digital signature and ensure message integrity.
                    </p>
                    <pre className="raw-code" style={{ background: '#ffffff', border: '1px solid var(--border-color)', color: '#7c3aed' }}>
                      {user.dilithium_public_key || 'No public key generated yet.'}
                    </pre>
                  </div>

                  {/* Private Key Security Note */}
                  <div
                    style={{
                      padding: '1rem',
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      color: '#065f46',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#047857', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Lock size={16} />
                      <span>Private Key Storage at Rest</span>
                    </div>
                    Your private keys are encrypted on the Django backend using <strong>Fernet AES-128-CBC + HMAC</strong> derived from your login passphrase with <strong>100,000 rounds of PBKDF2HMAC-SHA256</strong>. QuMail never stores private keys in plaintext.
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}

