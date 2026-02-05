import express from "express";
import cors from "cors";
import { json } from "body-parser";
import path from "node:path";
import fs from "node:fs";
import { databaseRoutes } from "./api/routes/databaseRoutes";
import { healthRoutes } from "./api/routes/healthRoutes";
import { branchRoutes } from "./api/routes/branchRoutes";
import { sqlRoutes } from "./api/routes/sqlRoutes";
import { envRoutes } from "./api/routes/envRoutes";
import { authRoutes } from "./api/routes/authRoutes";
import { requestContextMiddleware } from "./api/middleware/requestContext";

export class NogaApp {
  private readonly app = express();

  constructor() {
    this.configureMiddleware();
    this.configureRoutes();
  }

  getExpressInstance() {
    return this.app;
  }

  private configureMiddleware() {
    this.app.use(cors());
    this.app.use(json());
    this.app.use(requestContextMiddleware);
  }

  private configureRoutes() {
    const frontendDir = path.join(process.cwd(), "web", "dist");
    const logoDir = path.join(process.cwd(), "logo");
    if (fs.existsSync(frontendDir)) {
      this.app.use(express.static(frontendDir));
    }
    if (fs.existsSync(logoDir)) {
      this.app.use("/logo", express.static(logoDir));
    }
    this.app.use("/api", authRoutes);
    this.app.use("/api", databaseRoutes);
    this.app.use("/api", branchRoutes);
    this.app.use("/api", sqlRoutes);
    this.app.use("/api", envRoutes);
    this.app.use("/api", healthRoutes);
    if (fs.existsSync(frontendDir)) {
      this.app.get("*", (req, res) => {
        res.sendFile(path.join(frontendDir, "index.html"));
      });
    }
  }
}

