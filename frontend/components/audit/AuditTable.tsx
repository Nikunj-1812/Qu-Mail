'use client';

import React, { useState, useMemo } from 'react';
import { InterceptedPacket } from '@/types/network';
import { SecurityLevel } from '@/types/mail';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PacketDetailModal } from './PacketDetailModal';
import {
  Search,
  RefreshCw,
  Radio,
  ArrowRight,
  Eye,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface AuditTableProps {
  packets: InterceptedPacket[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const AuditTable: React.FC<AuditTableProps> = ({ packets, isLoading, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedPacket, setSelectedPacket] = useState<InterceptedPacket | null>(null);

  const pageSize = 10;

  // Filter packets
  const filteredPackets = useMemo(() => {
    return packets.filter((p) => {
      const query = searchTerm.toLowerCase();
      const matchesQuery =
        p.sender_username.toLowerCase().includes(query) ||
        p.recipient_username.toLowerCase().includes(query) ||
        JSON.stringify(p.raw_payload).toLowerCase().includes(query);

      // Event filtering
      let matchesEvent = true;
      if (selectedEvent === 'packet') matchesEvent = true;
      else if (selectedEvent === 'l1') matchesEvent = p.security_level === 1;
      else if (selectedEvent === 'l2') matchesEvent = p.security_level === 2;
      else if (selectedEvent === 'l3') matchesEvent = p.security_level === 3;

      // Status filtering
      let matchesStatus = true;
      if (selectedStatus === 'encrypted') matchesStatus = p.security_level >= 2;
      else if (selectedStatus === 'plaintext') matchesStatus = p.security_level === 1;

      // Date filtering
      let matchesDate = true;
      if (selectedDate) {
        const pDate = new Date(p.intercepted_at).toISOString().split('T')[0];
        matchesDate = pDate === selectedDate;
      }

      return matchesQuery && matchesEvent && matchesStatus && matchesDate;
    });
  }, [packets, searchTerm, selectedEvent, selectedStatus, selectedDate]);

  const totalPages = Math.ceil(filteredPackets.length / pageSize) || 1;
  const paginatedPackets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPackets.slice(start, start + pageSize);
  }, [filteredPackets, currentPage]);

  return (
    <div className="card">
      <div className="card-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Radio size={20} color="#e11d48" />
          <span>AUDIT REPORT & WIRE LOG</span>
        </div>
        <Button
          variant="switch"
          onClick={onRefresh}
          isLoading={isLoading}
          icon={<RefreshCw size={14} />}
        >
          Refresh Audit Data
        </Button>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
        Real-time audit log tracking cryptographic network transmissions, key encapsulations, and wire packet captures.
      </p>

      {/* Audit Filters Bar (Search, Event, Status, Date) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.25rem',
          background: '#f8fafc',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Search */}
        <div>
          <label className="form-label" style={{ marginBottom: '0.25rem' }}>Search</label>
          <div style={{ position: 'relative' }}>
            <Search
              size={14}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Filter user or payload..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{ paddingLeft: '2rem', fontSize: '0.8rem', padding: '0.45rem 0.65rem 0.45rem 2rem' }}
            />
          </div>
        </div>

        {/* Event */}
        <div>
          <label className="form-label" style={{ marginBottom: '0.25rem' }}>Event</label>
          <select
            className="form-control"
            value={selectedEvent}
            onChange={(e) => {
              setSelectedEvent(e.target.value);
              setCurrentPage(1);
            }}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.65rem' }}
          >
            <option value="all">All Events</option>
            <option value="packet">Wire Packet Intercepted</option>
            <option value="l2">Kyber+AES Encapsulation (L2)</option>
            <option value="l3">Quantum OTP XOR (L3)</option>
            <option value="l1">Plaintext Transmission (L1)</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="form-label" style={{ marginBottom: '0.25rem' }}>Status</label>
          <select
            className="form-control"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.65rem' }}
          >
            <option value="all">All Statuses</option>
            <option value="encrypted">Encrypted & Signed (Success)</option>
            <option value="plaintext">Unencrypted Cleartext (Vulnerable)</option>
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="form-label" style={{ marginBottom: '0.25rem' }}>Date</label>
          <input
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setCurrentPage(1);
            }}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.65rem' }}
          />
        </div>
      </div>

      {/* Audit Table */}
      <div className="wire-table-wrapper">
        <table className="wire-log-table">
          <thead>
            <tr>
              <th style={{ width: '110px' }}>Time</th>
              <th style={{ width: '180px' }}>Event</th>
              <th style={{ width: '220px' }}>Transmission Route</th>
              <th style={{ width: '130px' }}>Status</th>
              <th>Raw Cryptographic Payload</th>
              <th style={{ width: '70px', textAlign: 'center' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPackets.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  {isLoading ? 'Loading audit records...' : 'No audit records matching criteria.'}
                </td>
              </tr>
            ) : (
              paginatedPackets.map((p) => {
                const dateObj = new Date(p.intercepted_at);
                const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const isEncrypted = p.security_level >= 2;
                const eventName =
                  p.security_level === 1
                    ? 'Plaintext Send'
                    : p.security_level === 2
                    ? 'Kyber KEM Encrypt'
                    : 'Quantum OTP Encrypt';

                return (
                  <tr key={p.id}>
                    <td>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.775rem', fontWeight: 600 }}>
                        {timeStr}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.825rem' }}>
                        {eventName}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        Packet #{p.id}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem' }}>
                        <strong style={{ color: '#0284c7' }}>{p.sender_username}</strong>
                        <ArrowRight size={12} color="var(--text-muted)" />
                        <strong style={{ color: '#059669' }}>{p.recipient_username}</strong>
                      </div>
                    </td>
                    <td>
                      {isEncrypted ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            color: '#047857',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: '#d1fae5',
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                          }}
                        >
                          <CheckCircle2 size={12} />
                          <span>Protected</span>
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            color: '#be123c',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: '#ffe4e6',
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                          }}
                        >
                          <AlertCircle size={12} />
                          <span>Cleartext</span>
                        </span>
                      )}
                    </td>
                    <td>
                      <pre
                        className="raw-code"
                        style={{
                          maxHeight: '75px',
                          cursor: 'pointer',
                          background: '#ffffff',
                        }}
                        onClick={() => setSelectedPacket(p)}
                        title="Click to view full payload inspector"
                      >
                        {JSON.stringify(p.raw_payload)}
                      </pre>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Button
                        variant="switch"
                        onClick={() => setSelectedPacket(p)}
                        style={{ padding: '0.3rem 0.5rem' }}
                        title="Inspect Record"
                      >
                        <Eye size={13} />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div>
          Showing {filteredPackets.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, filteredPackets.length)} of {filteredPackets.length} events
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <Button
            variant="switch"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            icon={<ChevronLeft size={14} />}
          >
            Prev
          </Button>
          <span style={{ padding: '0 0.5rem', fontWeight: 600 }}>
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="switch"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            icon={<ChevronRight size={14} />}
          >
            Next
          </Button>
        </div>
      </div>

      <PacketDetailModal
        packet={selectedPacket}
        onClose={() => setSelectedPacket(null)}
      />
    </div>
  );
};
