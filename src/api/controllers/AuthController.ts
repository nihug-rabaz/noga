import { Request, Response } from "express";
import { UserService } from "../../core/auth/UserService";

export class AuthController {
  private readonly users: UserService;

  constructor() {
    this.users = new UserService();
  }

  async register(req: Request, res: Response): Promise<void> {
    const email: string | undefined = req.body?.email;
    const name: string | undefined = req.body?.name;
    const password: string | undefined = req.body?.password;
    if (!email || !name || !password) {
      res.status(400).json({ error: "Missing email, name or password." });
      return;
    }
    try {
      const { user, token } = await this.users.register(email, name, password);
      res.status(201).json({ user, token });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    const email: string | undefined = req.body?.email;
    const password: string | undefined = req.body?.password;
    if (!email || !password) {
      res.status(400).json({ error: "Missing email or password." });
      return;
    }
    try {
      const { user, token } = await this.users.login(email, password);
      res.json({ user, token });
    } catch (error) {
      res.status(401).json({ error: (error as Error).message });
    }
  }

  async me(req: Request, res: Response): Promise<void> {
    const context = req.nogaContext;
    if (!context) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    res.json({ actor: context.actor, role: context.role });
  }
}

