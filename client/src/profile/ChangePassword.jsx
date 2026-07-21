// src/profile/ChangePassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiCheckCircle,
} from "react-icons/fi";
import { useAuth } from "../auth/AuthContext";

// Wires up AuthContext.changePassword (-> authService.changePassword ->
// POST /auth/change-password), which already worked end-to-end — it just
// had no page linking to it, same as Profile.jsx.
export default function ChangePassword() {
  const { changePassword } = useAuth();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFormError("");
  }

  function validate() {
    const next = {};
    if (!form.currentPassword)
      next.currentPassword = "Current password is required";
    if (!form.newPassword || form.newPassword.length < 8) {
      next.newPassword = "New password must be at least 8 characters";
    }
    if (form.confirmPassword !== form.newPassword) {
      next.confirmPassword = "Passwords do not match";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;

    setSaving(true);
    try {
      const result = await changePassword(
        form.currentPassword,
        form.newPassword,
      );
      if (!result.success) {
        setFormError(result.message || "Unable to change password.");
        return;
      }
      setSuccess(true);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setFormError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1F2937] dark:text-white">
          Change Password
        </h1>
        <Link
          to="/profile"
          className="flex items-center gap-2 rounded-xl border border-[#E7EAE1] px-4 py-2 text-sm font-medium text-[#1F2937] hover:bg-[#F3F5EE] dark:border-[#262B24] dark:text-white dark:hover:bg-[#1E241E]"
        >
          <FiArrowLeft />
          Back
        </Link>
      </div>

      <div className="rounded-2xl border border-[#E7EAE1] bg-white p-6 shadow-sm dark:border-[#262B24] dark:bg-[#171C17]">
        {success ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30">
              <FiCheckCircle className="text-3xl text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[#1F2937] dark:text-white">
              Password updated
            </h2>
            <p className="mt-1 text-sm text-[#6B7280] dark:text-[#9CA8A0]">
              Your password has been changed successfully.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="mt-4 text-sm font-medium text-[#3FA34D] hover:underline dark:text-[#43B75A]"
            >
              Change it again
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {formError}
              </div>
            )}

            <PasswordField
              label="Current Password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              error={errors.currentPassword}
              show={show.current}
              onToggleShow={() =>
                setShow((s) => ({ ...s, current: !s.current }))
              }
            />
            <PasswordField
              label="New Password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              error={errors.newPassword}
              show={show.next}
              onToggleShow={() => setShow((s) => ({ ...s, next: !s.next }))}
              hint="At least 8 characters"
            />
            <PasswordField
              label="Confirm New Password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              show={show.confirm}
              onToggleShow={() =>
                setShow((s) => ({ ...s, confirm: !s.confirm }))
              }
            />

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3FA34D] py-3 font-semibold text-white transition hover:bg-[#358F42] disabled:opacity-60 dark:bg-[#43B75A] dark:hover:bg-[#3AA34E]"
            >
              <FiLock />
              {saving ? "Updating…" : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function PasswordField({
  label,
  name,
  value,
  onChange,
  error,
  show,
  onToggleShow,
  hint,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#1F2937] dark:text-[#E5E7EB]">
        {label}
      </label>
      <div className="relative">
        <FiLock className="absolute left-4 top-3.5 text-[#9CA3AF] dark:text-[#6B7280]" />
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full rounded-xl border bg-white py-3 pl-12 pr-12 text-[#1F2937] outline-none transition-all dark:bg-[#1D231D] dark:text-white ${
            error
              ? "border-[#EF5350]"
              : "border-[#E7EAE1] focus:border-[#3FA34D] dark:border-[#262B24] dark:focus:border-[#43B75A]"
          }`}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-4 top-3.5 text-[#6B7280] dark:text-[#9CA8A0]"
        >
          {show ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-sm text-[#EF5350]">{error}</p>}
      {!error && hint && (
        <p className="mt-1.5 text-xs text-[#9CA3AF] dark:text-[#6B7280]">
          {hint}
        </p>
      )}
    </div>
  );
}
