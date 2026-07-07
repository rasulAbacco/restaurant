// server/src/pos/kot/kot.controller.js
import * as kotService from "./kot.service.js";

export async function sendToKitchen(req, res) {
  try {
    const kot = await kotService.sendToKitchen(req.params.orderId, req.body.orderItemIds);
    res.status(201).json(kot);
  } catch (err) {
    res.status(400).json({ message: "Failed to send order to kitchen", error: err.message });
  }
}

export async function getKotsForOrder(req, res) {
  try {
    res.json(await kotService.listKotsForOrder(req.params.orderId));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch KOTs", error: err.message });
  }
}

export async function getKitchenDisplay(req, res) {
  try {
    res.json(await kotService.getActiveKitchenDisplay());
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch kitchen display", error: err.message });
  }
}

export async function updateKotStatus(req, res) {
  try {
    const kot = await kotService.updateKotStatus(req.params.id, req.body.status);
    res.json(kot);
  } catch (err) {
    res.status(400).json({ message: "Failed to update KOT status", error: err.message });
  }
}