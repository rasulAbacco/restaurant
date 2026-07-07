// server/src/pos/delivery-partners/deliveryPartners.routes.js
import { Router } from "express";
import * as deliveryPartnersController from "./deliveryPartners.controller.js";

const router = Router();

router.get("/", deliveryPartnersController.getDeliveryPartners);
router.get("/:id", deliveryPartnersController.getDeliveryPartner);
router.post("/", deliveryPartnersController.createDeliveryPartner);
router.put("/:id", deliveryPartnersController.updateDeliveryPartner);
router.delete("/:id", deliveryPartnersController.deleteDeliveryPartner);

export default router;