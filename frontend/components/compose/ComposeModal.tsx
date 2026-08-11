'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SecurityLevelSelector } from './SecurityLevelSelector';
import { SecurityLevel } from '@/types/mail';
import { User } from '@/types/auth';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { authApi } from '@/lib/api/auth';
import { mailApi } from '@/lib/api/mail';
import { draftsStore, DraftEmail } from '@/lib/drafts';
import { encodeBodyWithAttachments } from '@/lib/attachments';
import { Send, Lock, Paperclip, FileText, Trash2, BookmarkCheck, Plus, ShieldCheck } from 'lucide-react';

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type?: string;
  dataUrl?: string;
}

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialDraft?: DraftEmail | null;
}

export const ComposeModal: React.FC<ComposeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialDraft,
}) => {
  const { user, token, passphrase: authPassphrase } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [draftId, setDraftId] = useState<string | undefined>(undefined);
  const [recipient, setRecipient] = useState<string>('bob_demo');
  const [showCc, setShowCc] = useState<boolean>(false);
  const [showBcc, setShowBcc] = useState<boolean>(false);
  const [cc, setCc] = useState<string>('');
  const [bcc, setBcc] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [securityLevel, setSecurityLevel] = useState<SecurityLevel>(2);
  const [passphrase, setPassphrase] = useState<string>(authPassphrase || 'Demo@1234');
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialDraft) {
      setDraftId(initialDraft.id);
      setRecipient(initialDraft.recipient_username);
      setCc(initialDraft.cc || '');
      setBcc(initialDraft.bcc || '');
      if (initialDraft.cc) setShowCc(true);
      if (initialDraft.bcc) setShowBcc(true);
      setSubject(initialDraft.subject);
      setBody(initialDraft.body);
      setSecurityLevel(initialDraft.security_level);
      if (initialDraft.passphrase) setPassphrase(initialDraft.passphrase);
      if (initialDraft.attachments) {
        setAttachments(
          initialDraft.attachments.map((a, i) => ({ id: String(i), name: a.name, size: a.size }))
        );
      }
    } else if (isOpen) {
      setDraftId(undefined);
      setSubject('');
      setBody('');
      setAttachments([]);
      setError(null);
    }
  }, [initialDraft, isOpen]);

  useEffect(() => {
    if (isOpen && token) {
      authApi.getUsers(token)
        .then((users) => {
          setUsersList(users.filter((u) => u.username !== user?.username));
          if (users.length > 0 && !recipient) {
            const firstOther = users.find((u) => u.username !== user?.username);
            if (firstOther) setRecipient(firstOther.username);
          }
        })
        .catch((err) => console.error('Failed to fetch users list', err));
    }
  }, [isOpen, token, user]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setAttachments((prev) => [
          ...prev,
          {
            id: `${file.name}_${Date.now()}_${Math.random()}`,
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl,
          },
        ]);
        showToast(`Attached ${file.name}`, 'info');
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSaveDraft = () => {
    draftsStore.save(
      {
        recipient_username: recipient,
        cc,
        bcc,
        subject: subject || '(Untitled Draft)',
        body,
        security_level: securityLevel,
        passphrase,
        attachments: attachments.map((a) => ({ name: a.name, size: a.size })),
      },
      draftId
    );
    showToast('Draft saved to local storage.', 'success');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Please log in first.');
      showToast('Please log in first.', 'error');
      return;
    }
    if (!recipient.trim()) {
      setError('Please specify a recipient.');
      return;
    }
    if (!subject.trim()) {
      setError('Please specify a subject.');
      return;
    }
    if (!body.trim()) {
      setError('Please specify a message body.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const finalEncryptedBody = encodeBodyWithAttachments(body.trim(), attachments);

    try {
      await mailApi.composeEmail(
        {
          recipient_username: recipient.trim(),
          subject: subject.trim(),
          body: finalEncryptedBody,
          security_level: securityLevel,
          passphrase: passphrase.trim() || 'Demo@1234',
        },
        token
      );

      if (draftId) {
        draftsStore.delete(draftId);
      }

      showToast('Message encrypted and sent successfully!', 'success');
      setSubject('');
      setBody('');
      setAttachments([]);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to encrypt and send email.');
      showToast(err.message || 'Failed to send encrypted email.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lock size={18} color="#0284c7" />
          <span>Compose Quantum Encrypted Email</span>
        </div>
      }
      maxWidth="740px"
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              color: '#be123c',
              fontSize: '0.85rem',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        {/* To / CC / BCC */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label className="form-label" style={{ margin: 0 }}>To (Recipient)</label>
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
              {!showCc && (
                <button
                  type="button"
                  className="btn-switch"
                  style={{ padding: '0.15rem 0.45rem', fontSize: '0.75rem' }}
                  onClick={() => setShowCc(true)}
                >
                  + CC
                </button>
              )}
              {!showBcc && (
                <button
                  type="button"
                  className="btn-switch"
                  style={{ padding: '0.15rem 0.45rem', fontSize: '0.75rem' }}
                  onClick={() => setShowBcc(true)}
                >
                  + BCC
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select
              className="form-control"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              style={{ flex: 1 }}
            >
              {usersList.map((u) => (
                <option key={u.username} value={u.username}>
                  {u.username} ({u.email})
                </option>
              ))}
              {!usersList.some((u) => u.username === recipient) && (
                <option value={recipient}>{recipient}</option>
              )}
            </select>
            <input
              type="text"
              className="form-control"
              placeholder="Or custom username..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
        </div>

        {showCc && (
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">CC</label>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer' }}
                onClick={() => {
                  setShowCc(false);
                  setCc('');
                }}
              >
                Remove CC
              </button>
            </div>
            <input
              type="text"
              className="form-control"
              placeholder="cc_user@qumail.test"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
            />
          </div>
        )}

        {showBcc && (
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">BCC</label>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer' }}
                onClick={() => {
                  setShowBcc(false);
                  setBcc('');
                }}
              >
                Remove BCC
              </button>
            </div>
            <input
              type="text"
              className="form-control"
              placeholder="bcc_user@qumail.test"
              value={bcc}
              onChange={(e) => setBcc(e.target.value)}
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Subject</label>
          <input
            type="text"
            className="form-control"
            placeholder="Top Secret Operations Plan"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

        <SecurityLevelSelector value={securityLevel} onChange={setSecurityLevel} />

        <div className="form-group">
          <label className="form-label">Message Body</label>
          <textarea
            className="form-control"
            placeholder="Write your secret quantum communication..."
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Sender Passphrase (unlocks signing key)</label>
          <input
            type="password"
            className="form-control"
            placeholder="Demo@1234"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Default for pre-seeded accounts is <code>Demo@1234</code>.
          </span>
        </div>

        {/* Phase 9 Attachment UI */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Paperclip size={15} color="#0284c7" />
              <span>Attachments ({attachments.length})</span>
            </label>
            <button
              type="button"
              className="btn-switch"
              onClick={() => fileInputRef.current?.click()}
              style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <Plus size={14} />
              <span>Attach files</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              multiple
              onChange={handleFileUpload}
            />
          </div>

          {attachments.length > 0 && (
            <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {attachments.map((file) => (
                <div
                  key={file.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    background: '#f8fafc',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.825rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={16} color="#0284c7" />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{file.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatFileSize(file.size)}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(file.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#e11d48',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                    }}
                  >
                    <Trash2 size={13} />
                    <span>Remove</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {attachments.length > 0 && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#065f46',
                fontSize: '0.775rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <ShieldCheck size={16} color="#059669" />
              <div>
                <strong>End-to-End Encrypted:</strong> All {attachments.length} attachment{attachments.length > 1 ? 's' : ''} will be encrypted inside the Kyber/AES post-quantum ciphertext for the receiver to download.
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="modal-footer" style={{ padding: '1rem 0 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleSaveDraft}
            icon={<BookmarkCheck size={15} />}
          >
            Save Draft
          </Button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              icon={<Send size={15} />}
            >
              Send Encrypted Email
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
