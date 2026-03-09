import { Router, Request, Response } from 'express';
import fs from 'fs';
import { config } from '../config';
import { scanSourcePath, getConfiguredSdPath } from '../services/importEngine';
import { log } from '../services/logger';
import type { ApiResponse } from '../types';

const router = Router();

router.get('/status', (req: Request, res: Response) => {
  const sdPath = (req.query.path as string) || config.sdCardPath;
  const cardInserted = sdPath ? fs.existsSync(sdPath) : false;

  res.json({
    success: true,
    data: {
      card_inserted: cardInserted,
      mount_path: sdPath || null,
      configured_path: config.sdCardPath || null,
    },
  } as ApiResponse);
});

router.post('/scan', async (req: Request, res: Response) => {
  const sourcePath = req.body.source_path || config.sdCardPath;

  if (!sourcePath) {
    return res.status(400).json({
      success: false,
      error: 'No source path provided. Set SD_CARD_PATH in .env or provide source_path in request body.',
    } as ApiResponse);
  }

  if (!fs.existsSync(sourcePath)) {
    return res.status(400).json({
      success: false,
      error: `Source path does not exist: ${sourcePath}`,
    } as ApiResponse);
  }

  try {
    log('info', 'card_scan', `Scanning source: ${sourcePath}`);
    const result = await scanSourcePath(sourcePath);
    log('info', 'card_scan', `Scan complete: ${result.total_files} files found, ${result.new_files} new`);
    res.json({ success: true, data: result } as ApiResponse);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    log('error', 'card_scan_error', message);
    res.status(500).json({ success: false, error: message } as ApiResponse);
  }
});

export default router;
