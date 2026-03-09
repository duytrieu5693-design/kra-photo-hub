import { Router, Request, Response } from 'express';
import { getZipPath, markDelivered } from '../services/batchEngine';
import { log } from '../services/logger';

const router = Router();

// Customer download endpoint
router.get('/:batchId', (req: Request, res: Response) => {
  const { batchId } = req.params;

  const zipPath = getZipPath(batchId);

  if (!zipPath) {
    return res.status(404).json({
      success: false,
      error: `ZIP not found for batch: ${batchId}. Please generate the ZIP first.`,
    });
  }

  // Mark batch as delivered
  try {
    markDelivered(batchId);
  } catch {
    // Non-critical
  }

  log('info', 'download', `Batch ${batchId} downloaded`);

  const fileName = `${batchId}.zip`;
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.sendFile(zipPath, { root: '/' }, (err) => {
    if (err) {
      log('error', 'download_error', `Failed to send ZIP for ${batchId}: ${err.message}`);
    }
  });
});

export default router;
