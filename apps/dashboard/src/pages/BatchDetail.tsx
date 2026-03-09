import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { api } from '../api/client';
import type { BatchDetail as BatchDetailType } from '../api/client';

interface QrInfo {
  download_url: string;
  qr_data_url: string;
  qr_code_url: string;
}

export function BatchDetail() {
  const { batchId } = useParams<{ batchId: string }>();
  const [batch, setBatch] = useState<BatchDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [zipGenerating, setZipGenerating] = useState(false);
  const [qrGenerating, setQrGenerating] = useState(false);
  const [qrInfo, setQrInfo] = useState<QrInfo | null>(null);
  const [copied, setCopied] = useState(false);

  const loadBatch = async () => {
    if (!batchId) return;
    const res = await api.getBatch(batchId);
    if (res.success && res.data) {
      setBatch(res.data);
    } else {
      setError(res.error || 'Failed to load batch');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBatch();
  }, [batchId]);

  async function handleGenerateZip() {
    if (!batchId) return;
    setZipGenerating(true);
    setError('');
    const res = await api.generateZip(batchId);
    setZipGenerating(false);
    if (res.success) {
      await loadBatch();
    } else {
      setError(res.error || 'ZIP generation failed');
    }
  }

  async function handleGenerateQr() {
    if (!batchId) return;
    setQrGenerating(true);
    setError('');
    const res = await api.generateQr(batchId);
    setQrGenerating(false);
    if (res.success && res.data) {
      setQrInfo(res.data);
    } else {
      setError(res.error || 'QR generation failed');
    }
  }

  async function handleCopy() {
    if (!qrInfo) return;
    try {
      await navigator.clipboard.writeText(qrInfo.download_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the text
    }
  }

  if (loading) {
    return (
      <Layout title="Batch Details" back="/batches">
        <div className="card text-center">
          <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto' }} />
        </div>
      </Layout>
    );
  }

  if (!batch) {
    return (
      <Layout title="Batch Details" back="/batches">
        <div className="alert alert-error">Batch not found: {batchId}</div>
      </Layout>
    );
  }

  return (
    <Layout title="Batch Details" back="/batches">
      {error && <div className="alert alert-error">{error}</div>}

      {/* Batch info */}
      <div className="card mb-16">
        <div className="flex items-center justify-between mb-12">
          <div className="card-title" style={{ margin: 0 }}>Batch Info</div>
          <span className={`badge badge-${batch.delivery_status}`}>{batch.delivery_status}</span>
        </div>
        <div className="flex items-center justify-between text-sm mb-8">
          <span className="text-muted">Batch ID</span>
          <span className="font-mono text-xs">{batch.batch_id}</span>
        </div>
        <div className="flex items-center justify-between text-sm mb-8">
          <span className="text-muted">Photos</span>
          <span className="font-bold" style={{ color: 'var(--accent-light)' }}>{batch.photo_count}</span>
        </div>
        <div className="flex items-center justify-between text-sm mb-8">
          <span className="text-muted">Session</span>
          <span className="text-xs">{formatSessionTime(batch.start_time, batch.end_time)}</span>
        </div>
        <div className="flex items-center justify-between text-sm mb-8">
          <span className="text-muted">Created</span>
          <span className="text-xs">{formatDateTime(batch.created_at)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">ZIP</span>
          <span>{batch.zip_generated ? '✅ Ready' : '⏳ Not generated'}</span>
        </div>
      </div>

      {/* Generate ZIP */}
      {!batch.zip_generated && (
        <button
          className="btn btn-primary mb-12"
          onClick={handleGenerateZip}
          disabled={zipGenerating}
        >
          {zipGenerating ? (
            <><span className="spinner" style={{ width: 18, height: 18 }} /> Generating ZIP...</>
          ) : '📦 Generate ZIP'}
        </button>
      )}

      {/* Generate QR */}
      {batch.zip_generated && !qrInfo && (
        <button
          className="btn btn-success mb-12"
          onClick={handleGenerateQr}
          disabled={qrGenerating}
        >
          {qrGenerating ? (
            <><span className="spinner" style={{ width: 18, height: 18 }} /> Generating QR...</>
          ) : '📱 Generate QR Code'}
        </button>
      )}

      {/* Regenerate QR if already done */}
      {batch.zip_generated && qrInfo && (
        <button className="btn btn-ghost btn-sm mb-12" onClick={handleGenerateQr} disabled={qrGenerating}>
          🔄 Regenerate QR
        </button>
      )}

      {/* QR Code display */}
      {qrInfo && (
        <div className="card">
          <div className="card-title text-center">Customer Download</div>
          <div className="qr-container">
            <img src={qrInfo.qr_data_url} alt="QR Code for download" />
          </div>
          <div className="text-center text-sm text-muted mb-12">
            Customer scans QR to download photos
          </div>
          <div className="download-link mb-16">{qrInfo.download_url}</div>
          <button className="btn btn-primary" onClick={handleCopy}>
            {copied ? '✅ Copied!' : '📋 Copy Link'}
          </button>
          <a
            href={`/download/${batchId}`}
            className="btn btn-ghost mt-8"
            style={{ marginTop: 8, display: 'flex' }}
            download
          >
            ⬇️ Download ZIP
          </a>
        </div>
      )}

      {/* If ZIP was previously generated but QR not shown yet */}
      {batch.zip_generated && !qrInfo && batch.download_url && (
        <div className="card">
          <div className="card-title">Download</div>
          <div className="download-link mb-12">{window.location.origin}{batch.download_url}</div>
          <a
            href={batch.download_url}
            className="btn btn-ghost"
            download
          >
            ⬇️ Download ZIP
          </a>
        </div>
      )}
    </Layout>
  );
}

function formatSessionTime(start: string, end: string): string {
  try {
    const s = new Date(start);
    const e = new Date(end);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(s.getHours())}:${pad(s.getMinutes())} – ${pad(e.getHours())}:${pad(e.getMinutes())}`;
  } catch {
    return `${start} – ${end}`;
  }
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
