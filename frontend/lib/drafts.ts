import { SecurityLevel } from '@/types/mail';

export interface DraftAttachment {
  name: string;
  size: number;
}

export interface DraftEmail {
  id: string;
  recipient_username: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  security_level: SecurityLevel;
  passphrase?: string;
  attachments?: DraftAttachment[];
  updatedAt: string;
}

const STORAGE_KEY = 'qm_drafts';

export const draftsStore = {
  getAll(): DraftEmail[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  save(draft: Partial<DraftEmail>, id?: string): DraftEmail {
    const drafts = this.getAll();
    const now = new Date().toISOString();

    const targetId = id || `draft_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const existingIndex = drafts.findIndex((d) => d.id === targetId);

    const updatedDraft: DraftEmail = {
      id: targetId,
      recipient_username: draft.recipient_username || '',
      cc: draft.cc || '',
      bcc: draft.bcc || '',
      subject: draft.subject || '',
      body: draft.body || '',
      security_level: draft.security_level || 2,
      passphrase: draft.passphrase,
      attachments: draft.attachments || [],
      updatedAt: now,
    };

    if (existingIndex >= 0) {
      drafts[existingIndex] = updatedDraft;
    } else {
      drafts.unshift(updatedDraft);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    }
    return updatedDraft;
  },

  delete(id: string): void {
    const drafts = this.getAll().filter((d) => d.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    }
  },
};
