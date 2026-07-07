// server/src/pos/loyalty/loyalty.routes.js
import { Router } from "express";
import * as loyaltyController from "./loyalty.controller.js";

const router = Router();

router.get("/customers/:customerId", loyaltyController.getTransactions);
router.post("/", loyaltyController.createTransaction);
router.post("/orders/:orderId/earn", loyaltyController.earnFromOrder);

export default router;