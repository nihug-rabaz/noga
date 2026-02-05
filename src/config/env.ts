import dotenv from "dotenv";
import path from "node:path";

dotenv.config();

export class EnvConfig {
  private static instance: EnvConfig | null = null;

  private constructor() {}

  static getInstance(): EnvConfig {
    if (!this.instance) {
      this.instance = new EnvConfig();
    }
    return this.instance;
  }

  getPort(): number {
    const value = process.env.NOGA_PORT || "4001";
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 4001 : parsed;
  }

  getDataDirectory(): string {
    const dir = process.env.NOGA_DATA_DIR || path.join(process.cwd(), "data");
    return dir;
  }

  getMetaDatabasePath(): string {
    const dir = this.getDataDirectory();
    return path.join(dir, "meta.db");
  }

  getJwtSecret(): string {
    return process.env.NOGA_JWT_SECRET || "noga-dev-secret-change-me";
  }
}

