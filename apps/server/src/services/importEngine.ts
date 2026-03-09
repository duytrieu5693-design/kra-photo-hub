import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getDb } from '../db/database';
import { config } from '../config';
import { log } from './logger';
import type { ScanResult, ImportProgress, ImportResult } from '../types';

const JPEG_EXTENSIONS = new Set(['.jpg', '.jpeg']);
const RAW_EXTENSIONS = new Set(['.arw', '.cr2', '.cr3', '.nef', '.nrw', '.orf', '.rw2', '.dng', '.raw']);

interface ImportState {
  running: boolean;
  totalFiles: number;
  filesCopied: number;
  skippedFiles: number;
  jpegCount: number;
  rawCount: number;
  sourcePath: string;
  startTime: number;
  speedMb: number;
  currentFile: string;
  error: string | null;
  result: ImportResult | null;
}

const importState: ImportState = {
  running: false,
  totalFiles: 0,
  filesCopied: 0,
  skippedFiles: 0,
  jpegCount: 0,
  rawCount: 0,
  sourcePath: '',
  startTime: 0,
  speedMb: 0,
  currentFile: '',
  error: null,
  result: null,
};

export function getImportProgress(): ImportProgress {
  const percent = importState.totalFiles > 0
    ? Math.round((importState.filesCopied / importState.totalFiles) * 100)
    : 0;
  return {
    running: importState.running,
    total_files: importState.totalFiles,
    files_copied: importState.filesCopied,
    progress_percent: percent,
    copy_speed_mb: Math.round(importState.speedMb * 10) / 10,
    current_file: importState.currentFile,
  };
}

export function getImportResult(): ImportResult | null {
  return importState.result;
}

export function isImportRunning(): boolean {
  return importState.running;
}

