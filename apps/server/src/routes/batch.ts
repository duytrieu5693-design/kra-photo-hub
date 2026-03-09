import { Router, Request, Response } from 'express';
import {
  createBatch,
  listBatches,
  getBatch,
  getBatchPhotos,
  generateZip,
  generateQr,
} from '../services/batchEngine';
import { log } from '../services/logger';
import type { ApiResponse } from '../types';

const router = Router();

// List all batches
router.get('/list', (_req: Request, res: Response) => {
  try {
    const batches = listBatches();
    res.json({ success: true, data: batches } as ApiResponse);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message } as ApiResponse);
  }
});

// Create batch
router.post('/create', (req: Request, res: Response) => {
  const { start_time, end_time } = req.body;

  if (!start_time || !end_time) {
    return res.status(400).json({
      success: false,
      error: 'start_time and end_time are required',
    } as ApiResponse);
  }

  try {
    const result = createBatch(start_time, end_time);
    res.json({ success: true, data: result } as ApiResponse);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    log('error', 'batch_create_error', message);
    res.status(400).json({ success: false, error: message } as ApiResponse);
  }
});

// Get batch details
router.get('/:batchId', (req: Request, res: Response) => {
  const { batchId } = req.params;

  try {
    const batch = getBatch(batchId);
    if (!batch) {
      return res.status(404).json({
        success: false,
        error: `Batch not found: ${batchId}`,
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: {
        batch_id: batch.id,
        start_time: batch.start_time,
        end_time: batch.end_time,
        photo_count: batch.photo_count,
        zip_generated: !!batch.zip_path,
        download_url: batch.download_url,
        delivery_status: batch.delivery_status,
        created_at: batch.created_at,
      },
    } as ApiResponse);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: message } as ApiResponse);
  }
});

// Generate ZIP for batch
router.post('/:batchId/generate-zip', async (req: Request, res: Response) => {
  const { batchId } = req.params;

  try {
    const zipPath = await generateZip(batchId);
    const zipFile = require('path').basename(zipPath);
    res.json({
      success: true,
      data: { zip_created: true, zip_file: zipFile },
    } as ApiResponse);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    log('error', 'zip_generation_error', `${batchId}: ${message}`);
    res.status(500).json({ success: false, error: message } as ApiResponse);
  }
});

// Generate QR code for batch
router.post('/:batchId/generate-qr', async (req: Request, res: Response) => {
  const { batchId } = req.params;

  try {
    const qrResult = await generateQr(batchId);
    res.json({
      success: true,
      data: {
        download_url: qrResult.download_url,
        qr_code_url: qrResult.qr_file_path,
        qr_data_url: qrResult.qr_data_url,
      },
    } as ApiResponse);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    log('error', 'qr_generation_error', `${batchId}: ${message}`);
    res.status(500).json({ success: false, error: message } as ApiResponse);
  }
});

export default router;
