export type NogaRole = "admin" | "editor" | "viewer";

export class PermissionService {
  isAllowed(role: NogaRole, action: string): boolean {
    if (role === "admin") {
      return true;
    }
    if (role === "editor") {
      if (action.startsWith("read:")) {
        return true;
      }
      if (action === "write:data") {
        return true;
      }
      return false;
    }
    if (role === "viewer") {
      if (action.startsWith("read:")) {
        return true;
      }
      return false;
    }
    return false;
  }
}

