'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mailApi } from '@/lib/api/mail';
import { EncryptedEmailListItem } from '@/types/mail';
import { EmailList } from '@/components/mail/EmailList';
import { ComposeModal } from '@/components/compose/ComposeModal';
import { Button } from '@/components/ui/Button';
import { UserProfileCard } from '@/components/layout/UserProfileCard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Plus, Inbox as InboxIcon } from 'lucide-react';


export default function InboxPage() {
  const { user, token } = useAuth();
  const [emails, setEmails] = useState<EncryptedEmailListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isComposeOpen, setIsComposeOpen] = useState<boolean>(false);

  const fetchInbox = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await mailApi.getInbox(token);
      setEmails(data);
    } catch (err) {
      console.error('Inbox fetch error', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchInbox();
    } else {
      setEmails([]);
    }
  }, [token, fetchInbox]);

  return (
    <ProtectedRoute>
      <div className="container-app">
        <div className="grid-main">
          <aside>
            <UserProfileCard />
            <div className="card">
              <Button
                variant="primary"
                style={{ width: '100%', padding: '0.75rem 1rem' }}
                onClick={() => setIsComposeOpen(true)}
                icon={<Plus size={18} />}
              >
                Compose Quantum Email
              </Button>
            </div>
          </aside>

          <section>
            <div className="card">
              <div className="card-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <InboxIcon size={20} color="var(--accent-cyan)" />
                  <span>Inbox — Received Messages</span>
                </div>
              </div>
              <EmailList
                emails={emails}
                isInbox={true}
                isLoading={isLoading}
                onRefresh={fetchInbox}
              />
            </div>
          </section>
        </div>

        <ComposeModal
          isOpen={isComposeOpen}
          onClose={() => setIsComposeOpen(false)}
          onSuccess={fetchInbox}
        />
      </div>
    </ProtectedRoute>
  );
}

