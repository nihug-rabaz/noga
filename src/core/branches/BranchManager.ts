import path from "node:path";
import fs from "node:fs";
import { EnvConfig } from "../../config/env";
import { SqlJsEngine } from "../database/SqlJsEngine";
import { MetaDatabase } from "../meta/MetaDatabase";

export type BranchRecord = {
  id: string;
  dbId: string;
  name: string;
  filePath: string;
  createdAt: string;
};

export class BranchManager {
  private readonly env: EnvConfig;
  private readonly meta: MetaDatabase;
  private readonly engine: SqlJsEngine;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.env = EnvConfig.getInstance();
    this.meta = MetaDatabase.getInstance();
    this.engine = SqlJsEngine.getInstance();
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
      return;
    }
    this.initPromise = this.engine.withDatabase(this.env.getMetaDatabasePath(), async (db) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS branches (
          id TEXT PRIMARY KEY,
          db_id TEXT NOT NULL,
          name TEXT NOT NULL,
          file_path TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `);
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_branches_db_id ON branches(db_id);
      `);
    });
    await this.initPromise;
  }

  async createMainBranch(dbId: string): Promise<BranchRecord> {
    await this.ensureInitialized();
    const id = `${dbId}-main`;
    const name = "main";
    const filePath = this.buildDatabaseFilePath(dbId, name);
    const exists = await this.meta.logicalDatabaseExists(dbId);
    if (!exists) {
      throw new Error("Logical database does not exist");
    }
    if (!fs.existsSync(filePath)) {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, Buffer.alloc(0));
    }
    const now = new Date().toISOString();
    await this.engine.withDatabase(this.env.getMetaDatabasePath(), async (db) => {
      const stmt = db.prepare("INSERT INTO branches (id, db_id, name, file_path, created_at) VALUES (?, ?, ?, ?, ?)");
      stmt.run([id, dbId, name, filePath, now]);
      stmt.free();
    });
    return { id, dbId, name, filePath, createdAt: now };
  }

  async listBranchesForDatabase(dbId: string): Promise<BranchRecord[]> {
    await this.ensureInitialized();
    const records = await this.engine.withDatabase(this.env.getMetaDatabasePath(), async (db) => {
      const stmt = db.prepare(
        "SELECT id, db_id as dbId, name, file_path as filePath, created_at as createdAt FROM branches WHERE db_id = ? ORDER BY created_at DESC"
      );
      stmt.bind([dbId]);
      const rows: BranchRecord[] = [];
      while (stmt.step()) {
        const row = stmt.getAsObject() as unknown as BranchRecord;
        rows.push(row);
      }
      stmt.free();
      return rows;
    });
    return records;
  }

  async createBranch(dbId: string, name: string, sourceBranchName: string | null): Promise<BranchRecord> {
    await this.ensureInitialized();
    const exists = await this.meta.logicalDatabaseExists(dbId);
    if (!exists) {
      throw new Error("Logical database does not exist");
    }
    const source = sourceBranchName ? await this.getBranchByName(dbId, sourceBranchName) : null;
    const filePath = this.buildDatabaseFilePath(dbId, name);
    if (source) {
      const sourcePath = source.filePath;
      if (!fs.existsSync(sourcePath)) {
        throw new Error("Source branch file does not exist");
      }
      this.copyDatabaseFile(sourcePath, filePath);
    } else if (!fs.existsSync(filePath)) {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, Buffer.alloc(0));
    }
    const id = `${dbId}-${name}`;
    const now = new Date().toISOString();
    await this.engine.withDatabase(this.env.getMetaDatabasePath(), async (db) => {
      const stmt = db.prepare("INSERT INTO branches (id, db_id, name, file_path, created_at) VALUES (?, ?, ?, ?, ?)");
      stmt.run([id, dbId, name, filePath, now]);
      stmt.free();
    });
    return { id, dbId, name, filePath, createdAt: now };
  }

  async getBranchByName(dbId: string, name: string): Promise<BranchRecord | null> {
    await this.ensureInitialized();
    const record = await this.engine.withDatabase(this.env.getMetaDatabasePath(), async (db) => {
      const stmt = db.prepare(
        "SELECT id, db_id as dbId, name, file_path as filePath, created_at as createdAt FROM branches WHERE db_id = ? AND name = ? LIMIT 1"
      );
      stmt.bind([dbId, name]);
      const hasRow = stmt.step();
      if (!hasRow) {
        stmt.free();
        return null;
      }
      const row = stmt.getAsObject() as unknown as BranchRecord;
      stmt.free();
      return row;
    });
    return record;
  }

  private copyDatabaseFile(sourcePath: string, targetPath: string): void {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.copyFileSync(sourcePath, targetPath);
  }

  private buildDatabaseFilePath(dbId: string, branchName: string): string {
    const baseDir = this.env.getDataDirectory();
    const fileName = `${dbId}__${branchName}.db`;
    return path.join(baseDir, "databases", fileName);
  }
}

