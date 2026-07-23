// client/src/offline/offlineQueue.js
import { getDb } from "./db";
import { placeOrderAndSendToKitchen } from "../pos/api/posApi";

const listeners = new Set();
function notify() {
  listeners.forEach((fn) => fn());
}
// Components (see useOfflineSync.js) subscribe here to re-render when the
// queue changes — an item enqueued, synced, or marked failed.
export function subscribeToQueue(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function makeClientRequestId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return crypto.randomUUID();
  return `offline_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// A genuine connectivity failure (offline, DNS, server unreachable) is
// what should get queued for later retry. A real 4xx from the server
// (missing items, invalid table, etc.) must NOT be queued — retrying a
// request the server already correctly rejected just fails again later
// instead of letting the waiter fix it now. apiClient.js's rawRequest()
// only throws directly (rather than resolving {ok:false}) when fetch()
// itself fails — that's the TypeError/"Failed to fetch" signature checked
// for here.
function isNetworkError(err) {
  return (
    err instanceof TypeError ||
    /failed to fetch|networkerror|load failed|offline/i.test(err?.message || "")
  );
}

// Dine-in only — see the phase-1 scoping note in the conversation this was
// built from: takeaway/delivery billing needs live payment-gateway state
// and aggregator orders need connectivity by definition, so queuing those
// offline would just defer a failure, not prevent one.
//
// Tries the network immediately. On a genuine connectivity failure, queues
// the order in IndexedDB and returns a synthetic local order so the UI has
// something to show right away — the real order/orderNumber only exist
// once this syncs.
export async function placeDineInOrder(payload) {
  const clientRequestId = makeClientRequestId();
  const fullPayload = { ...payload, clientRequestId };

  if (typeof navigator !== "undefined" && navigator.onLine) {
    try {
      const order = await placeOrderAndSendToKitchen(fullPayload);
      return { order, queuedOffline: false };
    } catch (err) {
      if (!isNetworkError(err)) throw err; // a real validation error — surface it now
    }
  }

  await enqueue(fullPayload);
  notify();

  return {
    order: {
      id: `local-${clientRequestId}`,
      clientRequestId,
      orderNumber: "Pending sync",
      status: "QUEUED_OFFLINE",
      items: [],
    },
    queuedOffline: true,
  };
}

async function enqueue(payload) {
  const db = await getDb();
  await db.put("outbox", {
    clientRequestId: payload.clientRequestId,
    payload,
    status: "pending",
    attempts: 0,
    createdAt: new Date().toISOString(),
    lastError: null,
  });
}

// Flushes every pending item in the outbox, oldest first — so orders sync
// in the order they were actually placed, not queue insertion order (same
// thing here, but keeping the sort explicit in case items are ever
// re-queued out of order). Safe to call repeatedly/concurrently: each item
// is removed from the store the moment it syncs successfully, so calling
// this from both the 'online' event AND a periodic interval (see
// useOfflineSync.js) can't double-submit anything already gone.
export async function flushQueue() {
  const db = await getDb();
  const pending = await db.getAllFromIndex("outbox", "status", "pending");
  pending.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const results = { synced: 0, stillPending: 0, failed: 0 };

  for (const item of pending) {
    try {
      await placeOrderAndSendToKitchen(item.payload);
      await db.delete("outbox", item.clientRequestId);
      results.synced += 1;
    } catch (err) {
      if (!isNetworkError(err)) {
        // Server rejected it outright — mark it failed instead of
        // retrying forever, so it surfaces to staff instead of silently
        // vanishing or looping every sync attempt.
        await db.put("outbox", {
          ...item,
          status: "failed",
          attempts: item.attempts + 1,
          lastError: err.message,
        });
        results.failed += 1;
      } else {
        // Still offline / server unreachable — leave it pending, try again next time.
        results.stillPending += 1;
      }
    }
  }

  notify();
  return results;
}

export async function getQueueSnapshot() {
  const db = await getDb();
  const all = await db.getAll("outbox");
  return {
    pendingCount: all.filter((i) => i.status === "pending").length,
    failedCount: all.filter((i) => i.status === "failed").length,
    items: all.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  };
}

// Puts a failed item back to "pending" and immediately retries it — for a
// manual "Retry" button once whatever the server rejected has been fixed
// (or staff just want to try again).
export async function retryFailedItem(clientRequestId) {
  const db = await getDb();
  const item = await db.get("outbox", clientRequestId);
  if (!item) return;
  await db.put("outbox", { ...item, status: "pending" });
  notify();
  await flushQueue();
}

export async function discardFailedItem(clientRequestId) {
  const db = await getDb();
  await db.delete("outbox", clientRequestId);
  notify();
}
