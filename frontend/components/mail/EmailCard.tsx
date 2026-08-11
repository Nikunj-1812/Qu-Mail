'use client';

import React from 'react';
import { EncryptedEmailListItem } from '@/types/mail';
import { Badge } from '@/components/ui/Badge';
import { User, Calendar, Lock } from 'lucide-react';

interface EmailCardProps {
  email: EncryptedEmailListItem;
  isInbox: boolean;
  onClick: () => void;
}

export const EmailCard: React.FC<EmailCardProps> = ({ email, isInbox, onClick }) => {
  const otherUser = isInbox ? email.sender.username : email.recipient.username;
  const isUnread = isInbox && !email.is_read;
  const dateStr = new Date(email.timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const levelName =
    email.security_level === 1
      ? 'L1 Plaintext'
      : email.security_level === 2
      ? 'L2 Kyber+AES'
      : 'L3 Quantum OTP';

  return (
    <div
      className={`email-item ${isUnread ? 'unread' : ''}`}
      onClick={onClick}
      style={{
        border: '1px solid var(--border-color)',
        marginBottom: '0.65rem',
        background: isUnread ? 'rgba(56, 189, 248, 0.04)' : 'var(--bg-glass)',
      }}
    >
      <div className="email-item-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {isUnread && (
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--accent-cyan)',
                display: 'inline-block',
                boxShadow: '0 0 8px var(--accent-cyan)',
              }}
            />
          )}
          <span className="email-item-title">{email.subject}</span>
        </div>
        <Badge level={email.security_level}>{levelName}</Badge>
      </div>

      <div className="email-item-sub">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <User size={13} color="var(--text-muted)" />
          <span>
            {isInbox ? 'From:' : 'To:'} <strong style={{ color: 'var(--text-primary)' }}>{otherUser}</strong>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Calendar size={13} color="var(--text-muted)" />
          <span>{dateStr}</span>
        </div>
      </div>
    </div>
  );
};
