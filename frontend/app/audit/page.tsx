'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { networkApi } from '@/lib/api/network';
import { InterceptedPacket } from '@/types/network';
import { AuditTable } from '@/components/audit/AuditTable';
import { UserProfileCard } from '@/components/layout/UserProfileCard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function AuditPage() {
  const [packets, setPackets] = useState<InterceptedPacket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchPackets = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await networkApi.getWireLog();
      setPackets(data);
    } catch (err) {
      console.error('Failed to load wire packets', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackets();
  }, [fetchPackets]);

  return (
    <ProtectedRoute>
      <div className="container-app">
        <div className="grid-main">
          <aside>
            <UserProfileCard />
            <div className="card">
              <div className="card-title" style={{ fontSize: '0.9rem' }}>
                Simulated Wire Integrity
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                All emails sent through QuMail are mirrored into the network interceptor log. Eavesdroppers cannot reverse Kyber-1024 or OTP payloads without the appropriate private keys.
              </p>
            </div>
          </aside>

          <section>
            <AuditTable
              packets={packets}
              isLoading={isLoading}
              onRefresh={fetchPackets}
            />
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}

