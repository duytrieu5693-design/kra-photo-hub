import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../api/client';
import type { SystemStatus, LogEntry } from '../api/client';

export function SystemStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.getStatus(),
      api.getLogs(50),
    ]).then(([statusRes, logsRes]) => {
      setLoading(false);
      if (statusRes.success && statusRes.data) setStatus(statusRes.data);
      if (logsRes.success && logsRes.data) setLogs(logsRes.data);
    }).catch(() => {
      setLoading(false);
      setError('Could not reach server');
    });
  }, []);

  function handleRefresh() {
    setLoading(true);
    setError('');
    Promise.all([
      api.getStatus(),
      api.getLogs(50),
    ]).then(([statusRes, logsRes]) => {
      setLoading(false);
      if (statusRes.success && statusRes.data) setStatus(statusRes.data);
      if (logsRes.success && logsRes.data) setLogs(logsRes.data);
    }).catch(() => {
      setLoading(false);
      setError('Could not reach server');
    });
  }

  return (
    <Layout title="System Status" back="/">
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="card text-center">
          <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto' }} />
        </div>
      ) : (
        <>
          <div className="card mb-16">
            <div className="card-title">System Health</div>
            <StatusRow label="Server" value={status?.server_running} />
            <StatusRow label="Storage" value={status?.storage_available} />
            <StatusRow label="NAS" value={status?.nas_connected} />
            <StatusRow label="Import Running" value={status?.current_import} invertColor />
            {status?.photo_library_path && (
              <>
                <hr className="divider" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Library Path</span>
                  <span className="text-xs font-mono" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', direction: 'rtl', whiteSpace: 'nowrap' }}>
                    {status.photo_library_path}
                  </span>
                </div>
              </>
            )}
            {status?.storage_used_bytes !== undefined && status.storage_used_bytes > 0 && (
              <div className="flex items-center justify-between text-sm mt-8">
                <span className="text-muted">Storage Used</span>
                <span>{formatBytes(status.storage_used_bytes)}</span>
              </div>
            )}
          </div>

          <button className="btn btn-ghost mb-16" onClick={handleRefresh}>
            🔄 Refresh Status
          </button>

          {/* Logs */}
          <div className="card-title">System Logs</div>
          <div className="card" style={{ padding: '8px 16px' }}>
            {logs.length === 0 ? (
              <div className="text-muted text-sm text-center" style={{ padding: 16 }}>No logs yet</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="log-item">
                  <div className="flex items-center gap-8 mb-4">
                    <span className={`badge badge-${log.level === 'error' ? 'error' : log.level === 'warning' ? 'pending' : 'info'}`} style={{ padding: '2px 8px' }}>
                      {log.level}
                    </span>
                    <span className="text-xs text-muted font-mono">{log.event}</span>
                    <span className="log-time" style={{ marginLeft: 'auto' }}>{formatTime(log.time)}</span>
                  </div>
                  <div className="text-sm">{log.message}</div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </Layout>
  );
}

function StatusRow({ label, value, invertColor }: { label: string; value: boolean | undefined; invertColor?: boolean }) {
  const isGood = invertColor ? !value : value;
  return (
    <div className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <span className="text-sm text-muted">{label}</span>
      <span className="flex items-center gap-8">
        <span className={`status-dot ${isGood ? 'ok' : 'error'}`} />
        <span className="text-sm">{value === undefined ? '—' : value ? 'YES' : 'NO'}</span>
      </span>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString();
  } catch {
    return iso;
  }
}
