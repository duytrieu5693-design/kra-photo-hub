import { getDb } from '../db/database';

type LogLevel = 'info' | 'warning' | 'error';

export function log(level: LogLevel, eventType: string, message: string): void {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const prefix = `[${now}] [${level.toUpperCase()}] [${eventType}]`;
  console.log(`${prefix} ${message}`);

  try {
    const db = getDb();
    db.prepare(`
      INSERT INTO system_logs (log_time, log_level, event_type, message)
      VALUES (datetime('now'), ?, ?, ?)
    `).run(level, eventType, message);
  } catch {
    console.error('Logger: Failed to write to DB');
  }
}

export function getLogs(limit = 100): Array<{
  id: number;
  log_time: string;
  log_level: string;
  event_type: string;
  message: string;
}> {
  const db = getDb();
  return db.prepare(`
    SELECT id, log_time, log_level, event_type, message
    FROM system_logs
    ORDER BY log_time DESC
    LIMIT ?
  `).all(limit) as Array<{
    id: number;
    log_time: string;
    log_level: string;
    event_type: string;
    message: string;
  }>;
}
