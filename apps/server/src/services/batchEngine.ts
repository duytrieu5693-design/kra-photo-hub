import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import QRCode from 'qrcode';
import { getDb } from '../db/database';
import { config } from '../config';
import { log } from './logger';
import type { Batch, Photo, PhotoSearchResult } from '../types';

export function searchPhotosByTimeRange(startTime: string, endTime: string): PhotoSearchResult {
  const db = getDb();
  const photos = db.prepare(`
    SELECT * FROM photos
    WHERE capture_time >= ? AND capture_time <= ?
    AND file_type = 'JPEG'
    ORDER BY capture_time ASC
  `).all(startTime, endTime) as unknown as Photo[];

  return {
    photo_count: photos.length,
    first_photo: photos.length > 0 ? photos[0].file_name : null,
    last_photo: photos.length > 0 ? photos[photos.length - 1].file_name : null,
    photos,
  };
}

function generateBatchId(startTime: string): string {
  const d = new Date(startTime);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `batch-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

export function createBatch(startTime: string, endTime: string): { batch_id: string; photo_count: number } {
  const db = getDb();
  const searchResult = searchPhotosByTimeRange(startTime, endTime);

  if (searchResult.photo_count === 0) {
    throw new Error('No photos found for the selected time range');
  }

  let batchId = generateBatchId(startTime);
  let suffix = 1;
  while (db.prepare('SELECT id FROM batches WHERE id = ?').get(batchId)) {
    batchId = `${generateBatchId(startTime)}-${suffix++}`;
  }

  db.prepare(`
    INSERT INTO batches (id, start_time, end_time, photo_count, delivery_status, created_at)
    VALUES (?, ?, ?, ?, 'pending', datetime('now'))
  `).run(batchId, startTime, endTime, searchResult.photo_count);

  const insertBatchPhoto = db.prepare(
    'INSERT OR IGNORE INTO batch_photos (batch_id, photo_id) VALUES (?, ?)'
  );

  db.exec('BEGIN');
  try {
    for (const photo of searchResult.photos) {
      insertBatchPhoto.run(batchId, photo.id);
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  log('info', 'batch_created', `Batch ${batchId} created with ${searchResult.photo_count} photos`);
  return { batch_id: batchId, photo_count: searchResult.photo_count };
}

export function listBatches(): Batch[] {
  return getDb().prepare('SELECT * FROM batches ORDER BY created_at DESC').all() as unknown as Batch[];
}

export function getBatch(batchId: string): Batch | null {
  return getDb().prepare('SELECT * FROM batches WHERE id = ?').get(batchId) as unknown as Batch | null;
}

export function getBatchPhotos(batchId: string): Photo[] {
  return getDb().prepare(`
    SELECT p.* FROM photos p
    JOIN batch_photos bp ON bp.photo_id = p.id
    WHERE bp.batch_id = ?
    ORDER BY p.capture_time ASC
  `).all(batchId) as unknown as Photo[];
}

export async function generateZip(batchId: string): Promise<string> {
  const db = getDb();
  const batch = getBatch(batchId);
  if (!batch) throw new Error(`Batch not found: ${batchId}`);

  const photos = getBatchPhotos(batchId);
  const jpegPhotos = photos.filter(p => p.file_type === 'JPEG');
  if (jpegPhotos.length === 0) throw new Error('No JPEG photos in this batch');

  if (!fs.existsSync(config.exportPath)) fs.mkdirSync(config.exportPath, { recursive: true });

  const zipFilePath = path.join(config.exportPath, `${batchId}.zip`);

  await new Promise<void>((resolve, reject) => {
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', { zlib: { level: 6 } });
    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);
    for (const photo of jpegPhotos) {
      if (fs.existsSync(photo.file_path)) {
        archive.file(photo.file_path, { name: photo.file_name });
      }
    }
    archive.finalize();
  });

  const downloadUrl = `/download/${batchId}`;
  db.prepare(`
    UPDATE batches SET zip_path = ?, download_url = ?, delivery_status = 'ready' WHERE id = ?
  `).run(zipFilePath, downloadUrl, batchId);

  log('info', 'zip_generated', `ZIP generated for batch ${batchId}`);
  return zipFilePath;
}

export async function generateQr(batchId: string): Promise<{ download_url: string; qr_data_url: string; qr_file_path: string }> {
  const batch = getBatch(batchId);
  if (!batch) throw new Error(`Batch not found: ${batchId}`);
  if (!batch.zip_path) throw new Error('ZIP must be generated before creating QR code');

  const downloadUrl = `${config.serverBaseUrl}/download/${batchId}`;
  if (!fs.existsSync(config.qrPath)) fs.mkdirSync(config.qrPath, { recursive: true });

  const qrFileName = `${batchId}.png`;
  const qrFilePath = path.join(config.qrPath, qrFileName);

  await QRCode.toFile(qrFilePath, downloadUrl, { type: 'png', width: 400, margin: 2 });
  const qrDataUrl = await QRCode.toDataURL(downloadUrl, { width: 400, margin: 2 });

  log('info', 'qr_generated', `QR code generated for batch ${batchId}`);
  return { download_url: downloadUrl, qr_data_url: qrDataUrl, qr_file_path: `/qr/${qrFileName}` };
}

export function getZipPath(batchId: string): string | null {
  const batch = getBatch(batchId);
  if (!batch || !batch.zip_path) return null;
  if (!fs.existsSync(batch.zip_path)) return null;
  return batch.zip_path;
}

export function markDelivered(batchId: string): void {
  getDb().prepare(`UPDATE batches SET delivery_status = 'delivered' WHERE id = ?`).run(batchId);
}
