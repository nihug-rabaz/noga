import { EnvConfig } from "../../config/env";
import { SqlJsEngine } from "../database/SqlJsEngine";

export type LogicalDatabaseRecord = {
  id: string;
  description: string | null;
  createdAt: string;
};

export type AuditLogRecord = {
  id: number;
  action: string;
  actor: string | null;
  dbId: string | null;
  branchName: string | null;
  details: string | null;
  createdAt: string;
};

export type UserRecord = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: string;
  createdAt: string;
};

export class MetaDatabase {
  private static instance: MetaDatabase | null = null;
  private readonly env: EnvConfig;
  private readonly engine: SqlJsEngine;
  private initPromise: Promise<void> | null = null;

  private constructor() {
    this.env = EnvConfig.getInstance();
    this.engine = SqlJsEngine.getInstance();
  }

  static getInstance(): MetaDatabase {
    if (!this.instance) {
      this.instance = new MetaDatabase();
    }
    return this.instance;
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
      return;
    }
    this.initPromise = this.engine.withDatabase(this.env.getMetaDatabasePath(), async (db) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS logical_databases (
          id TEXT PRIMARY KEY,
          description TEXT,
          created_at TEXT NOT NULL
        );
      `);
      db.run(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          action TEXT NOT NULL,
          actor TEXT,
          db_id TEXT,
          branch_name TEXT,
          details TEXT,
          created_at TEXT NOT NULL
        );
      `);
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `);
    });
    await this.initPromise;
  }

  async createLogicalDatabase(id: string, description: string | null): Promise<LogicalDatabaseRecord> {
    await this.ensureInitialized();
    const now = new Date().toISOString();
    await this.engine.withDatabase(this.env.getMetaDatabasePath(), async (db) => {
      const stmt = db.prepare("INSERT INTO logical_databases (id, description, created_at) VALUES (?, ?, ?)");
      stmt.run([id, description, now]);
      stmt.free();
    });
    return { id, description, createdAt: now };
  }

  async listLogicalDatabases(): Promise<LogicalDatabaseRecord[]> {
    await this.ensureInitialized();
    const records = await this.engine.withDatabase(this.env.getMetaDatabasePath(), async (db) => {
      const stmt = db.prepare("SELECT id, description, created_at as createdAt FROM logical_databases ORDER BY created_at DESC");
      const rows = [] as LogicalDatabaseRecord[];
      while (stmt.step()) {
        const row = stmt.getAsObject() as unknown as LogicalDatabaseRecord;
        rows.push(row);
      }
      stmt.free();
      return rows;
    });
    return records;
  }

  async logicalDatabaseExists(id: string): Promise<boolean> {
    await this.ensureInitialized();
    const exists = await this.engine.withDatabase(this.env.getMetaDatabasePath(), async (db) => {
      const stmt = db.prepare("SELECT 1 FROM logical_databases WHERE id = ? LIMIT 1");
      stmt.bind([id]);
      const hasRow = stmt.step();
      stmt.free();
      return hasRow;
    });
    return exists;
  }

  async appendAuditLog(action: string, actor: string | null, dbId: string | null, branchName: string | null, details: string | null): Promise<void> {
    await this.ensureInitialized();
    const now = new Date().toISOString();
    await this.engine.withDatabase(this.env.getMetaDatabasePath(), async (db) => {
      const stmt = db.prepare(
        "INSERT INTO audit_logs (action, actor, db_id, branch_name, details, created_at) VALUES (?, ?, ?, ?, ?, ?)"
      );
      stmt.run([action, actor, dbId, branchName, details, now]);
      stmt.free();
    });
  }

  async countUsers(): Promise<number> {
    await this.ensureInitialized();
    const count = await this.engine.withDatabase(this.env.getMetaDatabasePath(), async (db) => {
      const stmt = db.prepare("SELECT COUNT(*) as c FROM users");
      stmt.step();
      const row = stmt.getAsObject() as { c: number };
      stmt.free();
      return row.c;
    });
    return count;
  }
}

