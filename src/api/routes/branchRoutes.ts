import { Router } from "express";
import { BranchController } from "../controllers/BranchController";

const router = Router();
const controller = new BranchController();

router.get("/databases/:dbId/branches", (req, res) => {
  controller.listBranches(req, res);
});

router.post("/databases/:dbId/branches", (req, res) => {
  controller.createBranch(req, res);
});

export const branchRoutes = router;

