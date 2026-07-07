// server/src/pos/delivery-partners/deliveryPartners.controller.js
import * as deliveryPartnersService from "./deliveryPartners.service.js";

export async function getDeliveryPartners(req, res) {
  try {
    res.json(await deliveryPartnersService.listDeliveryPartners(req.query));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch delivery partners", error: err.message });
  }
}

export async function getDeliveryPartner(req, res) {
  try {
    const partner = await deliveryPartnersService.getDeliveryPartnerById(req.params.id);
    if (!partner) return res.status(404).json({ message: "Delivery partner not found" });
    res.json(partner);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch delivery partner", error: err.message });
  }
}

export async function createDeliveryPartner(req, res) {
  try {
    const partner = await deliveryPartnersService.createDeliveryPartner(req.body);
    res.status(201).json(partner);
  } catch (err) {
    res.status(400).json({ message: "Failed to create delivery partner", error: err.message });
  }
}

export async function updateDeliveryPartner(req, res) {
  try {
    const partner = await deliveryPartnersService.updateDeliveryPartner(req.params.id, req.body);
    res.json(partner);
  } catch (err) {
    res.status(400).json({ message: "Failed to update delivery partner", error: err.message });
  }
}

export async function deleteDeliveryPartner(req, res) {
  try {
    await deliveryPartnersService.deleteDeliveryPartner(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: "Failed to delete delivery partner", error: err.message });
  }
}