import { Router } from "express";
import { EnvController } from "../controllers/EnvController";

const router = Router();
const controller = new EnvController();

router.get("/databases/:dbId/env", (req, res) => {
  controller.getConnectionEnv(req, res);
});

export const envRoutes = router;

