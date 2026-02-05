import { MetaDatabase } from "../meta/MetaDatabase";

export class AuditService {
  private readonly meta: MetaDatabase;

  constructor() {
    this.meta = MetaDatabase.getInstance();
  }

  async log(action: string, actor: string | null, dbId: string | null, branchName: string | null, details: string | null): Promise<void> {
    await this.meta.appendAuditLog(action, actor, dbId, branchName, details);
  }
}

