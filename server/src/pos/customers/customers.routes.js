// server/src/pos/customers/customers.routes.js
import { Router } from "express";
import * as customersController from "./customers.controller.js";

const router = Router();

router.get("/search", customersController.searchCustomers);
router.get("/", customersController.getCustomers);
router.get("/:id", customersController.getCustomer);
router.post("/", customersController.createCustomer);
router.put("/:id", customersController.updateCustomer);
router.delete("/:id", customersController.deleteCustomer);

export default router;