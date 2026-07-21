// src/profile/Profile.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiShield,
  FiAtSign,
  FiLock,
  FiArrowLeft,
  FiEdit2,
  FiX,
  FiSave,
  FiPhone,
  FiCalendar,
  FiBriefcase,
  FiMapPin,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import { useAuth } from "../auth/AuthContext";

const EMPTY_ADDRESS = {
  houseNo: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
};

// Employee.dob comes back as an ISO datetime string (or null). This just
// gets it into the yyyy-mm-dd shape <input type="date"> needs.
function toDateInputValue(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function formatDob(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function Profile() {
  const { user, updateProfile } = useAuth();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function startEdit() {
    setForm({
      name: user?.name || "",
      gender: user?.gender || "",
      dob: toDateInputValue(user?.dob),
      mobile: user?.mobile || "",
      emergencyContact: user?.emergencyContact || "",
      address: user?.address || EMPTY_ADDRESS,
    });
    setError("");
    setSuccess(false);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setForm(null);
    setError("");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleAddressChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Full name is required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const result = await updateProfile({
        fullName: form.name.trim(),
        gender: form.gender || null,
        dob: form.dob || null,
        mobile: form.mobile || null,
        emergencyContact: form.emergencyContact || null,
        address: form.address,
      });

      if (!result.success) {
        setError(result.message || "Unable to update profile.");
        return;
      }

      setEditing(false);
      setForm(null);
      setSuccess(true);
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const personalFields = [
    { icon: <FiUser />, label: "Full Name", value: user?.name },
    { icon: <FiShield />, label: "Gender", value: user?.gender },
    {
      icon: <FiCalendar />,
      label: "Date of Birth",
      value: formatDob(user?.dob),
    },
    { icon: <FiPhone />, label: "Mobile", value: user?.mobile },
    {
      icon: <FiAlertCircle />,
      label: "Emergency Contact",
      value: user?.emergencyContact,
    },
  ];

  const accountFields = [
    { icon: <FiMail />, label: "Email", value: user?.email },
    { icon: <FiAtSign />, label: "Username", value: user?.username },
    { icon: <FiShield />, label: "Role", value: user?.role },
  ];

  const employmentFields = [
    {
      icon: <FiBriefcase />,
      label: "Employee Code",
      value: user?.employeeCode,
    },
    { icon: <FiBriefcase />, label: "Department", value: user?.department },
    { icon: <FiBriefcase />, label: "Designation", value: user?.designation },
    {
      icon: <FiCalendar />,
      label: "Joining Date",
      value: user?.joiningDate ? formatDob(user.joiningDate) : "—",
    },
    { icon: <FiMapPin />, label: "Store / Branch", value: user?.store },
  ];

  const address = user?.address;
  const addressLine =
    address &&
    (address.houseNo ||
      address.street ||
      address.city ||
      address.state ||
      address.pincode)
      ? [
          address.houseNo,
          address.street,
          address.city,
          address.state,
          address.pincode,
        ]
          .filter(Boolean)
          .join(", ")
      : null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937] dark:text-white">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-[#6B7280] dark:text-[#9CA8A0]">
            Your personal, account, and employment details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!editing && (
            <button
              onClick={startEdit}
              className="flex items-center gap-2 rounded-xl bg-[#3FA34D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#358F42] dark:bg-[#43B75A] dark:hover:bg-[#3AA34E]"
            >
              <FiEdit2 />
              Edit Profile
            </button>
          )}
          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded-xl border border-[#E7EAE1] px-4 py-2 text-sm font-medium text-[#1F2937] hover:bg-[#F3F5EE] dark:border-[#262B24] dark:text-white dark:hover:bg-[#1E241E]"
          >
            <FiArrowLeft />
            Back
          </Link>
        </div>
      </div>

      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-400">
          <FiCheckCircle />
          Profile updated successfully.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#E7EAE1] bg-white shadow-sm dark:border-[#262B24] dark:bg-[#171C17]">
        {/* Header band */}
        <div className="flex items-center gap-4 bg-gradient-to-r from-[#3FA34D] to-[#2B7A38] px-6 py-8 text-white dark:from-[#43B75A] dark:to-[#2B7A38]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl font-bold text-[#3FA34D] shadow-lg">
            {user?.name?.charAt(0) || "R"}
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              {user?.name || "Restaurant User"}
            </h2>
            <p className="text-white/80">{user?.email || "—"}</p>
            <span className="mt-2 inline-flex rounded-full bg-white/20 px-3 py-1 text-sm">
              {user?.role || "—"}
            </span>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-6 p-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <section>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#9CA3AF] dark:text-[#6B7280]">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Full Name *">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#E7EAE1] px-4 py-2.5 text-[#1F2937] outline-none focus:border-[#3FA34D] dark:border-[#262B24] dark:bg-[#1D231D] dark:text-white dark:focus:border-[#43B75A]"
                  />
                </Field>
                <Field label="Gender">
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#E7EAE1] bg-white px-4 py-2.5 text-[#1F2937] outline-none focus:border-[#3FA34D] dark:border-[#262B24] dark:bg-[#1D231D] dark:text-white dark:focus:border-[#43B75A]"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>
                <Field label="Date of Birth">
                  <input
                    type="date"
                    name="dob"
                    value={form.dob}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#E7EAE1] px-4 py-2.5 text-[#1F2937] outline-none focus:border-[#3FA34D] dark:border-[#262B24] dark:bg-[#1D231D] dark:text-white dark:focus:border-[#43B75A]"
                  />
                </Field>
                <Field label="Mobile">
                  <input
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    className="w-full rounded-xl border border-[#E7EAE1] px-4 py-2.5 text-[#1F2937] outline-none focus:border-[#3FA34D] dark:border-[#262B24] dark:bg-[#1D231D] dark:text-white dark:focus:border-[#43B75A]"
                  />
                </Field>
                <Field label="Emergency Contact">
                  <input
                    name="emergencyContact"
                    value={form.emergencyContact}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#E7EAE1] px-4 py-2.5 text-[#1F2937] outline-none focus:border-[#3FA34D] dark:border-[#262B24] dark:bg-[#1D231D] dark:text-white dark:focus:border-[#43B75A]"
                  />
                </Field>
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#9CA3AF] dark:text-[#6B7280]">
                Address
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="House / Flat No.">
                  <input
                    name="houseNo"
                    value={form.address.houseNo}
                    onChange={handleAddressChange}
                    className="w-full rounded-xl border border-[#E7EAE1] px-4 py-2.5 text-[#1F2937] outline-none focus:border-[#3FA34D] dark:border-[#262B24] dark:bg-[#1D231D] dark:text-white dark:focus:border-[#43B75A]"
                  />
                </Field>
                <Field label="Street">
                  <input
                    name="street"
                    value={form.address.street}
                    onChange={handleAddressChange}
                    className="w-full rounded-xl border border-[#E7EAE1] px-4 py-2.5 text-[#1F2937] outline-none focus:border-[#3FA34D] dark:border-[#262B24] dark:bg-[#1D231D] dark:text-white dark:focus:border-[#43B75A]"
                  />
                </Field>
                <Field label="City">
                  <input
                    name="city"
                    value={form.address.city}
                    onChange={handleAddressChange}
                    className="w-full rounded-xl border border-[#E7EAE1] px-4 py-2.5 text-[#1F2937] outline-none focus:border-[#3FA34D] dark:border-[#262B24] dark:bg-[#1D231D] dark:text-white dark:focus:border-[#43B75A]"
                  />
                </Field>
                <Field label="State">
                  <input
                    name="state"
                    value={form.address.state}
                    onChange={handleAddressChange}
                    className="w-full rounded-xl border border-[#E7EAE1] px-4 py-2.5 text-[#1F2937] outline-none focus:border-[#3FA34D] dark:border-[#262B24] dark:bg-[#1D231D] dark:text-white dark:focus:border-[#43B75A]"
                  />
                </Field>
                <Field label="Pincode">
                  <input
                    name="pincode"
                    value={form.address.pincode}
                    onChange={handleAddressChange}
                    className="w-full rounded-xl border border-[#E7EAE1] px-4 py-2.5 text-[#1F2937] outline-none focus:border-[#3FA34D] dark:border-[#262B24] dark:bg-[#1D231D] dark:text-white dark:focus:border-[#43B75A]"
                  />
                </Field>
              </div>
            </section>

            <p className="text-xs text-[#9CA3AF] dark:text-[#6B7280]">
              Email, username, role, employee code, department, designation, and
              store are managed by your Owner/Manager via Employees, and can't
              be changed here.
            </p>

            <div className="flex items-center justify-end gap-2 border-t border-[#E7EAE1] pt-4 dark:border-[#262B24]">
              <button
                type="button"
                onClick={cancelEdit}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-[#6B7280] hover:bg-[#F3F5EE] dark:text-[#9CA8A0] dark:hover:bg-[#1E241E]"
              >
                <FiX />
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-[#3FA34D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#358F42] disabled:opacity-60 dark:bg-[#43B75A] dark:hover:bg-[#3AA34E]"
              >
                <FiSave />
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Personal */}
            <SectionHeading>Personal Information</SectionHeading>
            <FieldList fields={personalFields} />

            {/* Account */}
            <SectionHeading>Account</SectionHeading>
            <FieldList fields={accountFields} />

            {/* Employment */}
            <SectionHeading>
              Employment (managed by Owner/Manager)
            </SectionHeading>
            <FieldList fields={employmentFields} />

            {/* Address */}
            <SectionHeading>Address</SectionHeading>
            <div className="px-6 py-4">
              <p className="text-sm text-[#1F2937] dark:text-white">
                {addressLine ||
                  "No address on file yet — add one via Edit Profile."}
              </p>
            </div>

            {/* Actions */}
            <div className="border-t border-[#E7EAE1] px-6 py-4 dark:border-[#262B24]">
              <Link
                to="/change-password"
                className="inline-flex items-center gap-2 rounded-xl bg-[#3FA34D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#358F42] dark:bg-[#43B75A] dark:hover:bg-[#3AA34E]"
              >
                <FiLock />
                Change Password
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SectionHeading({ children }) {
  return (
    <div className="border-t border-[#E7EAE1] bg-[#F9FAF7] px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-[#9CA3AF] first:border-t-0 dark:border-[#262B24] dark:bg-[#141914] dark:text-[#6B7280]">
      {children}
    </div>
  );
}

function FieldList({ fields }) {
  return (
    <div className="divide-y divide-[#E7EAE1] dark:divide-[#262B24]">
      {fields.map((f) => (
        <div key={f.label} className="flex items-center gap-4 px-6 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3FA34D]/10 text-[#3FA34D] dark:bg-[#43B75A]/10 dark:text-[#43B75A]">
            {f.icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[#9CA3AF] dark:text-[#6B7280]">
              {f.label}
            </p>
            <p className="truncate font-medium text-[#1F2937] dark:text-white">
              {f.value || "—"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[#1F2937] dark:text-[#E5E7EB]">
        {label}
      </label>
      {children}
    </div>
  );
}
