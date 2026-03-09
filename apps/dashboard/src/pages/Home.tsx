import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { api } from '../api/client';
import type { SystemStatus, LogEntry } from '../api/client';

export function Home() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    api.getStatus().then(r => { if (r.success && r.data) setStatus(r.data); });
    api.getLogs(5).then(r => { if (r.success && r.data) setLogs(r.data); });
  }, []);

  return (
    <Layout title="KRA Photo Hub">
      {/* Status bar */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Server</span>
          <span>
            <span className={`status-dot ${status?.server_running ? 'ok' : 'error'}`} />
            <span className="text-sm">{status?.server_running ? 'Running' : 'Offline'}</span>
          </span>
        </div>
        <div className="flex items-center justify-between mt-8">
          <span className="text-sm text-muted">Storage</span>
          <span>
            <span className={`status-dot ${status?.storage_available ? 'ok' : 'error'}`} />
            <span className="text-sm">{status?.storage_available ? 'OK' : 'Error'}</span>
          </span>
        </div>
        {status?.current_import && (
          <div className="alert alert-info mt-12" style={{ marginBottom: 0 }}>
            📥 Import in progress — <Link to="/import" style={{ color: 'var(--accent-light)' }}>View progress</Link>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="card-title">Quick Actions</div>
      <div className="action-grid mb-16">
        <Link to="/import" className="action-card">
          <span className="action-card-icon">📥</span>
          <span className="action-card-label">Import Photos</span>
        </Link>
        <Link to="/batch/create" className="action-card">
          <span className="action-card-icon">📦</span>
          <span className="action-card-label">Create Batch</span>
        </Link>
        <Link to="/batches" className="action-card">
          <span className="action-card-icon">📋</span>
          <span className="action-card-label">Batch History</span>
        </Link>
        <Link to="/status" className="action-card">
          <span className="action-card-icon">⚙️</span>
          <span className="action-card-label">System Status</span>
        </Link>
      </div>

      {/* Recent activity */}
      {logs.length > 0 && (
        <>
          <div className="card-title">Recent Activity</div>
          <div className="card" style={{ padding: '8px 16px' }}>
            {logs.map((log, i) => (
              <div key={i} className="activity-item">
                <div className="activity-dot" />
                <div>
                  <div className="text-sm">{log.message}</div>
                  <div className="log-time">{formatTime(log.time)}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
