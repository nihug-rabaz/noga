import { Request, Response } from "express";
import { BranchManager } from "../../core/branches/BranchManager";
import { PermissionService } from "../../core/auth/PermissionService";
import { AuditService } from "../../core/audit/AuditService";

export class BranchController {
  private readonly branches: BranchManager;
  private readonly permissions: PermissionService;
  private readonly audit: AuditService;

  constructor() {
    this.branches = new BranchManager();
    this.permissions = new PermissionService();
    this.audit = new AuditService();
  }

  async listBranches(req: Request, res: Response): Promise<void> {
    const dbId = req.params.dbId;
    const context = req.nogaContext;
    if (!context || !this.permissions.isAllowed(context.role, "read:branches")) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const list = await this.branches.listBranchesForDatabase(dbId);
    res.json({ branches: list });
  }

  async createBranch(req: Request, res: Response): Promise<void> {
    const dbId = req.params.dbId;
    const name: string | undefined = req.body?.name;
    const sourceBranchName: string | null = req.body?.sourceBranchName ?? null;
    const context = req.nogaContext;
    if (!context || !this.permissions.isAllowed(context.role, "write:data")) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (!name || !/^[a-zA-Z0-9_-]+$/.test(name)) {
      res.status(400).json({ error: "Invalid branch name. Use letters, numbers, '-', '_'." });
      return;
    }
    const existing = await this.branches.getBranchByName(dbId, name);
    if (existing) {
      res.status(409).json({ error: "Branch with this name already exists." });
      return;
    }
    try {
      const branch = await this.branches.createBranch(dbId, name, sourceBranchName);
      await this.audit.log("create_branch", context.actor, dbId, name, sourceBranchName);
      res.status(201).json({ branch });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}

