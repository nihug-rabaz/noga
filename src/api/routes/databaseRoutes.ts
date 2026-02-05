import { Router } from "express";
import { DatabaseController } from "../controllers/DatabaseController";

const router = Router();
const controller = new DatabaseController();

router.get("/databases", (req, res) => {
  controller.listDatabases(req, res);
});

router.post("/databases", (req, res) => {
  controller.createDatabase(req, res);
});

export const databaseRoutes = router;

