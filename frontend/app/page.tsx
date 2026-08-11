'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mailApi } from '@/lib/api/mail';
import { networkApi } from '@/lib/api/network';
import { draftsStore } from '@/lib/drafts';
import { EncryptedEmailListItem } from '@/types/mail';
import { InterceptedPacket } from '@/types/network';
import { UserProfileCard } from '@/components/layout/UserProfileCard';
import { AuthCard } from '@/components/auth/AuthCard';
import { EmailList } from '@/components/mail/EmailList';
import { DraftsList } from '@/components/mail/DraftsList';
import { AuditTable } from '@/components/audit/AuditTable';
import { ComposeModal } from '@/components/compose/ComposeModal';
import { Button } from '@/components/ui/Button';
import {
  Plus,
  Inbox,
  Send,
  Radio,
  FileEdit,
  Key,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'drafts' | 'wire'>('inbox');
  const [inboxEmails, setInboxEmails] = useState<EncryptedEmailListItem[]>([]);
  const [sentEmails, setSentEmails] = useState<EncryptedEmailListItem[]>([]);
  const [draftsCount, setDraftsCount] = useState<number>(0);
  const [wirePackets, setWirePackets] = useState<InterceptedPacket[]>([]);
  const [isInboxLoading, setIsInboxLoading] = useState<boolean>(false);
  const [isSentLoading, setIsSentLoading] = useState<boolean>(false);
  const [isWireLoading, setIsWireLoading] = useState<boolean>(false);
  const [isComposeOpen, setIsComposeOpen] = useState<boolean>(false);

  const fetchInbox = useCallback(async () => {
    if (!token) return;
    setIsInboxLoading(true);
    try {
      const data = await mailApi.getInbox(token);
      setInboxEmails(data);
    } catch (err) {
      console.error('Inbox fetch error', err);
    } finally {
      setIsInboxLoading(false);
    }
  }, [token]);

  const fetchSent = useCallback(async () => {
    if (!token) return;
    setIsSentLoading(true);
    try {
      const data = await mailApi.getSent(token);
      setSentEmails(data);
    } catch (err) {
      console.error('Sent fetch error', err);
    } finally {
      setIsSentLoading(false);
    }
  }, [token]);

  const fetchWire = useCallback(async () => {
    setIsWireLoading(true);
    try {
      const data = await networkApi.getWireLog();
      setWirePackets(data);
    } catch (err) {
      console.error('Wire log fetch error', err);
    } finally {
      setIsWireLoading(false);
    }
  }, []);

  const loadDraftsCount = () => {
    setDraftsCount(draftsStore.getAll().length);
  };

  useEffect(() => {
    if (token) {
      fetchInbox();
      fetchSent();
    } else {
      setInboxEmails([]);
      setSentEmails([]);
    }
    fetchWire();
    loadDraftsCount();
  }, [token, fetchInbox, fetchSent, fetchWire]);

  const unreadCount = inboxEmails.filter((e) => !e.is_read).length;

  if (!user) {
    return (
      <div className="container-app" style={{ maxWidth: '1060px', margin: '1.5rem auto 3rem' }}>
        {/* Welcome Hero */}
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
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
            Quantum-Resistant Encrypted Mail
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.5rem', maxWidth: '620px', margin: '0.5rem auto 0' }}>
            Next-generation end-to-end post-quantum cryptographic security protecting communications against Harvest Now, Decrypt Later threats.
          </p>
        </div>

        {/* 1-Click Demo & Auth Cards Side-by-Side */}
        <AuthCard />

        {/* 3 Security Levels Overview Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
            marginTop: '2rem',
          }}
        >
          <div className="card" style={{ padding: '1.15rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-level-1">Level 1</span>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Standard Plaintext</strong>
            </div>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
              Unencrypted baseline transmission for visual wire audit comparison and demonstration.
            </p>
          </div>

          <div className="card" style={{ padding: '1.15rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-level-2">Level 2</span>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Kyber KEM + AES-256 GCM</strong>
            </div>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
              Post-quantum Key Encapsulation with symmetric payload encryption and Dilithium signatures.
            </p>
          </div>

          <div className="card" style={{ padding: '1.15rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-level-3">Level 3</span>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Quantum One-Time Pad</strong>
            </div>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
              Information-theoretically secure encryption with Dilithium post-quantum digital authentication.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app">
      {/* Top Metrics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          className="card"
          style={{ padding: '1.15rem', cursor: 'pointer' }}
          onClick={() => setActiveTab('inbox')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Inbox</span>
            <Inbox size={18} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {inboxEmails.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: unreadCount > 0 ? '#0284c7' : 'var(--text-muted)', fontWeight: 600 }}>
            {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
          </div>
        </div>

        <div
          className="card"
          style={{ padding: '1.15rem', cursor: 'pointer' }}
          onClick={() => setActiveTab('sent')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Sent Messages</span>
            <Send size={18} color="#059669" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {sentEmails.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Encrypted & Transmitted
          </div>
        </div>

        <div
          className="card"
          style={{ padding: '1.15rem', cursor: 'pointer' }}
          onClick={() => {
            setActiveTab('drafts');
            loadDraftsCount();
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Drafts</span>
            <FileEdit size={18} color="#7c3aed" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {draftsCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Stored in Local Session
          </div>
        </div>

        <div
          className="card"
          style={{ padding: '1.15rem', cursor: 'pointer' }}
          onClick={() => setActiveTab('wire')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Audit Packets</span>
            <Radio size={18} color="#e11d48" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {wirePackets.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Wire Interceptor Log
          </div>
        </div>
      </div>

      <div className="grid-main">
        {/* Left Sidebar */}
        <aside>
          <UserProfileCard />

          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <Button
              variant="primary"
              style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.95rem' }}
              onClick={() => setIsComposeOpen(true)}
              icon={<Plus size={18} />}
            >
              Compose Quantum Email
            </Button>
          </div>


          {/* Quick Hub Navigation Card */}
          <div className="card">
            <div className="card-title" style={{ fontSize: '0.95rem', marginBottom: '0.85rem' }}>
              Quick Links
            </div>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <Link href="/audit" style={{ textDecoration: 'none' }}>
                <Button
                  variant="secondary"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem' }}
                  icon={<Radio size={16} color="#e11d48" />}
                >
                  Full Wire Log / Audit Report
                </Button>
              </Link>
              <Link href="/settings" style={{ textDecoration: 'none' }}>
                <Button
                  variant="secondary"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem' }}
                  icon={<Key size={16} color="#0284c7" />}
                >
                  Keys & Security Settings
                </Button>
              </Link>
            </div>
          </div>
        </aside>

        {/* Right Workspace */}
        <section>
          {/* Tabs bar */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '0.75rem',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              className={`btn-mode ${activeTab === 'inbox' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('inbox');
                fetchInbox();
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Inbox size={16} />
              <span>Inbox ({inboxEmails.length})</span>
            </button>

            <button
              className={`btn-mode ${activeTab === 'sent' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('sent');
                fetchSent();
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Send size={16} />
              <span>Sent ({sentEmails.length})</span>
            </button>

            <button
              className={`btn-mode ${activeTab === 'drafts' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('drafts');
                loadDraftsCount();
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FileEdit size={16} />
              <span>Drafts ({draftsCount})</span>
            </button>

            <button
              className={`btn-mode ${activeTab === 'wire' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('wire');
                fetchWire();
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Radio size={16} />
              <span>Wire Interceptor ({wirePackets.length})</span>
            </button>
          </div>

          {/* Active Tab Workspace */}
          {activeTab === 'inbox' && (
            <div className="card">
              <div className="card-title">
                <span>Received Quantum Emails</span>
              </div>
              {!user ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  Please sign in or create an account to access your encrypted messages.
                </div>
              ) : (
                <EmailList
                  emails={inboxEmails}
                  isInbox={true}
                  isLoading={isInboxLoading}
                  onRefresh={fetchInbox}
                />
              )}
            </div>
          )}

          {activeTab === 'sent' && (
            <div className="card">
              <div className="card-title">
                <span>Sent Quantum Emails</span>
              </div>
              {!user ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  Please sign in or create an account to view sent messages.
                </div>
              ) : (
                <EmailList
                  emails={sentEmails}
                  isInbox={false}
                  isLoading={isSentLoading}
                  onRefresh={fetchSent}
                />
              )}
            </div>
          )}

          {activeTab === 'drafts' && (
            <div className="card">
              <div className="card-title">
                <span>Saved Drafts</span>
              </div>
              <DraftsList />
            </div>
          )}

          {activeTab === 'wire' && (
            <AuditTable
              packets={wirePackets}
              isLoading={isWireLoading}
              onRefresh={fetchWire}
            />
          )}
        </section>
      </div>

      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => {
          setIsComposeOpen(false);
          loadDraftsCount();
        }}
        onSuccess={() => {
          fetchInbox();
          fetchSent();
          fetchWire();
          loadDraftsCount();
        }}
      />
    </div>
  );
}
