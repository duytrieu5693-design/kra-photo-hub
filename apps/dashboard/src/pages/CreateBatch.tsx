import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { api } from '../api/client';
import type { PhotoSearchResult } from '../api/client';

type Phase = 'form' | 'searching' | 'preview' | 'creating' | 'done' | 'error';

function todayDateTimeLocal(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function toIsoLocal(dtLocal: string): string {
  // Convert datetime-local string to ISO-like string for API (without Z)
  return dtLocal.replace('T', ' ') + ':00';
}

export function CreateBatch() {
  const navigate = useNavigate();
  const [startTime, setStartTime] = useState(todayDateTimeLocal());
  const [endTime, setEndTime] = useState(todayDateTimeLocal());
  const [phase, setPhase] = useState<Phase>('form');
  const [searchResult, setSearchResult] = useState<PhotoSearchResult | null>(null);
  const [batchId, setBatchId] = useState('');
  const [error, setError] = useState('');

  async function handleSearch() {
    if (!startTime || !endTime) {
      setError('Please select start and end time');
      return;
    }
    if (startTime >= endTime) {
      setError('End time must be after start time');
      return;
    }

    setPhase('searching');
    setError('');
    try {
      const res = await api.searchPhotos(toIsoLocal(startTime), toIsoLocal(endTime));
      if (res.success && res.data) {
        setSearchResult(res.data);
        setPhase('preview');
      } else {
        setError(res.error || 'Search failed');
        setPhase('error');
      }
    } catch {
      setError('Could not reach server');
      setPhase('error');
    }
  }

  async function handleCreateBatch() {
    setPhase('creating');
    setError('');
    try {
      const res = await api.createBatch(toIsoLocal(startTime), toIsoLocal(endTime));
      if (res.success && res.data) {
        setBatchId(res.data.batch_id);
        setPhase('done');
      } else {
        setError(res.error || 'Failed to create batch');
        setPhase('error');
      }
    } catch {
      setError('Could not create batch');
      setPhase('error');
    }
  }

  function handleReset() {
    setPhase('form');
    setSearchResult(null);
    setBatchId('');
    setError('');
  }

  return (
    <Layout title="Create Batch" back="/">
      {error && <div className="alert alert-error">{error}</div>}

      {/* Time range form */}
      {(phase === 'form' || phase === 'error') && (
        <div className="card">
          <div className="card-title">Customer Session Time Range</div>
          <div className="form-group">
            <label className="form-label">Start Time</label>
            <input
              className="form-input"
              type="datetime-local"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">End Time</label>
            <input
              className="form-input"
              type="datetime-local"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={handleSearch}>
            🔍 Search Photos
          </button>
        </div>
      )}

      {/* Searching */}
      {phase === 'searching' && (
        <div className="card text-center">
          <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 16px' }} />
          <div className="text-lg font-bold">Searching photos...</div>
        </div>
      )}

      {/* Preview */}
      {phase === 'preview' && searchResult && (
        <>
          <div className="card">
            <div className="card-title">Search Results</div>
            {searchResult.photo_count === 0 ? (
              <div className="alert alert-info">No JPEG photos found in this time range.</div>
            ) : (
              <>
                <div className="stat-item" style={{ marginBottom: 16, textAlign: 'left', padding: '16px 0', background: 'transparent', border: 'none' }}>
                  <div style={{ fontSize: 40, fontWeight: 700, color: 'var(--accent-light)' }}>{searchResult.photo_count}</div>
                  <div className="stat-label">JPEG Photos Found</div>
                </div>
                {searchResult.first_photo && (
                  <div className="flex items-center justify-between text-sm mb-8">
                    <span className="text-muted">First photo</span>
                    <span className="font-mono text-xs">{searchResult.first_photo}</span>
                  </div>
                )}
                {searchResult.last_photo && (
                  <div className="flex items-center justify-between text-sm mb-16">
                    <span className="text-muted">Last photo</span>
                    <span className="font-mono text-xs">{searchResult.last_photo}</span>
                  </div>
                )}
                <button className="btn btn-success mb-12" onClick={handleCreateBatch}>
                  ✅ Create Batch
                </button>
              </>
            )}
            <button className="btn btn-ghost" onClick={handleReset}>
              Change Time Range
            </button>
          </div>
        </>
      )}

      {/* Creating */}
      {phase === 'creating' && (
        <div className="card text-center">
          <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 16px' }} />
          <div className="text-lg font-bold">Creating batch...</div>
        </div>
      )}

      {/* Done */}
      {phase === 'done' && batchId && (
        <>
          <div className="alert alert-success">✅ Batch created successfully!</div>
          <div className="card">
            <div className="card-title">Batch ID</div>
            <div className="download-link mb-16">{batchId}</div>
            <button
              className="btn btn-primary mb-12"
              onClick={() => navigate(`/batches/${batchId}`)}
            >
              📦 Open Batch → Generate ZIP & QR
            </button>
            <button className="btn btn-ghost" onClick={handleReset}>
              Create Another Batch
            </button>
          </div>
        </>
      )}
    </Layout>
  );
}
