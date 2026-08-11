'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EnvelopeInspector } from './EnvelopeInspector';
import { ComposeModal } from '@/components/compose/ComposeModal';
import { EncryptedEmailDetail } from '@/types/mail';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { mailApi } from '@/lib/api/mail';
import { decodeBodyWithAttachments, ParsedAttachment } from '@/lib/attachments';
import {
  Trash2,
  Lock,
  User,
  Calendar,
  KeyRound,
  AlertTriangle,
  Reply,
  Copy,
  Check,
  Download,
  Paperclip,
  FileText,
} from 'lucide-react';

interface EmailDetailModalProps {
  emailId: number | null;
  onClose: () => void;
  onDeleted?: () => void;
}

export const EmailDetailModal: React.FC<EmailDetailModalProps> = ({
  emailId,
  onClose,
  onDeleted,
}) => {
  const { token, passphrase } = useAuth();
  const { showToast } = useToast();
  const [emailDetail, setEmailDetail] = useState<EncryptedEmailDetail | null>(null);
  const [customPassphrase, setCustomPassphrase] = useState<string>(passphrase || 'Demo@1234');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [isReplyOpen, setIsReplyOpen] = useState<boolean>(false);

  const fetchDetail = async (pass: string) => {
    if (!emailId || !token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await mailApi.getEmailDetail(emailId, token, pass);
      setEmailDetail(data);
    } catch (err: any) {
      setError(err.message || 'Failed to decrypt email.');
      showToast(err.message || 'Decryption failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (emailId && token) {
      fetchDetail(customPassphrase);
    } else {
      setEmailDetail(null);
    }
  }, [emailId, token]);

  const confirmDelete = async () => {
    if (!emailId || !token) return;
    setIsDeleting(true);
    try {
      await mailApi.deleteEmail(emailId, token);
      showToast('Email deleted successfully.', 'success');
      setShowDeleteConfirm(false);
      onClose();
      if (onDeleted) onDeleted();
    } catch (err: any) {
      showToast('Delete failed: ' + err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const parsed = emailDetail ? decodeBodyWithAttachments(emailDetail.decrypted_body) : { text: '', attachments: [] };

  const handleCopyBody = () => {
    if (!parsed.text) return;
    navigator.clipboard.writeText(parsed.text);
    setCopiedText(true);
    showToast('Decrypted text copied to clipboard.', 'success');
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleDownloadAttachment = (att: ParsedAttachment) => {
    if (!att.dataUrl) {
      showToast('Attachment data is not available.', 'error');
      return;
    }
    const link = document.createElement('a');
    link.href = att.dataUrl;
    link.download = att.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloading ${att.name}...`, 'info');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!emailId) return null;

  return (
    <>
      <Modal
        isOpen={Boolean(emailId)}
        onClose={onClose}
        title={
          emailDetail ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Lock size={18} color="#0284c7" />
              <span>{emailDetail.subject}</span>
            </div>
          ) : (
            'Reading Encrypted Email...'
          )
        }
        maxWidth="800px"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                variant="primary"
                onClick={() => setIsReplyOpen(true)}
                icon={<Reply size={15} />}
                style={{ fontSize: '0.8rem' }}
              >
                Reply
              </Button>
              <Button
                variant="secondary"
                onClick={handleCopyBody}
                icon={copiedText ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                style={{ fontSize: '0.8rem' }}
              >
                {copiedText ? 'Copied' : 'Copy Text'}
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
                isLoading={isDeleting}
                icon={<Trash2 size={14} />}
                style={{ fontSize: '0.8rem' }}
              >
                Delete
              </Button>
            </div>
            <Button variant="secondary" onClick={onClose} style={{ fontSize: '0.8rem' }}>
              Close
            </Button>
          </div>
        }
      >
        {isLoading && (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Decrypting cryptographic payload...
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              color: '#be123c',
              fontSize: '0.85rem',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              <AlertTriangle size={16} />
              <span>Decryption Error</span>
            </div>
            {error}
          </div>
        )}

        {emailDetail && (
          <div>
            {/* Header info */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.75rem',
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                marginBottom: '1.25rem',
                fontSize: '0.825rem',
              }}
            >
              <div>
                <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem' }}>From:</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {emailDetail.sender.username} ({emailDetail.sender.email})
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem' }}>To:</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {emailDetail.recipient.username} ({emailDetail.recipient.email})
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Date:</div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  {new Date(emailDetail.timestamp).toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Security Protocol:</div>
                <Badge level={emailDetail.security_level}>
                  {emailDetail.security_level === 1
                    ? 'Level 1: Plaintext'
                    : emailDetail.security_level === 2
                    ? 'Level 2: Kyber-1024 + AES-256'
                    : 'Level 3: Quantum OTP'}
                </Badge>
              </div>
            </div>

            {/* Passphrase Decryption input */}
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
                marginBottom: '1.25rem',
                padding: '0.65rem 0.85rem',
                background: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <KeyRound size={15} color="#0284c7" />
                <span>Passphrase:</span>
              </div>
              <input
                type="password"
                className="form-control"
                placeholder="Passphrase for private key decryption"
                value={customPassphrase}
                onChange={(e) => setCustomPassphrase(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem', flex: 1, minWidth: '180px' }}
              />
              <Button
                variant="switch"
                onClick={() => fetchDetail(customPassphrase)}
                style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}
              >
                Re-decrypt
              </Button>
            </div>

            {/* Decrypted Body */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#047857' }}>
                  ✓ Decrypted Message Body:
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {parsed.text.length} characters
                </div>
              </div>
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  fontSize: '0.925rem',
                  lineHeight: 1.6,
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                  minHeight: '80px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {parsed.text || '[Empty message body]'}
              </div>
            </div>

            {/* Decrypted Attachments for Receiver */}
            {parsed.attachments && parsed.attachments.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: '#0284c7', marginBottom: '0.5rem' }}>
                  <Paperclip size={16} />
                  <span>Decrypted Attachments ({parsed.attachments.length})</span>
                </div>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {parsed.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        background: '#f8fafc',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={18} color="#0284c7" />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                            {att.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {formatFileSize(att.size)}
                          </div>
                        </div>
                      </div>

                      {att.dataUrl ? (
                        <Button
                          variant="secondary"
                          onClick={() => handleDownloadAttachment(att)}
                          icon={<Download size={14} />}
                          style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                        >
                          Download
                        </Button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          File metadata only
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cryptographic Envelope Raw JSON */}
            <EnvelopeInspector payload={emailDetail.encrypted_payload} />
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Encrypted Email"
        message="Are you sure you want to permanently delete this email? This action cannot be undone."
        confirmLabel="Delete Email"
        isDanger={true}
        isLoading={isDeleting}
      />

      {/* Reply Modal */}
      {emailDetail && (
        <ComposeModal
          isOpen={isReplyOpen}
          onClose={() => setIsReplyOpen(false)}
          initialDraft={{
            id: 'reply_' + emailDetail.id,
            recipient_username: emailDetail.sender.username,
            subject: emailDetail.subject.startsWith('Re:') ? emailDetail.subject : `Re: ${emailDetail.subject}`,
            body: `\n\n--- Original Message from ${emailDetail.sender.username} ---\n${parsed.text}`,
            security_level: emailDetail.security_level,
            updatedAt: new Date().toISOString(),
          }}
        />
      )}
    </>
  );
};
