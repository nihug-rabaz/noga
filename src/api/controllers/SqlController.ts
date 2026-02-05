import { Request, Response } from "express";
import { SqlExecutor } from "../../core/sql/SqlExecutor";
import { PermissionService } from "../../core/auth/PermissionService";
import { AuditService } from "../../core/audit/AuditService";

export class SqlController {
  private readonly executor: SqlExecutor;
  private readonly permissions: PermissionService;
  private readonly audit: AuditService;

  constructor() {
    this.executor = new SqlExecutor();
    this.permissions = new PermissionService();
    this.audit = new AuditService();
  }

  async query(req: Request, res: Response): Promise<void> {
    const context = req.nogaContext;
    if (!context || !this.permissions.isAllowed(context.role, "read:data")) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const dbId: string | undefined = req.body?.dbId;
    const branch: string | undefined = req.body?.branch;
    const sql: string | undefined = req.body?.sql;
    const params: unknown[] | undefined = req.body?.params;
    if (!dbId || !branch || !sql) {
      res.status(400).json({ error: "Missing dbId, branch or sql." });
      return;
    }
    try {
      const rows = await this.executor.executeQuery(dbId, branch, sql, params);
      await this.audit.log("sql_query", context.actor, dbId, branch, sql);
      res.json({ rows });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async execute(req: Request, res: Response): Promise<void> {
    const context = req.nogaContext;
    if (!context || !this.permissions.isAllowed(context.role, "write:data")) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const dbId: string | undefined = req.body?.dbId;
    const branch: string | undefined = req.body?.branch;
    const sql: string | undefined = req.body?.sql;
    const params: unknown[] | undefined = req.body?.params;
    if (!dbId || !branch || !sql) {
      res.status(400).json({ error: "Missing dbId, branch or sql." });
      return;
    }
    try {
      const result = await this.executor.executeStatement(dbId, branch, sql, params);
      await this.audit.log("sql_execute", context.actor, dbId, branch, sql);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}

