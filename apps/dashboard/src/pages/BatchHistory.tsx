import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { api } from '../api/client';
import type { Batch } from '../api/client';

export function BatchHistory() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.listBatches().then(res => {
      setLoading(false);
      if (res.success && res.data) {
        setBatches(res.data);
      } else {
        setError(res.error || 'Failed to load batches');
      }
    }).catch(() => {
      setLoading(false);
      setError('Could not reach server');
    });
  }, []);

  if (loading) {
    return (
      <Layout title="Batch History" back="/">
        <div className="card text-center">
          <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto' }} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Batch History" back="/">
      {error && <div className="alert alert-error">{error}</div>}

      {batches.length === 0 ? (
        <div className="card text-center">
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <div className="text-lg font-bold mb-8">No batches yet</div>
          <div className="text-muted text-sm mb-16">Create a batch from the Batch screen</div>
          <Link to="/batch/create" className="btn btn-primary">
            Create First Batch
          </Link>
        </div>
      ) : (
        <>
          <div className="card-title">{batches.length} Batch{batches.length !== 1 ? 'es' : ''}</div>
          {batches.map(batch => (
            <Link key={batch.id} to={`/batches/${batch.id}`} className="batch-item">
              <div style={{ flex: 1 }}>
                <div className="font-bold text-sm mb-4">{formatSessionTime(batch.start_time, batch.end_time)}</div>
                <div className="text-muted text-xs mb-4">{batch.photo_count} photos</div>
                <div className="text-xs text-muted">{formatDateTime(batch.created_at)}</div>
              </div>
              <div>
                <span className={`badge badge-${batch.delivery_status}`}>
                  {batch.delivery_status}
                </span>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: 20 }}>›</span>
            </Link>
          ))}
        </>
      )}
    </Layout>
  );
}

function formatSessionTime(start: string, end: string): string {
  try {
    const s = new Date(start);
    const e = new Date(end);
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${s.getFullYear()}-${pad(s.getMonth()+1)}-${pad(s.getDate())}`;
    const startStr = `${pad(s.getHours())}:${pad(s.getMinutes())}`;
    const endStr = `${pad(e.getHours())}:${pad(e.getMinutes())}`;
    return `${dateStr} ${startStr} – ${endStr}`;
  } catch {
    return start;
  }
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
