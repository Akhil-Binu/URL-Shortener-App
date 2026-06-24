"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDB = getDB;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const path_1 = __importDefault(require("path"));
let db = null;
async function getDB() {
    if (db)
        return db;
    const dbPath = path_1.default.join(__dirname, '..', 'database.sqlite');
    db = await (0, sqlite_1.open)({
        filename: dbPath,
        driver: sqlite3_1.default.Database
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
