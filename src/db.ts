import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('clara_pipeline.db');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id TEXT NOT NULL,
    version_number INTEGER NOT NULL,
    transcript TEXT NOT NULL,
    memo_json TEXT NOT NULL,
    agent_spec_json TEXT NOT NULL,
    changelog TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id)
  );
`);

export default db;
