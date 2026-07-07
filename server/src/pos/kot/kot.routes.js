// server/src/pos/kot/kot.routes.js
import { Router } from "express";
import * as kotController from "./kot.controller.js";

const router = Router();

router.get("/display", kotController.getKitchenDisplay);
router.get("/orders/:orderId", kotController.getKotsForOrder);
router.post("/orders/:orderId", kotController.sendToKitchen);
router.put("/:id/status", kotController.updateKotStatus);

export default router;