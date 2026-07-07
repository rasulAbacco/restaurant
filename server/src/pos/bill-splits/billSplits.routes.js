// server/src/pos/bill-splits/billSplits.routes.js
import { Router } from "express";
import * as billSplitsController from "./billSplits.controller.js";

const router = Router();

router.get("/orders/:orderId", billSplitsController.getSplits);
router.post("/orders/:orderId", billSplitsController.createSplits);
router.delete("/:id", billSplitsController.deleteSplit);

export default router;