// Shared types used throughout the server

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Photo {
  id: number;
  file_name: string;
  file_path: string;
  file_type: 'JPEG' | 'RAW';
  file_size: number;
  capture_time: string | null;
  camera_model: string | null;
  lens: string | null;
  file_hash: string;
  imported_at: string;
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

export interface BatchPhoto {
  id: number;
  batch_id: string;
  photo_id: number;
}

export interface Import {
  id: number;
  source_path: string;
  total_files: number;
  new_files: number;
  skipped_files: number;
  started_at: string;
  completed_at: string | null;
}

export interface SystemLog {
  id: number;
  log_time: string;
  log_level: 'info' | 'warning' | 'error';
  event_type: string;
  message: string;
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
  photos: Photo[];
}
