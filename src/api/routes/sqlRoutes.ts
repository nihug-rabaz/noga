import { Router } from "express";
import { SqlController } from "../controllers/SqlController";

const router = Router();
const controller = new SqlController();

router.post("/sql/query", (req, res) => {
  controller.query(req, res);
});

router.post("/sql/execute", (req, res) => {
  controller.execute(req, res);
});

export const sqlRoutes = router;

