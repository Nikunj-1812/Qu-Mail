'use client';

import React from 'react';
import { DraftsList } from '@/components/mail/DraftsList';
import { UserProfileCard } from '@/components/layout/UserProfileCard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { FileEdit } from 'lucide-react';

export default function DraftsPage() {
  return (
    <ProtectedRoute>
      <div className="container-app">
        <div className="grid-main">
          <aside>
            <UserProfileCard />
          </aside>

          <section>
            <div className="card">
              <div className="card-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileEdit size={20} color="#0284c7" />
                  <span>Drafts — Saved Messages</span>
                </div>
              </div>
              <DraftsList />
            </div>
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}

