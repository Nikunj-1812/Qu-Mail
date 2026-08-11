'use client';

import React, { useState, useEffect } from 'react';
import { draftsStore, DraftEmail } from '@/lib/drafts';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ComposeModal } from '@/components/compose/ComposeModal';
import { useToast } from '@/context/ToastContext';
import { FileEdit, Trash2, Clock, User, Plus } from 'lucide-react';

export const DraftsList: React.FC = () => {
  const { showToast } = useToast();
  const [drafts, setDrafts] = useState<DraftEmail[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<DraftEmail | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState<boolean>(false);
  const [draftToDelete, setDraftToDelete] = useState<string | null>(null);

  const loadDrafts = () => {
    setDrafts(draftsStore.getAll());
  };

  useEffect(() => {
    loadDrafts();
  }, []);

  const handleDeleteTrigger = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDraftToDelete(id);
  };

  const confirmDeleteDraft = () => {
    if (draftToDelete) {
      draftsStore.delete(draftToDelete);
      showToast('Draft deleted.', 'info');
      setDraftToDelete(null);
      loadDrafts();
    }
  };

  const handleOpenDraft = (draft: DraftEmail) => {
    setSelectedDraft(draft);
    setIsComposeOpen(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {drafts.length} saved draft{drafts.length !== 1 ? 's' : ''} in local storage
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setSelectedDraft(null);
            setIsComposeOpen(true);
          }}
          icon={<Plus size={15} />}
        >
          New Draft
        </Button>
      </div>

      {drafts.length === 0 ? (
        <div
          style={{
            padding: '3rem 1.5rem',
            textAlign: 'center',
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-color)',
          }}
        >
          <FileEdit size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            No drafts saved
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            When composing an email, click "Save Draft" to resume writing later.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.65rem' }}>
          {drafts.map((draft) => {
            const dateStr = new Date(draft.updatedAt).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={draft.id}
                className="email-item"
                onClick={() => handleOpenDraft(draft)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#ffffff',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span className="email-item-title">{draft.subject || '(Untitled Draft)'}</span>
                    <Badge level={draft.security_level}>
                      {draft.security_level === 1 ? 'L1' : draft.security_level === 2 ? 'L2' : 'L3'}
                    </Badge>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <User size={13} color="var(--text-muted)" />
                      To: <strong>{draft.recipient_username || 'Unspecified'}</strong>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={13} color="var(--text-muted)" />
                      {dateStr}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn-switch"
                    onClick={(e) => handleDeleteTrigger(e, draft.id)}
                    style={{ color: '#e11d48', padding: '0.35rem 0.55rem' }}
                    title="Delete Draft"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(draftToDelete)}
        onClose={() => setDraftToDelete(null)}
        onConfirm={confirmDeleteDraft}
        title="Delete Draft"
        message="Are you sure you want to discard this draft email?"
        confirmLabel="Discard Draft"
        isDanger={true}
      />

      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => {
          setIsComposeOpen(false);
          setSelectedDraft(null);
          loadDrafts();
        }}
        onSuccess={() => {
          setIsComposeOpen(false);
          setSelectedDraft(null);
          loadDrafts();
        }}
        initialDraft={selectedDraft}
      />
    </div>
  );
};
