import { Request, Response, NextFunction } from "express";
import { NogaRole } from "../../core/auth/PermissionService";
import { UserService } from "../../core/auth/UserService";

export type NogaRequestContext = {
  role: NogaRole;
  actor: string | null;
};

declare module "express-serve-static-core" {
  interface Request {
    nogaContext?: NogaRequestContext;
  }
}

const users = new UserService();

export async function requestContextMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const header = req.header("authorization");
  if (header && header.startsWith("Bearer ")) {
    const token = header.substring("Bearer ".length);
    const user = users.verifyToken(token);
    if (user) {
      req.nogaContext = { role: user.role as NogaRole, actor: user.email };
    }
  }
  next();
}

