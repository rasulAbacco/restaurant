// server/src/pos/invoices/invoices.routes.js
import { Router } from "express";
import * as invoicesController from "./invoices.controller.js";

const router = Router();

router.get("/orders/:orderId", invoicesController.getInvoice);
router.post("/orders/:orderId", invoicesController.generateInvoice);
router.post("/:id/send", invoicesController.markSent);

export default router;