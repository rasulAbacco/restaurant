// server/src/pos/discounts/discounts.routes.js
import { Router } from "express";
import * as discountsController from "./discounts.controller.js";

const router = Router();

router.get("/", discountsController.getDiscounts);
router.get("/:id", discountsController.getDiscount);
router.post("/", discountsController.createDiscount);
router.put("/:id", discountsController.updateDiscount);
router.delete("/:id", discountsController.deleteDiscount);
router.post("/orders/:orderId/apply", discountsController.applyDiscount);

export default router;