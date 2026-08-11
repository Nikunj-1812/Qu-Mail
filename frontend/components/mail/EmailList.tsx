'use client';

import React, { useState } from 'react';
import { EncryptedEmailListItem, SecurityLevel } from '@/types/mail';
import { EmailCard } from './EmailCard';
import { EmailDetailModal } from './EmailDetailModal';
import { Button } from '@/components/ui/Button';
import { RefreshCw, Search, Filter, Mail, Inbox as InboxIcon } from 'lucide-react';

interface EmailListProps {
  emails: EncryptedEmailListItem[];
  isInbox: boolean;
  isLoading: boolean;
  onRefresh: () => void;
}

export const EmailList: React.FC<EmailListProps> = ({
  emails,
  isInbox,
  isLoading,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<SecurityLevel | 'all'>('all');
  const [selectedEmailId, setSelectedEmailId] = useState<number | null>(null);

  const filteredEmails = emails.filter((email) => {
    const query = searchTerm.toLowerCase();
    const otherUser = isInbox ? email.sender.username : email.recipient.username;
    const matchesSearch =
      email.subject.toLowerCase().includes(query) ||
      otherUser.toLowerCase().includes(query);

    const matchesLevel =
      selectedLevel === 'all' || email.security_level === selectedLevel;

    return matchesSearch && matchesLevel;
  });

  return (
    <div>
      {/* Controls Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={16}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Search by subject or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>

          <select
            className="form-control"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value === 'all' ? 'all' : (parseInt(e.target.value) as SecurityLevel))}
            style={{ width: 'auto', minWidth: '130px' }}
          >
            <option value="all">All Levels</option>
            <option value="1">Level 1 (Plain)</option>
            <option value="2">Level 2 (Kyber+AES)</option>
            <option value="3">Level 3 (OTP)</option>
          </select>
        </div>

        <Button
          variant="switch"
          onClick={onRefresh}
          isLoading={isLoading}
          icon={<RefreshCw size={14} />}
        >
          Refresh
        </Button>
      </div>

      {/* Email List Render */}
      {filteredEmails.length === 0 ? (
        <div
          style={{
            padding: '3rem 1.5rem',
            textAlign: 'center',
            background: 'var(--bg-glass)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-color)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(56, 189, 248, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
            }}
          >
            <InboxIcon size={24} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            No messages found
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {searchTerm || selectedLevel !== 'all'
              ? 'Try adjusting your search query or security level filter.'
              : isInbox
              ? 'Your inbox is clear. When someone sends an encrypted message, it will appear here.'
              : 'You have not sent any encrypted messages yet.'}
          </p>
        </div>
      ) : (
        <div>
          {filteredEmails.map((email) => (
            <EmailCard
              key={email.id}
              email={email}
              isInbox={isInbox}
              onClick={() => setSelectedEmailId(email.id)}
            />
          ))}
        </div>
      )}

      {/* Email Detail Modal */}
      <EmailDetailModal
        emailId={selectedEmailId}
        onClose={() => setSelectedEmailId(null)}
        onDeleted={() => {
          setSelectedEmailId(null);
          onRefresh();
        }}
      />
    </div>
  );
};
