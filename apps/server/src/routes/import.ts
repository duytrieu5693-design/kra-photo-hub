import { Router, Request, Response } from 'express';
import { config } from '../config';
import {
  startImport,
  getImportProgress,
  getImportResult,
  isImportRunning,
} from '../services/importEngine';
import { log } from '../services/logger';
import type { ApiResponse } from '../types';

const router = Router();

router.post('/start', async (req: Request, res: Response) => {
  if (isImportRunning()) {
    return res.status(409).json({
      success: false,
      error: 'Import already running',
    } as ApiResponse);
  }

  const sourcePath = req.body.source_path || config.sdCardPath;

  if (!sourcePath) {
    return res.status(400).json({
      success: false,
      error: 'No source path provided. Set SD_CARD_PATH in .env or provide source_path in request body.',
    } as ApiResponse);
  }

  try {
    // startImport launches async background task
    await startImport(sourcePath);
    res.json({
      success: true,
      data: { import_started: true, source_path: sourcePath },
    } as ApiResponse);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    log('error', 'import_start_error', message);
    res.status(500).json({ success: false, error: message } as ApiResponse);
  }
});

router.get('/progress', (_req: Request, res: Response) => {
  const progress = getImportProgress();
  res.json({ success: true, data: progress } as ApiResponse);
});

router.get('/result', (_req: Request, res: Response) => {
  const result = getImportResult();
  if (!result) {
    return res.json({
      success: true,
      data: null,
      message: 'No import result available yet',
    } as ApiResponse);
  }
  res.json({ success: true, data: result } as ApiResponse);
});

export default router;
