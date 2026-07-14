// ==============================================
// src/kiosk/KioskQrScan.jsx
// ==============================================
// Renders the real Razorpay UPI QR from kiosk.service.getUpiQr, then polls
// kiosk.service.checkQrPaymentStatus every few seconds to detect payment —
// no manual "trust me, I paid" button in the normal path.
//
// TESTING: since a real UPI app can't complete a payment against a Razorpay
// TEST MODE QR, simulate the payment from the Razorpay Dashboard (Test
// Mode -> Payments -> QR Codes -> find this QR -> simulate a payment).
// This screen's poll will pick it up within POLL_INTERVAL_MS.

import React, { useEffect, useRef, useState } from "react";
import { FiAlertCircle, FiRefreshCw, FiChevronLeft } from "react-icons/fi";
import {
  fetchUpiQr,
  fetchUpiQrStatus,
  KioskApiError,
} from "./services/kioskApi";

const POLL_INTERVAL_MS = 3000;

const KioskQrScan = ({ order, onBack, onPaid }) => {
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const pollRef = useRef(null);
  const paidRef = useRef(false); // guards against a stray tick firing onPaid twice

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const checkStatus = async ({ silent } = {}) => {
    if (!order?.id || paidRef.current) return;
    if (!silent) setChecking(true);
    try {
      const result = await fetchUpiQrStatus(order.id);
      if (result.paid && !paidRef.current) {
        paidRef.current = true;
        stopPolling();
        onPaid(result.order);
      }
    } catch (err) {
      // Don't surface transient poll errors as a hard failure — just log,
      // the next tick will try again. Only the initial QR load surfaces a
      // blocking error to the user.
      console.error("QR status check failed:", err.message);
    } finally {
      if (!silent) setChecking(false);
    }
  };

  useEffect(() => {
    if (!order?.id) return;
    paidRef.current = false;
    setLoading(true);
    setErrorMsg("");

    fetchUpiQr(order.id)
      .then((data) => {
        setQr(data);
        // Start polling only once the QR is actually up on screen.
        pollRef.current = setInterval(
          () => checkStatus({ silent: true }),
          POLL_INTERVAL_MS,
        );
      })
      .catch(() =>
        setErrorMsg(
          "Could not generate a QR code. Please go back and try Cash or Card.",
        ),
      )
      .finally(() => setLoading(false));

    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id]);

  const handleManualCheck = () => checkStatus({ silent: false });

  return (
    <div className="h-screen w-screen max-h-screen bg-[#FAFAFX] flex flex-col overflow-hidden relative font-sans antialiased text-[#1C1C1E]">
      {/* Top Navigation Row */}
      <div className="w-full max-w-3xl mx-auto px-6 sm:px-10 pt-6 pb-4 flex items-center shrink-0 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-bold text-[#48484A] bg-white backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-black/[0.03] active:scale-95 transition-all"
        >
          <FiChevronLeft strokeWidth={2.5} className="text-[#EE6C2E]" />
          <span>Back</span>
        </button>
      </div>

      {/* Main Container Layout */}
      <div className="w-full max-w-3xl mx-auto flex flex-col flex-1 overflow-hidden px-6 sm:px-10 pb-32">
        {/* Informative Title */}
        <div className="text-center mt-4 shrink-0 z-10">
          <h1 className="text-3xl font-black tracking-tight text-[#1C1C1E]">
            Scan with any UPI app to pay
          </h1>
          <p className="text-2xl font-black text-[#EE6C2E] tracking-tight mt-2">
            ₹{(qr?.amount ?? order?.grandTotal ?? 0).toFixed?.(2) ?? qr?.amount}
          </p>
        </div>

        {/* Clean, Magnified & Perfectly Centered QR Scanner Area */}
        <div className="flex-1 flex flex-col items-center justify-center my-4">
          <div className="w-80 h-80 sm:w-[420px] sm:h-[420px] rounded-[32px] bg-white border-2 border-dashed border-[#EE6C2E]/30 p-4 flex items-center justify-center overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.02)] transition-all">
            {loading ? (
              <div className="w-12 h-12 border-4 border-[#EE6C2E] border-t-transparent rounded-full animate-spin" />
            ) : qr?.qrDataUrl ? (
              <div className="w-full h-full overflow-hidden rounded-[20px] relative bg-white flex items-center justify-center">
                {/* Shifted down from -mt-[28%] to -mt-[18%] to push the QR code down visually */}
                <img
                  src={qr.qrDataUrl}
                  alt="UPI QR"
                  className="w-[160%] max-w-none h-auto object-contain -mt-[18%]"
                />
              </div>
            ) : (
              <p className="text-[#8E8E93] font-bold text-sm text-center px-4">
                QR Code Unavailable
              </p>
            )}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-center gap-2 text-[#48484A] text-sm font-bold tracking-wide uppercase mb-6">
          <div className="w-2.5 h-2.5 rounded-full bg-[#EE6C2E] animate-pulse" />
          <span>Waiting for payment...</span>
        </div>

        {/* Error Diagnostics View */}
        {errorMsg && (
          <div className="mb-6 rounded-2xl bg-red-50 border border-red-200/60 p-4 flex items-start gap-3 text-red-700 animate-fade-in">
            <FiAlertCircle
              className="text-red-500 mt-0.5 shrink-0"
              size={16}
              strokeWidth={2.5}
            />
            <p className="text-xs font-bold leading-relaxed">{errorMsg}</p>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Controls Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-black/[0.03] px-6 sm:px-10 py-5 z-20 max-w-3xl mx-auto rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
        <button
          onClick={handleManualCheck}
          disabled={checking || loading || !qr}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#EE6C2E] to-[#F4894A] text-white font-black text-base shadow-lg shadow-orange-500/20 hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all tracking-wide uppercase flex items-center justify-center gap-2"
        >
          <FiRefreshCw
            size={18}
            className={checking ? "animate-spin" : ""}
            strokeWidth={2.5}
          />
          {checking ? "Checking..." : "I've Paid — Check Now"}
        </button>
      </div>
    </div>
  );
};

export default KioskQrScan;
