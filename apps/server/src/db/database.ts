/**
 * Database layer using Node.js built-in SQLite (node:sqlite).
 * Requires Node.js v22.5.0 or later — no native compilation needed.
 */
import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { config } from '../config';

let db: DatabaseSync;

export function getDb(): DatabaseSync {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

export function initDb(): DatabaseSync {
  const dbDir = path.dirname(config.databasePath);
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

  db = new DatabaseSync(config.databasePath);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');
  createTables(db);
  createIndexes(db);
  return db;
}

function createTables(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL UNIQUE,
      file_type TEXT NOT NULL CHECK(file_type IN ('JPEG', 'RAW')),
      file_size INTEGER NOT NULL,
      capture_time DATETIME,
      camera_model TEXT,
      lens TEXT,
      file_hash TEXT NOT NULL,
      imported_at DATETIME NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS batches (
      id TEXT PRIMARY KEY,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      photo_count INTEGER NOT NULL DEFAULT 0,
      zip_path TEXT,
      download_url TEXT,
      delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK(delivery_status IN ('pending', 'ready', 'delivered')),
      created_at DATETIME NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS batch_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_id TEXT NOT NULL,
      photo_id INTEGER NOT NULL,
      FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
      FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE,
      UNIQUE(batch_id, photo_id)
    );

    CREATE TABLE IF NOT EXISTS imports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_path TEXT NOT NULL,
      total_files INTEGER NOT NULL DEFAULT 0,
      new_files INTEGER NOT NULL DEFAULT 0,
      skipped_files INTEGER NOT NULL DEFAULT 0,
      started_at DATETIME NOT NULL DEFAULT (datetime('now')),
      completed_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS system_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      log_time DATETIME NOT NULL DEFAULT (datetime('now')),
      log_level TEXT NOT NULL DEFAULT 'info' CHECK(log_level IN ('info', 'warning', 'error')),
      event_type TEXT NOT NULL,
      message TEXT NOT NULL
    );
  `);
}

function createIndexes(db: DatabaseSync): void {
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_photos_capture_time ON photos(capture_time);
    CREATE INDEX IF NOT EXISTS idx_photos_file_hash ON photos(file_hash);
    CREATE INDEX IF NOT EXISTS idx_photos_file_name ON photos(file_name);
    CREATE INDEX IF NOT EXISTS idx_batch_photos_batch ON batch_photos(batch_id);
    CREATE INDEX IF NOT EXISTS idx_batch_photos_photo ON batch_photos(photo_id);
    CREATE INDEX IF NOT EXISTS idx_system_logs_time ON system_logs(log_time);
  `);
}
