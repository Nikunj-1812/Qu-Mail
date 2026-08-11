'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { InterceptedPacket } from '@/types/network';
import { EnvelopeInspector } from '@/components/mail/EnvelopeInspector';
import { Radio, ArrowRight, Clock } from 'lucide-react';

interface PacketDetailModalProps {
  packet: InterceptedPacket | null;
  onClose: () => void;
}

export const PacketDetailModal: React.FC<PacketDetailModalProps> = ({ packet, onClose }) => {
  if (!packet) return null;

  return (
    <Modal
      isOpen={Boolean(packet)}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Radio size={18} color="var(--accent-rose)" />
          <span>Intercepted Wire Packet #{packet.id}</span>
        </div>
      }
      maxWidth="780px"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close Inspector
        </Button>
      }
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem',
          padding: '1rem',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          marginBottom: '1.25rem',
          fontSize: '0.825rem',
        }}
      >
        <div>
          <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Transmission Route:</div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>{packet.sender_username}</span>
            <ArrowRight size={14} color="var(--text-muted)" />
            <span>{packet.recipient_username}</span>
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Captured Timestamp:</div>
          <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={14} color="var(--text-muted)" />
            <span>{new Date(packet.intercepted_at).toLocaleString()}</span>
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Security Protocol:</div>
          <Badge level={packet.security_level}>
            {packet.security_level === 1
              ? 'Level 1: Plaintext'
              : packet.security_level === 2
              ? 'Level 2: Kyber+AES'
              : 'Level 3: Quantum OTP'}
          </Badge>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
          Attacker Analysis
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {packet.security_level === 1
            ? '⚠️ VULNERABLE: Cleartext body is unencrypted and visible to anyone intercepting network traffic on this link.'
            : packet.security_level === 2
            ? '🛡️ SECURE: Kyber-1024 KEM encapsulated key and 256-bit AES-GCM ciphertext prevent eavesdroppers from reading the content.'
            : '🔒 UNBREAKABLE: One-Time Pad XOR encryption provides theoretical mathematical secrecy against all adversaries.'}
        </p>
      </div>

      <EnvelopeInspector payload={packet.raw_payload} />
    </Modal>
  );
};
