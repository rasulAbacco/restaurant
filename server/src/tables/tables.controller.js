// server/src/pos/tables/tables.controller.js
import * as tablesService from "./tables.service.js";

const storeOf = (req) => req.user?.store || "Main Store";

// ==============================================
// FLOORS
// ==============================================

export async function getFloors(req, res) {
  try {
    res.json(await tablesService.listFloors(storeOf(req)));
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch floors", error: err.message });
  }
}

export async function createFloor(req, res) {
  try {
    const floor = await tablesService.createFloor({
      ...req.body,
      store: storeOf(req),
    });
    res.status(201).json(floor);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to create floor", error: err.message });
  }
}

export async function updateFloor(req, res) {
  try {
    const floor = await tablesService.updateFloor(req.params.id, req.body);
    res.json(floor);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to update floor", error: err.message });
  }
}

export async function deleteFloor(req, res) {
  try {
    await tablesService.deleteFloor(req.params.id);
    res.status(204).send();
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to delete floor", error: err.message });
  }
}

// ==============================================
// TABLES — CRUD
// ==============================================

export async function getTables(req, res) {
  try {
    const { floorId } = req.query;
    const tables = floorId
      ? await tablesService.listTablesByFloor(floorId)
      : await tablesService.listAllTables(storeOf(req));
    res.json(tables);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch tables", error: err.message });
  }
}

export async function createTable(req, res) {
  try {
    const table = await tablesService.createTable({
      ...req.body,
      store: storeOf(req),
    });
    res.status(201).json(table);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to create table", error: err.message });
  }
}

export async function updateTable(req, res) {
  try {
    const table = await tablesService.updateTable(req.params.id, req.body);
    res.json(table);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to update table", error: err.message });
  }
}

export async function deleteTable(req, res) {
  try {
    await tablesService.deleteTable(req.params.id);
    res.status(204).send();
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to delete table", error: err.message });
  }
}

// ==============================================
// WAITERS + ASSIGNMENT (Owner / Admin / Manager)
// ==============================================

export async function getWaiters(req, res) {
  try {
    res.json(await tablesService.listWaiters(storeOf(req)));
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch waiters", error: err.message });
  }
}

export async function assignTables(req, res) {
  try {
    const { tableIds, waiterId } = req.body;
    const tables = await tablesService.assignTables({ tableIds, waiterId });
    res.json({ message: "Tables assigned", tables });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to assign tables", error: err.message });
  }
}

export async function assignFloor(req, res) {
  try {
    const { floorId, waiterId } = req.body;
    const result = await tablesService.assignFloorToWaiter({
      floorId,
      waiterId,
    });
    res.json({
      message: `Assigned ${result.count} table(s) on this floor`,
      ...result,
    });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to assign floor", error: err.message });
  }
}

export async function assignAll(req, res) {
  try {
    const { waiterId } = req.body;
    const result = await tablesService.assignAllTables({
      waiterId,
      store: storeOf(req),
    });
    res.json({ message: `Assigned all ${result.count} table(s)`, ...result });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to assign all tables", error: err.message });
  }
}

export async function unassignTable(req, res) {
  try {
    const table = await tablesService.unassignTable(req.params.id);
    res.json(table);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to unassign table", error: err.message });
  }
}

export async function unassignAllForWaiter(req, res) {
  try {
    const result = await tablesService.unassignAllForWaiter(
      req.params.waiterId,
    );
    res.json({ message: `Unassigned ${result.count} table(s)`, ...result });
  } catch (err) {
    res
      .status(400)
      .json({
        message: "Failed to unassign waiter's tables",
        error: err.message,
      });
  }
}

// ==============================================
// WAITER'S OWN VIEW — "My Tables"
// req.user.id is the logged-in employee's id (same value used elsewhere,
// e.g. dashboard.controller.js's waiterId lookups).
// ==============================================

export async function getMyTables(req, res) {
  try {
    const tables = await tablesService.getMyTables(req.user.id);
    res.json(tables);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch your tables", error: err.message });
  }
}

export async function getMyTableDetail(req, res) {
  try {
    const table = await tablesService.getTableDetailForWaiter(
      req.params.id,
      req.user.id,
    );
    if (!table) {
      return res
        .status(404)
        .json({ message: "Table not found or not assigned to you" });
    }
    res.json(table);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch table detail", error: err.message });
  }
}