export async function scanSourcePath(sourcePath: string): Promise<ScanResult> {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source path does not exist: ${sourcePath}`);
  }

  const allFiles = collectPhotoFiles(sourcePath);
  const jpegFiles = allFiles.filter(f => JPEG_EXTENSIONS.has(path.extname(f.name).toLowerCase()));
  const rawFiles = allFiles.filter(f => RAW_EXTENSIONS.has(path.extname(f.name).toLowerCase()));

  const db = getDb();
  let alreadyImported = 0;

  for (const file of allFiles) {
    const hash = computeQuickHash(file.fullPath);
    if (hash) {
      const existing = db.prepare('SELECT id FROM photos WHERE file_hash = ?').get(hash);
      if (existing) alreadyImported++;
    }
  }

  return {
    total_files: allFiles.length,
    jpeg_files: jpegFiles.length,
    raw_files: rawFiles.length,
    already_imported: alreadyImported,
    new_files: Math.max(0, allFiles.length - alreadyImported),
  };
}

export async function startImport(sourcePath: string): Promise<void> {
  if (importState.running) throw new Error('Import already running');
  if (!fs.existsSync(sourcePath)) throw new Error(`Source path does not exist: ${sourcePath}`);

  importState.running = true;
  importState.totalFiles = 0;
  importState.filesCopied = 0;
  importState.skippedFiles = 0;
  importState.jpegCount = 0;
  importState.rawCount = 0;
  importState.sourcePath = sourcePath;
  importState.startTime = Date.now();
  importState.speedMb = 0;
  importState.currentFile = '';
  importState.error = null;
  importState.result = null;

  log('info', 'import_started', `Starting import from: ${sourcePath}`);

  runImport(sourcePath).catch(err => {
    importState.running = false;
    importState.error = err.message;
    log('error', 'import_failed', `Import failed: ${err.message}`);
  });
}

async function runImport(sourcePath: string): Promise<void> {
  const db = getDb();
  const allFiles = collectPhotoFiles(sourcePath);
  importState.totalFiles = allFiles.length;

  if (allFiles.length === 0) {
    log('warning', 'import_scan', 'No photo files found in source path');
    importState.running = false;
    importState.result = { imported_files: 0, jpeg_files: 0, raw_files: 0, skipped_files: 0 };
    return;
  }

  const importRunResult = db.prepare(`
    INSERT INTO imports (source_path, total_files, started_at)
    VALUES (?, ?, datetime('now'))
  `).run(sourcePath, allFiles.length);
  const importId = importRunResult.lastInsertRowid;

  let speedUpdateTime = Date.now();
  let bytesInWindow = 0;

  const insertPhoto = db.prepare(`
    INSERT OR IGNORE INTO photos (file_name, file_path, file_type, file_size, capture_time, camera_model, lens, file_hash, imported_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  for (const file of allFiles) {
    if (!importState.running) break;
    importState.currentFile = file.name;

    let hash: string;
    try {
      hash = computeFileHash(file.fullPath);
    } catch {
      log('warning', 'import_file_error', `Could not hash file: ${file.name}`);
      importState.skippedFiles++;
      continue;
    }

    const existing = db.prepare('SELECT id FROM photos WHERE file_hash = ?').get(hash);
    if (existing) {
      importState.skippedFiles++;
      continue;
    }

    const ext = path.extname(file.name).toLowerCase();
    const fileType: 'JPEG' | 'RAW' = JPEG_EXTENSIONS.has(ext) ? 'JPEG' : 'RAW';

    let captureTime: string | null = null;
    let cameraModel: string | null = null;
    let lensModel: string | null = null;

    if (fileType === 'JPEG') {
      try {
        const exifData = extractExif(file.fullPath);
        captureTime = exifData.captureTime;
        cameraModel = exifData.cameraModel;
        lensModel = exifData.lens;
      } catch {
        // EXIF extraction failed; use file mtime
      }
    }

    // Use mtime as capture_time fallback so photos are always searchable
    if (!captureTime) {
      const mtime = fs.statSync(file.fullPath).mtime;
      captureTime = mtime.toISOString().replace('T', ' ').substring(0, 19);
    }

    const dateForPath = new Date(captureTime);

    const year = dateForPath.getFullYear().toString();
    const month = String(dateForPath.getMonth() + 1).padStart(2, '0');
    const day = String(dateForPath.getDate()).padStart(2, '0');
    const destDir = path.join(config.photoLibraryPath, year, month, day);

    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    const destPath = path.join(destDir, file.name);

    try {
      fs.copyFileSync(file.fullPath, destPath);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      log('error', 'import_copy_error', `Failed to copy ${file.name}: ${message}`);
      importState.skippedFiles++;
      continue;
    }

    bytesInWindow += file.size;
    const now = Date.now();
    if (now - speedUpdateTime >= 1000) {
      importState.speedMb = bytesInWindow / (1024 * 1024);
      bytesInWindow = 0;
      speedUpdateTime = now;
    }

    insertPhoto.run(
      file.name, destPath, fileType, file.size,
      captureTime, cameraModel, lensModel, hash
    );

    importState.filesCopied++;
    if (fileType === 'JPEG') importState.jpegCount++;
    else importState.rawCount++;
  }

  const result: ImportResult = {
    imported_files: importState.filesCopied,
    jpeg_files: importState.jpegCount,
    raw_files: importState.rawCount,
    skipped_files: importState.skippedFiles,
  };

  db.prepare(`
    UPDATE imports SET new_files = ?, skipped_files = ?, completed_at = datetime('now')
    WHERE id = ?
  `).run(importState.filesCopied, importState.skippedFiles, importId);

  importState.running = false;
  importState.result = result;

  log('info', 'import_completed',
    `Import completed: ${result.imported_files} imported (${result.jpeg_files} JPEG, ${result.raw_files} RAW), ${result.skipped_files} skipped`
  );
}

interface FileInfo {
  name: string;
  fullPath: string;
  size: number;
}

function collectPhotoFiles(dir: string): FileInfo[] {
  const results: FileInfo[] = [];

  function walk(currentDir: string): void {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (JPEG_EXTENSIONS.has(ext) || RAW_EXTENSIONS.has(ext)) {
          try {
            const stat = fs.statSync(fullPath);
            results.push({ name: entry.name, fullPath, size: stat.size });
          } catch { /* skip */ }
        }
      }
    }
  }

  walk(dir);
  return results;
}

function computeQuickHash(filePath: string): string {
  try {
    const stat = fs.statSync(filePath);
    const name = path.basename(filePath);
    return crypto.createHash('md5').update(`${name}:${stat.size}`).digest('hex');
  } catch {
    return '';
  }
}

function computeFileHash(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(buffer).digest('hex');
}

interface ExifData {
  captureTime: string | null;
  cameraModel: string | null;
  lens: string | null;
}

function extractExif(filePath: string): ExifData {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ExifParser = require('exif-parser');
    const buffer = fs.readFileSync(filePath);
    const parser = ExifParser.create(buffer);
    const result = parser.parse();
    const tags = result.tags || {};

    let captureTime: string | null = null;
    if (tags.DateTimeOriginal) {
      captureTime = new Date(tags.DateTimeOriginal * 1000).toISOString().replace('T', ' ').substring(0, 19);
    } else if (tags.DateTime) {
      captureTime = new Date(tags.DateTime * 1000).toISOString().replace('T', ' ').substring(0, 19);
    }

    return { captureTime, cameraModel: tags.Model || null, lens: tags.LensModel || null };
  } catch {
    return { captureTime: null, cameraModel: null, lens: null };
  }
}

export function getConfiguredSdPath(): string {
  return config.sdCardPath;
}
