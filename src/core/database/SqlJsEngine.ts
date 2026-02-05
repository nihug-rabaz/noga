import initSqlJs, { Database, SqlJsStatic } from "sql.js";
import fs from "node:fs";
import path from "node:path";

export class SqlJsEngine {
  private static instance: SqlJsEngine | null = null;
  private readonly sqlPromise: Promise<SqlJsStatic>;

  private constructor() {
    this.sqlPromise = initSqlJs({
      locateFile: (file) => path.join(process.cwd(), "node_modules", "sql.js", "dist", file)
    });
  }

  static getInstance(): SqlJsEngine {
    if (!this.instance) {
      this.instance = new SqlJsEngine();
    }
    return this.instance;
  }

  async withDatabase<T>(filePath: string, handler: (db: Database) => Promise<T> | T): Promise<T> {
    const SQL = await this.sqlPromise;
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    let database: Database;
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      database = new SQL.Database(new Uint8Array(fileBuffer));
    } else {
      database = new SQL.Database();
    }
    try {
      const result = await handler(database);
      const data = database.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(filePath, buffer);
      return result;
    } finally {
      database.close();
    }
  }
}

