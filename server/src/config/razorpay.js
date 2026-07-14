// server/src/config/razorpay.js
// ==============================================
// Central Razorpay SDK instance. Uses TEST MODE keys for now — swap
// RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET for live keys when you go to
// production, nothing else in the codebase needs to change.
//
// Get test keys from: Razorpay Dashboard -> Settings -> API Keys -> Test Mode
//
// Add to your .env:
//   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
//   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
//   RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx   (optional — only needed if
//     you set up a webhook in the Razorpay dashboard; see kiosk.routes.js)
//
// Requires: npm install razorpay
// ==============================================

import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  console.warn(
    "⚠️  RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set — kiosk UPI/Card payments will fail until these are configured.",
  );
}

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

export default razorpay;
export const RAZORPAY_KEY_ID = keyId;
export const RAZORPAY_KEY_SECRET = keySecret;
export const RAZORPAY_WEBHOOK_SECRET =
  process.env.RAZORPAY_WEBHOOK_SECRET || "";
