import { Router, Request, Response } from 'express';
import fs from 'fs';
import { config } from '../config';
import { getLogs } from '../services/logger';
import { isImportRunning } from '../services/importEngine';
import type { ApiResponse } from '../types';

const router = Router();

router.get('/status', (_req: Request, res: Response) => {
  let storageAvailable = false;
  try {
    fs.accessSync(config.photoLibraryPath, fs.constants.W_OK);
    storageAvailable = true;
  } catch {
    storageAvailable = fs.existsSync(config.photoLibraryPath);
  }

  // Check NAS (placeholder - just checks if path is configured and accessible)
  let nasConnected = false;
  if (config.nasSyncPath) {
    nasConnected = fs.existsSync(config.nasSyncPath);
  }

  // Get storage info if available
  let storageBytesUsed = 0;
  let storageBytesAvailable = 0;
  try {
    if (fs.existsSync(config.photoLibraryPath)) {
      storageBytesUsed = getDirSize(config.photoLibraryPath);
    }
  } catch {
    // ignore
  }

  const response: ApiResponse = {
    success: true,
    data: {
      server_running: true,
      storage_available: storageAvailable,
      nas_connected: nasConnected,
      current_import: isImportRunning(),
      storage_used_bytes: storageBytesUsed,
      storage_available_bytes: storageBytesAvailable,
      photo_library_path: config.photoLibraryPath,
    },
  };

  res.json(response);
});

router.get('/logs', (req: Request, res: Response) => {
  const limit = parseInt((req.query.limit as string) || '100', 10);
  const logs = getLogs(Math.min(limit, 500));

  res.json({
    success: true,
    data: logs.map(l => ({
      time: l.log_time,
      event: l.event_type,
      level: l.log_level,
      message: l.message,
    })),
  } as ApiResponse);
});

router.post('/restart', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Server restarting' } as ApiResponse);
  // Give response time to send before exiting
  setTimeout(() => process.exit(0), 500);
});

function getDirSize(dirPath: string): number {
  let total = 0;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = `${dirPath}/${entry.name}`;
      if (entry.isDirectory()) {
        total += getDirSize(fullPath);
      } else {
        try {
          total += fs.statSync(fullPath).size;
        } catch {
          // skip
        }
      }
    }
  } catch {
    // skip
  }
  return total;
}

export default router;
