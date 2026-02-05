import { BranchManager } from "../branches/BranchManager";
import { SqlJsEngine } from "../database/SqlJsEngine";

export class SqlExecutor {
  private readonly branches: BranchManager;
  private readonly engine: SqlJsEngine;

  constructor() {
    this.branches = new BranchManager();
    this.engine = SqlJsEngine.getInstance();
  }

  async executeQuery(dbId: string, branchName: string, sql: string, params: unknown[] | undefined): Promise<unknown[]> {
    const branch = await this.branches.getBranchByName(dbId, branchName);
    if (!branch) {
      throw new Error("Branch not found");
    }
    const rows = await this.engine.withDatabase(branch.filePath, async (db) => {
      const statement = db.prepare(sql);
      if (params && params.length > 0) {
        statement.bind(params as unknown[]);
      }
      const result: unknown[] = [];
      while (statement.step()) {
        result.push(statement.getAsObject());
      }
      statement.free();
      return result;
    });
    return rows;
  }

  async executeStatement(
    dbId: string,
    branchName: string,
    sql: string,
    params: unknown[] | undefined
  ): Promise<{ changes: number; lastInsertRowid: unknown }> {
    const branch = await this.branches.getBranchByName(dbId, branchName);
    if (!branch) {
      throw new Error("Branch not found");
    }
    const result = await this.engine.withDatabase(branch.filePath, async (db) => {
      const statement = db.prepare(sql);
      if (params && params.length > 0) {
        statement.bind(params as unknown[]);
      }
      statement.step();
      statement.free();
      return { changes: db.getRowsModified(), lastInsertRowid: db.exec("SELECT last_insert_rowid() as id")[0]?.values?.[0]?.[0] };
    });
    return result;
  }
}

