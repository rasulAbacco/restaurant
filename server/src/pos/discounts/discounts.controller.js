// server/src/pos/discounts/discounts.controller.js
import * as discountsService from "./discounts.service.js";

export async function getDiscounts(req, res) {
  try {
    res.json(await discountsService.listDiscounts(req.query));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch discounts", error: err.message });
  }
}

export async function getDiscount(req, res) {
  try {
    const discount = await discountsService.getDiscountById(req.params.id);
    if (!discount) return res.status(404).json({ message: "Discount not found" });
    res.json(discount);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch discount", error: err.message });
  }
}

export async function createDiscount(req, res) {
  try {
    const discount = await discountsService.createDiscount(req.body);
    res.status(201).json(discount);
  } catch (err) {
    res.status(400).json({ message: "Failed to create discount", error: err.message });
  }
}

export async function updateDiscount(req, res) {
  try {
    const discount = await discountsService.updateDiscount(req.params.id, req.body);
    res.json(discount);
  } catch (err) {
    res.status(400).json({ message: "Failed to update discount", error: err.message });
  }
}

export async function deleteDiscount(req, res) {
  try {
    await discountsService.deleteDiscount(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: "Failed to delete discount", error: err.message });
  }
}

export async function applyDiscount(req, res) {
  try {
    const orderDiscount = await discountsService.applyDiscountToOrder(req.params.orderId, req.body);
    res.status(201).json(orderDiscount);
  } catch (err) {
    res.status(400).json({ message: "Failed to apply discount", error: err.message });
  }
}