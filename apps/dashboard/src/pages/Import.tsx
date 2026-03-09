import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../api/client';
import type { ScanResult, ImportProgress, ImportResult } from '../api/client';

type Phase = 'idle' | 'scanning' | 'scanned' | 'importing' | 'done' | 'error';

export function Import() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [sourcePath, setSourcePath] = useState('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');
  const pollRef = useRef<number | null>(null);

  // Poll import progress
  useEffect(() => {
    if (phase === 'importing') {
      pollRef.current = window.setInterval(async () => {
        const res = await api.getImportProgress();
        if (res.success && res.data) {
          setProgress(res.data);
          if (!res.data.running) {
            clearInterval(pollRef.current!);
            // Get result
            const resultRes = await api.getImportResult();
            if (resultRes.success && resultRes.data) {
              setResult(resultRes.data);
            }
            setPhase('done');
          }
        }
      }, 800);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [phase]);

  // Check if import already running on mount
  useEffect(() => {
    api.getImportProgress().then(res => {
      if (res.success && res.data?.running) {
        setProgress(res.data);
        setPhase('importing');
      }
    });
  }, []);

  async function handleScan() {
    setPhase('scanning');
    setError('');
    setScanResult(null);
    try {
      const res = await api.scanCard(sourcePath || undefined);
      if (res.success && res.data) {
        setScanResult(res.data);
        setPhase('scanned');
      } else {
        setError(res.error || 'Scan failed');
        setPhase('error');
      }
    } catch {
      setError('Could not reach server. Check connection.');
      setPhase('error');
    }
  }

  async function handleImport() {
    setPhase('importing');
    setError('');
    try {
      const res = await api.startImport(sourcePath || undefined);
      if (!res.success) {
        setError(res.error || 'Failed to start import');
        setPhase('error');
      }
    } catch {
      setError('Could not start import. Check connection.');
      setPhase('error');
    }
  }

  function handleReset() {
    setPhase('idle');
    setScanResult(null);
    setProgress(null);
    setResult(null);
    setError('');
  }

  return (
    <Layout title="Import Photos" back="/">
      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {/* Source path config */}
      {(phase === 'idle' || phase === 'error') && (
        <div className="card">
          <div className="card-title">Source Folder</div>
          <div className="form-group">
            <label className="form-label">SD Card / Source Path</label>
            <input
              className="form-input"
              type="text"
              value={sourcePath}
              onChange={e => setSourcePath(e.target.value)}
              placeholder="Leave blank to use .env SD_CARD_PATH"
            />
            <div className="text-xs text-muted mt-8">
              e.g. D:\DCIM or /Volumes/SDCARD/DCIM
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleScan}>
            🔍 Scan Source
          </button>
        </div>
      )}

      {/* Scanning indicator */}
      {phase === 'scanning' && (
        <div className="card text-center">
          <div style={{ marginBottom: 16 }}>
            <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto' }} />
          </div>
          <div className="text-lg font-bold">Scanning...</div>
          <div className="text-muted text-sm mt-8">Reading source folder</div>
        </div>
      )}

      {/* Scan result */}
      {phase === 'scanned' && scanResult && (
        <>
          <div className="card">
            <div className="card-title">Scan Results</div>
            <div className="stats-grid mb-16">
              <div className="stat-item">
                <div className="stat-value">{scanResult.total_files}</div>
                <div className="stat-label">Total Files</div>
              </div>
              <div className="stat-item">
                <div className="stat-value" style={{ color: 'var(--success)' }}>{scanResult.new_files}</div>
                <div className="stat-label">New Files</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{scanResult.jpeg_files}</div>
                <div className="stat-label">JPEG</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{scanResult.raw_files}</div>
                <div className="stat-label">RAW</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-muted mb-16">
              <span>Already imported</span>
              <span>{scanResult.already_imported} files</span>
            </div>

            {scanResult.new_files === 0 ? (
              <div className="alert alert-info">No new files to import. All files already in library.</div>
            ) : (
              <button className="btn btn-success" onClick={handleImport}>
                📥 Import {scanResult.new_files} New Files
              </button>
            )}
          </div>
          <button className="btn btn-ghost" onClick={handleReset}>Scan Different Folder</button>
        </>
      )}

      {/* Import progress */}
      {phase === 'importing' && progress && (
        <div className="card">
          <div className="card-title">Importing Photos</div>
          <div className="text-xl text-center mb-12">{progress.progress_percent}%</div>
          <div className="progress-bar-wrap mb-16">
            <div className="progress-bar-fill" style={{ width: `${progress.progress_percent}%` }} />
          </div>
          <div className="flex items-center justify-between text-sm mb-8">
            <span className="text-muted">Progress</span>
            <span>{progress.files_copied} / {progress.total_files} files</span>
          </div>
          {progress.copy_speed_mb > 0 && (
            <div className="flex items-center justify-between text-sm mb-8">
              <span className="text-muted">Speed</span>
              <span>{progress.copy_speed_mb.toFixed(1)} MB/s</span>
            </div>
          )}
          {progress.current_file && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Current</span>
              <span className="text-xs font-mono" style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {progress.current_file}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Import done */}
      {phase === 'done' && result && (
        <>
          <div className="alert alert-success">
            ✅ Import completed successfully!
          </div>
          <div className="card">
            <div className="card-title">Import Summary</div>
            <div className="stats-grid mb-16">
              <div className="stat-item">
                <div className="stat-value" style={{ color: 'var(--success)' }}>{result.imported_files}</div>
                <div className="stat-label">Imported</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{result.skipped_files}</div>
                <div className="stat-label">Skipped</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{result.jpeg_files}</div>
                <div className="stat-label">JPEG</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{result.raw_files}</div>
                <div className="stat-label">RAW</div>
              </div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleReset}>
            Import Again
          </button>
        </>
      )}
    </Layout>
  );
}
