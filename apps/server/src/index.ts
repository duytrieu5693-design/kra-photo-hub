import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import { initDb } from './db/database';
import { log } from './services/logger';

// Routes
import systemRouter from './routes/system';
import cardRouter from './routes/card';
import importRouter from './routes/import';
import photosRouter from './routes/photos';
import batchRouter from './routes/batch';
import downloadRouter from './routes/download';

// Ensure all storage directories exist
function ensureStorageDirs(): void {
  const dirs = [
    config.photoLibraryPath,
    config.exportPath,
    config.batchPath,
    config.qrPath,
    path.dirname(config.databasePath),
    config.logsPath,
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  }
}

async function main(): Promise<void> {
  // Setup storage directories
  ensureStorageDirs();

  // Initialize database
  initDb();

  const app = express();

  // CORS - allow all origins for local network access from iPad
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.use('/api/system', systemRouter);
  app.use('/api/card', cardRouter);
  app.use('/api/import', importRouter);
  app.use('/api/photos', photosRouter);
  app.use('/api/batch', batchRouter);

  // Download route (public, for customers)
  app.use('/download', downloadRouter);

  // Serve QR code images
  app.use('/qr', express.static(config.qrPath));

  // Serve dashboard (production build)
  if (fs.existsSync(config.dashboardBuildPath)) {
    app.use(express.static(config.dashboardBuildPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(config.dashboardBuildPath, 'index.html'));
    });
  } else {
    app.get('/', (_req, res) => {
      res.json({
        message: 'KRA Photo Hub Server running',
        api: '/api',
        note: 'Dashboard not built. Run: npm run dashboard:build',
      });
    });
  }

  // Global error handler
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    log('error', 'server_error', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  });

  app.listen(config.port, config.host, () => {
    console.log('');
    console.log('========================================');
    console.log('  KRA Photo Hub Server');
    console.log('========================================');
    console.log(`  Server: http://${config.host}:${config.port}`);
    console.log(`  Local:  http://localhost:${config.port}`);
    console.log(`  DB:     ${config.databasePath}`);
    console.log(`  Photos: ${config.photoLibraryPath}`);
    console.log('========================================');
    console.log('');

    log('info', 'server_start', `Server started on port ${config.port}`);
  });
}

main().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
