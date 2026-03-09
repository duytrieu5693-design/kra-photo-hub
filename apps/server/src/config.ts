import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

// Also try loading from project root directly
dotenv.config();

const projectRoot = path.resolve(process.cwd(), '../..');

function resolvePath(envPath: string, defaultRelative: string): string {
  const p = envPath || defaultRelative;
  if (path.isAbsolute(p)) return p;
  return path.resolve(projectRoot, p);
}

export const config = {
  port: parseInt(process.env.SERVER_PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',

  photoLibraryPath: resolvePath(
    process.env.PHOTO_LIBRARY_PATH || '',
    'storage/photo_library'
  ),
  exportPath: resolvePath(
    process.env.EXPORT_PATH || '',
    'storage/exports'
  ),
  batchPath: resolvePath(
    process.env.BATCH_PATH || '',
    'storage/batches'
  ),
  databasePath: resolvePath(
    process.env.DATABASE_PATH || '',
    'storage/database/kra-photo-hub.db'
  ),
  logsPath: resolvePath(
    process.env.LOGS_PATH || '',
    'storage/logs'
  ),
  qrPath: resolvePath(
    process.env.QR_PATH || '',
    'storage/qr'
  ),

  sdCardPath: process.env.SD_CARD_PATH || '',
  nasSyncPath: process.env.NAS_SYNC_PATH || '',
  serverBaseUrl: process.env.SERVER_BASE_URL || `http://localhost:3000`,

  // Dashboard build path (served in production)
  dashboardBuildPath: path.resolve(process.cwd(), '../dashboard/dist'),
};
