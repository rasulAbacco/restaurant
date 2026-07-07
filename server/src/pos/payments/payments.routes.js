// server/src/pos/payments/payments.routes.js
import { Router } from "express";
import * as paymentsController from "./payments.controller.js";

const router = Router();

router.get("/orders/:orderId", paymentsController.getPayments);
router.post("/orders/:orderId", paymentsController.createPayment);
router.delete("/:id", paymentsController.deletePayment);

export default router;