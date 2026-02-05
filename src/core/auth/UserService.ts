import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { MetaDatabase, UserRecord } from "../meta/MetaDatabase";
import { EnvConfig } from "../../config/env";
import jwt from "jsonwebtoken";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export class UserService {
  private readonly meta: MetaDatabase;
  private readonly env: EnvConfig;

  constructor() {
    this.meta = MetaDatabase.getInstance();
    this.env = EnvConfig.getInstance();
  }

  async register(email: string, name: string, password: string): Promise<{ user: AuthUser; token: string }> {
    const role = (await this.meta.countUsers()) === 0 ? "admin" : "editor";
    const id = crypto.randomUUID();
    const hash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    await (this.meta as any).engine.withDatabase(this.env.getMetaDatabasePath(), async (db: any) => {
      const stmt = db.prepare(
        "INSERT INTO users (id, email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)"
      );
      stmt.run([id, email, name, hash, role, now]);
      stmt.free();
    });

    const user: AuthUser = { id, email, name, role };
    const token = this.signToken(user);
    return { user, token };
  }

  async login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
    const record = await this.findByEmail(email);
    if (!record) {
      throw new Error("Invalid credentials");
    }
    const ok = await bcrypt.compare(password, record.passwordHash);
    if (!ok) {
      throw new Error("Invalid credentials");
    }
    const user: AuthUser = {
      id: record.id,
      email: record.email,
      name: record.name,
      role: record.role
    };
    const token = this.signToken(user);
    return { user, token };
  }

  verifyToken(token: string): AuthUser | null {
    try {
      const decoded = jwt.verify(token, this.env.getJwtSecret()) as AuthUser;
      return decoded;
    } catch {
      return null;
    }
  }

  private async findByEmail(email: string): Promise<UserRecord | null> {
    const record = await (this.meta as any).engine.withDatabase(
      this.env.getMetaDatabasePath(),
      async (db: any) => {
        const stmt = db.prepare(
          "SELECT id, email, name, password_hash as passwordHash, role, created_at as createdAt FROM users WHERE email = ? LIMIT 1"
        );
        stmt.bind([email]);
        const hasRow = stmt.step();
        if (!hasRow) {
          stmt.free();
          return null;
        }
        const row = stmt.getAsObject() as unknown as UserRecord;
        stmt.free();
        return row;
      }
    );
    return record;
  }

  private signToken(user: AuthUser): string {
    return jwt.sign(user, this.env.getJwtSecret(), { expiresIn: "12h" });
  }
}

