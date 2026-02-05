export type LogicalDatabase = {
  id: string;
  description: string | null;
  createdAt: string;
};

export type Branch = {
  id: string;
  dbId: string;
  name: string;
  filePath: string;
  createdAt: string;
};

export class NogaClient {
  private readonly baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null): void {
    this.token = token;
  }

  private authHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this.token) {
      headers["authorization"] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async register(email: string, name: string, password: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, name, password })
    });
    const body = await response.json();
    if (!response.ok) {
      throw new Error(body.error || "Registration failed");
    }
    this.setToken(body.token as string);
  }

  async login(email: string, password: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });
    const body = await response.json();
    if (!response.ok) {
      throw new Error(body.error || "Login failed");
    }
    this.setToken(body.token as string);
  }

  async listDatabases(): Promise<LogicalDatabase[]> {
    const response = await fetch(`${this.baseUrl}/databases`, {
      headers: this.authHeaders()
    });
    const body = await response.json();
    return body.databases as LogicalDatabase[];
  }

  async createDatabase(id: string, description: string | null): Promise<void> {
    await fetch(`${this.baseUrl}/databases`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.authHeaders()
      },
      body: JSON.stringify({ id, description })
    });
  }

  async listBranches(dbId: string): Promise<Branch[]> {
    const response = await fetch(`${this.baseUrl}/databases/${dbId}/branches`, {
      headers: this.authHeaders()
    });
    const body = await response.json();
    return body.branches as Branch[];
  }

  async createBranch(dbId: string, name: string, sourceBranchName: string | null): Promise<void> {
    await fetch(`${this.baseUrl}/databases/${dbId}/branches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.authHeaders()
      },
      body: JSON.stringify({ name, sourceBranchName })
    });
  }

  async getEnv(dbId: string, branch: string): Promise<string> {
    const url = new URL(`${this.baseUrl}/databases/${dbId}/env`, window.location.origin);
    url.searchParams.set("branch", branch);
    const response = await fetch(url.toString(), {
      headers: this.authHeaders()
    });
    const body = await response.json();
    return body.env as string;
  }

  async runQuery(dbId: string, branch: string, sql: string): Promise<unknown[]> {
    const response = await fetch(`${this.baseUrl}/sql/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.authHeaders()
      },
      body: JSON.stringify({ dbId, branch, sql, params: [] })
    });
    const body = await response.json();
    return body.rows as unknown[];
  }

  async executeSql(dbId: string, branch: string, sql: string): Promise<{ changes: number; lastInsertRowid: unknown }> {
    const response = await fetch(`${this.baseUrl}/sql/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.authHeaders()
      },
      body: JSON.stringify({ dbId, branch, sql, params: [] })
    });
    return (await response.json()) as { changes: number; lastInsertRowid: unknown };
  }
}

