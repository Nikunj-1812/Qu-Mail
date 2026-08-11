import { getApiBaseUrl } from '@/lib/constants';
import { ComposePayload, EncryptedEmailDetail, EncryptedEmailListItem } from '@/types/mail';

export const mailApi = {
  async getInbox(token: string): Promise<EncryptedEmailListItem[]> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/mail/inbox/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error('Failed to fetch inbox.');
    }
    return res.json();
  },

  async getSent(token: string): Promise<EncryptedEmailListItem[]> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/mail/sent/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error('Failed to fetch sent emails.');
    }
    return res.json();
  },

  async getEmailDetail(id: number, token: string, passphrase?: string): Promise<EncryptedEmailDetail> {
    const baseUrl = getApiBaseUrl();
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    if (passphrase) {
      headers['X-Passphrase'] = passphrase;
    }

    const res = await fetch(`${baseUrl}/api/mail/${id}/`, {
      headers,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to fetch email details.');
    }
    return res.json();
  },

  async composeEmail(payload: ComposePayload, token: string): Promise<EncryptedEmailDetail> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/mail/compose/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to send encrypted email.');
    }
    return res.json();
  },

  async deleteEmail(id: number, token: string): Promise<{ detail: string }> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/mail/${id}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to delete email.');
    }
    return res.json();
  },
};
