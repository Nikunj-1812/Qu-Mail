'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ComposeModal } from '@/components/compose/ComposeModal';
import { Button } from '@/components/ui/Button';
import { UserProfileCard } from '@/components/layout/UserProfileCard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Edit3 } from 'lucide-react';

export default function ComposePage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(true);

  return (
    <ProtectedRoute>
      <div className="container-app">
        <div className="grid-main">
          <aside>
            <UserProfileCard />
          </aside>

          <section>
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <Edit3 size={36} color="var(--accent-cyan)" style={{ margin: '0 auto 1rem auto' }} />
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Compose Encrypted Email</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Craft post-quantum encrypted communications with Kyber-1024, Dilithium, and AES-256-GCM.
              </p>
              <Button variant="primary" onClick={() => setIsOpen(true)}>
                Open Compose Window
              </Button>
            </div>
          </section>
        </div>

        <ComposeModal
          isOpen={isOpen}
          onClose={() => router.push('/inbox')}
          onSuccess={() => router.push('/sent')}
        />
      </div>
    </ProtectedRoute>
  );
}

