// server/src/pos/add-ons/addOns.routes.js
import { Router } from "express";
import * as addOnsController from "./addOns.controller.js";

const router = Router();

router.get("/", addOnsController.getAddOns);
router.get("/:id", addOnsController.getAddOn);
router.post("/", addOnsController.createAddOn);
router.put("/:id", addOnsController.updateAddOn);
router.delete("/:id", addOnsController.deleteAddOn);

export default router;