import { Router } from "express";
import { AuthController } from "../controllers/AuthController";

const router = Router();
const controller = new AuthController();

router.post("/auth/register", (req, res) => {
  controller.register(req, res);
});

router.post("/auth/login", (req, res) => {
  controller.login(req, res);
});

router.get("/auth/me", (req, res) => {
  controller.me(req, res);
});

export const authRoutes = router;

