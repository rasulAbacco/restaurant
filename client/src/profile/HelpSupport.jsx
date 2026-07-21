// src/profile/HelpSupport.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiMail,
  FiPhone,
  FiGlobe,
  FiChevronDown,
  FiHelpCircle,
} from "react-icons/fi";

const FAQS = [
  {
    q: "How do I assign a table to a waiter?",
    a: 'Go to Tables → "Assign Waiter", select one or more tables (or a whole floor, or all tables), then choose the waiter to assign them to.',
  },
  {
    q: "How do I create a login for a new employee?",
    a: 'Go to Employees → open the employee → Account tab → "Create Login Account", then set their role (Owner, Manager, Cashier, Kitchen, or Waiter).',
  },
  {
    q: "Why can't I see all tables as a waiter?",
    a: "Waiters only see tables assigned to them, along with that table's active order and payment status. Ask your manager to assign tables from the Tables page.",
  },
  {
    q: "How do I reset a forgotten password?",
    a: 'Use "Forgot Password?" on the login screen. If you\'re already signed in, use Change Password from the profile menu instead.',
  },
  {
    q: "Can I delete an order?",
    a: "Only the Owner role can delete orders, from the Payments page (View → Delete, or the Delete icon in the orders table). This permanently removes the order and its payment records.",
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#E7EAE1] last:border-0 dark:border-[#262B24]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="font-medium text-[#1F2937] dark:text-white">{q}</span>
        <FiChevronDown
          className={`shrink-0 text-[#6B7280] transition-transform dark:text-[#9CA8A0] ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm leading-6 text-[#6B7280] dark:text-[#9CA8A0]">
          {a}
        </p>
      )}
    </div>
  );
}

export default function HelpSupport() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937] dark:text-white">
            Help & Support
          </h1>
          <p className="mt-1 text-sm text-[#6B7280] dark:text-[#9CA8A0]">
            Common questions, and how to reach us if you're still stuck.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="flex items-center gap-2 rounded-xl border border-[#E7EAE1] px-4 py-2 text-sm font-medium text-[#1F2937] hover:bg-[#F3F5EE] dark:border-[#262B24] dark:text-white dark:hover:bg-[#1E241E]"
        >
          <FiArrowLeft />
          Back
        </Link>
      </div>

      {/* Contact cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <a
          href="mailto:support@restauranterp.com"
          className="flex items-center gap-3 rounded-2xl border border-[#E7EAE1] bg-white p-4 transition hover:border-[#3FA34D]/40 dark:border-[#262B24] dark:bg-[#171C17]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3FA34D]/10 text-[#3FA34D] dark:bg-[#43B75A]/10 dark:text-[#43B75A]">
            <FiMail />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[#9CA3AF] dark:text-[#6B7280]">Email</p>
            <p className="truncate text-sm font-medium text-[#1F2937] dark:text-white">
              support@restauranterp.com
            </p>
          </div>
        </a>

        <a
          href="tel:+919876543210"
          className="flex items-center gap-3 rounded-2xl border border-[#E7EAE1] bg-white p-4 transition hover:border-[#3FA34D]/40 dark:border-[#262B24] dark:bg-[#171C17]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3FA34D]/10 text-[#3FA34D] dark:bg-[#43B75A]/10 dark:text-[#43B75A]">
            <FiPhone />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[#9CA3AF] dark:text-[#6B7280]">Phone</p>
            <p className="truncate text-sm font-medium text-[#1F2937] dark:text-white">
              +91 98765 43210
            </p>
          </div>
        </a>

        <a
          href="https://www.restauranterp.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-2xl border border-[#E7EAE1] bg-white p-4 transition hover:border-[#3FA34D]/40 dark:border-[#262B24] dark:bg-[#171C17]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3FA34D]/10 text-[#3FA34D] dark:bg-[#43B75A]/10 dark:text-[#43B75A]">
            <FiGlobe />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[#9CA3AF] dark:text-[#6B7280]">
              Website
            </p>
            <p className="truncate text-sm font-medium text-[#1F2937] dark:text-white">
              www.restauranterp.com
            </p>
          </div>
        </a>
      </div>

      {/* FAQ */}
      <div className="rounded-2xl border border-[#E7EAE1] bg-white p-6 dark:border-[#262B24] dark:bg-[#171C17]">
        <div className="mb-2 flex items-center gap-2">
          <FiHelpCircle className="text-[#3FA34D] dark:text-[#43B75A]" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#6B7280] dark:text-[#9CA8A0]">
            Frequently Asked Questions
          </h2>
        </div>
        <div>
          {FAQS.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </div>
  );
}
