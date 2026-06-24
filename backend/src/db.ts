import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function getDB(): Promise<Database> {
  if (db) return db;

  const dbPath = path.join(__dirname, '..', 'database.sqlite');
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Ensure table exists
  await db.exec(`
    CREATE TABLE IF NOT EXISTS urls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      original_url TEXT NOT NULL,
      short_code TEXT NOT NULL UNIQUE,
      clicks INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create an index on short_code for faster lookups
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code)
  `);

  return db;
}
