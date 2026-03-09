import { Router, Request, Response } from 'express';
import { searchPhotosByTimeRange } from '../services/batchEngine';
import { log } from '../services/logger';
import type { ApiResponse } from '../types';

const router = Router();

router.post('/search', (req: Request, res: Response) => {
  const { start_time, end_time } = req.body;

  if (!start_time || !end_time) {
    return res.status(400).json({
      success: false,
      error: 'start_time and end_time are required',
    } as ApiResponse);
  }

  try {
    const result = searchPhotosByTimeRange(start_time, end_time);
    res.json({
      success: true,
      data: {
        photo_count: result.photo_count,
        first_photo: result.first_photo,
        last_photo: result.last_photo,
      },
    } as ApiResponse);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    log('error', 'photo_search_error', message);
    res.status(500).json({ success: false, error: message } as ApiResponse);
  }
});

export default router;
