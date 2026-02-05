import { Request, Response } from "express";
import { EnvConfig } from "../../config/env";
import { BranchManager } from "../../core/branches/BranchManager";

export class EnvController {
  private readonly env: EnvConfig;
  private readonly branches: BranchManager;

  constructor() {
    this.env = EnvConfig.getInstance();
    this.branches = new BranchManager();
  }

  async getConnectionEnv(req: Request, res: Response): Promise<void> {
    const dbId = req.params.dbId;
    const branchName = (req.query.branch as string | undefined) || "main";
    const branch = await this.branches.getBranchByName(dbId, branchName);
    if (!branch) {
      res.status(404).json({ error: "Branch not found" });
      return;
    }
    const host = req.header("x-noga-base-url") || `${req.protocol}://${req.get("host")}`;
    const apiUrl = `${host}/api`;
    const envBlock = [
      `NOGA_ENV=prod`,
      `NOGA_DB_ID=${dbId}`,
      `NOGA_BRANCH=${branchName}`,
      `NOGA_API_URL=${apiUrl}`,
      `NOGA_API_TOKEN=<your-token-here>`
    ].join("\n");
    res.json({
      dbId,
      branch: branchName,
      apiUrl,
      env: envBlock
    });
  }
}

