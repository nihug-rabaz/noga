import { Request, Response } from "express";
import { MetaDatabase } from "../../core/meta/MetaDatabase";
import { BranchManager } from "../../core/branches/BranchManager";

export class DatabaseController {
  private readonly meta: MetaDatabase;
  private readonly branchManager: BranchManager;

  constructor() {
    this.meta = MetaDatabase.getInstance();
    this.branchManager = new BranchManager();
  }

  async listDatabases(req: Request, res: Response): Promise<void> {
    const databases = await this.meta.listLogicalDatabases();
    res.json({ databases });
  }

  async createDatabase(req: Request, res: Response): Promise<void> {
    const id: string | undefined = req.body?.id;
    const description: string | undefined = req.body?.description;

    if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      res.status(400).json({ error: "Invalid id. Use letters, numbers, '-', '_'." });
      return;
    }

    if (await this.meta.logicalDatabaseExists(id)) {
      res.status(409).json({ error: "Database with this id already exists." });
      return;
    }

    const record = await this.meta.createLogicalDatabase(id, description ?? null);
    const mainBranch = await this.branchManager.createMainBranch(id);

    res.status(201).json({
      database: record,
      branches: [mainBranch],
    });
  }
}

