// Detect base URL: in production served from same origin, in dev proxied by Vite
const BASE = '';

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  return data as T;
}

export const api = {
  // System
  getStatus: () => request<ApiResp<SystemStatus>>('GET', '/api/system/status'),
  getLogs: (limit = 100) => request<ApiResp<LogEntry[]>>('GET', `/api/system/logs?limit=${limit}`),
  restart: () => request<ApiResp<void>>('POST', '/api/system/restart'),

  // Card
  getCardStatus: (path?: string) =>
    request<ApiResp<CardStatus>>('GET', `/api/card/status${path ? `?path=${encodeURIComponent(path)}` : ''}`),
  scanCard: (sourcePath?: string) =>
    request<ApiResp<ScanResult>>('POST', '/api/card/scan', sourcePath ? { source_path: sourcePath } : {}),

  // Import
  startImport: (sourcePath?: string) =>
    request<ApiResp<{ import_started: boolean }>>('POST', '/api/import/start', sourcePath ? { source_path: sourcePath } : {}),
  getImportProgress: () => request<ApiResp<ImportProgress>>('GET', '/api/import/progress'),
  getImportResult: () => request<ApiResp<ImportResult | null>>('GET', '/api/import/result'),

  // Photos
  searchPhotos: (startTime: string, endTime: string) =>
    request<ApiResp<PhotoSearchResult>>('POST', '/api/photos/search', { start_time: startTime, end_time: endTime }),

  // Batches
  listBatches: () => request<ApiResp<Batch[]>>('GET', '/api/batch/list'),
  createBatch: (startTime: string, endTime: string) =>
    request<ApiResp<{ batch_id: string; photo_count: number }>>('POST', '/api/batch/create', { start_time: startTime, end_time: endTime }),
  getBatch: (batchId: string) => request<ApiResp<BatchDetail>>('GET', `/api/batch/${batchId}`),
  generateZip: (batchId: string) =>
    request<ApiResp<{ zip_created: boolean; zip_file: string }>>('POST', `/api/batch/${batchId}/generate-zip`),
  generateQr: (batchId: string) =>
    request<ApiResp<{ download_url: string; qr_code_url: string; qr_data_url: string }>>('POST', `/api/batch/${batchId}/generate-qr`),
};

// Types
export interface ApiResp<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SystemStatus {
  server_running: boolean;
  storage_available: boolean;
  nas_connected: boolean;
  current_import: boolean;
  photo_library_path?: string;
  storage_used_bytes?: number;
}

export interface CardStatus {
  card_inserted: boolean;
  mount_path: string | null;
  configured_path: string | null;
}

export interface ScanResult {
  total_files: number;
  jpeg_files: number;
  raw_files: number;
  already_imported: number;
  new_files: number;
}

export interface ImportProgress {
  running: boolean;
  total_files: number;
  files_copied: number;
  progress_percent: number;
  copy_speed_mb: number;
  current_file: string;
}

export interface ImportResult {
  imported_files: number;
  jpeg_files: number;
  raw_files: number;
  skipped_files: number;
}

export interface PhotoSearchResult {
  photo_count: number;
  first_photo: string | null;
  last_photo: string | null;
}

export interface Batch {
  id: string;
  start_time: string;
  end_time: string;
  photo_count: number;
  zip_path: string | null;
  download_url: string | null;
  delivery_status: 'pending' | 'ready' | 'delivered';
  created_at: string;
}

export interface BatchDetail {
  batch_id: string;
  start_time: string;
  end_time: string;
  photo_count: number;
  zip_generated: boolean;
  download_url: string | null;
  delivery_status: 'pending' | 'ready' | 'delivered';
  created_at: string;
}

export interface LogEntry {
  time: string;
  event: string;
  level: string;
  message: string;
}
