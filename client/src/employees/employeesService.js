// ==============================================
// client/src/employees/employeesService.js
// Talks to /employees/* on the existing backend
// (employees.routes.js + attendance/leaves/payroll/
// incentives/performance/activity-logs sub-routes)
// ==============================================

import { apiRequest } from "../api/apiClient";

// ==========================================
// HELPERS
// ==========================================

const buildQuery = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });

  const qs = query.toString();
  return qs ? `?${qs}` : "";
};

// ==========================================
// DASHBOARD
// ==========================================

const getDashboardStats = async () => {
  const { ok, data } = await apiRequest("/employees/dashboard");

  if (!ok) {
    return { success: false, message: "Unable to load employee stats." };
  }

  return { success: true, data };
};

// ==========================================
// EMPLOYEES — CRUD
// ==========================================

const listEmployees = async (params = {}) => {
  const { ok, data } = await apiRequest(`/employees${buildQuery(params)}`);

  if (!ok) {
    return {
      success: false,
      message: data?.message || "Unable to load employees.",
    };
  }

  return { success: true, ...data };
};

const getEmployee = async (id) => {
  const { ok, data } = await apiRequest(`/employees/${id}`);

  if (!ok) {
    return {
      success: false,
      message: data?.message || "Employee not found.",
    };
  }

  return { success: true, data };
};

const createEmployee = async (payload) => {
  const { ok, data } = await apiRequest("/employees", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!ok) {
    return {
      success: false,
      message: data?.message || data?.error || "Unable to create employee.",
    };
  }

  return { success: true, data };
};

const updateEmployee = async (id, payload) => {
  const { ok, data } = await apiRequest(`/employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  if (!ok) {
    return {
      success: false,
      message: data?.message || data?.error || "Unable to update employee.",
    };
  }

  return { success: true, data };
};

const deleteEmployee = async (id) => {
  const { ok, data } = await apiRequest(`/employees/${id}`, {
    method: "DELETE",
  });

  if (!ok) {
    return {
      success: false,
      message: data?.message || "Unable to remove employee.",
    };
  }

  return { success: true };
};

const createLoginAccount = async (id, payload) => {
  const { ok, data } = await apiRequest(`/employees/${id}/account`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!ok) {
    return {
      success: false,
      message:
        data?.message || data?.error || "Unable to create login account.",
    };
  }

  return { success: true, data };
};

// ==========================================
// ATTENDANCE — read + actions
// ==========================================

const listAttendance = async (params = {}) => {
  const { ok, data } = await apiRequest(
    `/employees/attendance${buildQuery(params)}`,
  );

  if (!ok) return { success: false, message: "Unable to load attendance." };

  return { success: true, ...data };
};

// CHANGED: clock the employee in for today
const checkIn = async (employeeId) => {
  const { ok, data } = await apiRequest(`/employees/attendance/check-in`, {
    method: "POST",
    body: JSON.stringify({ employeeId }),
  });

  if (!ok) {
    return { success: false, message: data?.message || "Check-in failed." };
  }

  return { success: true, data };
};

// CHANGED: clock the employee out for today
const checkOut = async (employeeId) => {
  const { ok, data } = await apiRequest(`/employees/attendance/check-out`, {
    method: "POST",
    body: JSON.stringify({ employeeId }),
  });

  if (!ok) {
    return { success: false, message: data?.message || "Check-out failed." };
  }

  return { success: true, data };
};

// CHANGED: manually set a day's attendance status (owner use — holidays,
// corrections, marking someone absent/on-leave directly)
const markAttendanceStatus = async ({ employeeId, date, status }) => {
  const { ok, data } = await apiRequest(`/employees/attendance/status`, {
    method: "PUT",
    body: JSON.stringify({ employeeId, date, status }),
  });

  if (!ok) {
    return {
      success: false,
      message: data?.message || "Unable to update attendance status.",
    };
  }

  return { success: true, data };
};

// CHANGED: end-of-day sweep — any ACTIVE employee with no attendance record
// for the date gets marked ABSENT automatically.
const closeDayAttendance = async (date) => {
  const { ok, data } = await apiRequest(`/employees/attendance/close-day`, {
    method: "POST",
    body: JSON.stringify({ date }),
  });

  if (!ok) {
    return {
      success: false,
      message: data?.message || "Unable to close attendance for the day.",
    };
  }

  return { success: true, ...data };
};

// ==========================================
// LEAVES — read + actions
// ==========================================

const listLeaves = async (params = {}) => {
  const { ok, data } = await apiRequest(
    `/employees/leaves${buildQuery(params)}`,
  );

  if (!ok) return { success: false, message: "Unable to load leave requests." };

  return { success: true, ...data };
};

// CHANGED: submit a new leave request
const createLeaveRequest = async (payload) => {
  const { ok, data } = await apiRequest(`/employees/leaves`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!ok) {
    return {
      success: false,
      message:
        data?.message || data?.error || "Unable to submit leave request.",
    };
  }

  return { success: true, data };
};

const decideLeave = async (id, action, approvedById) => {
  const { ok, data } = await apiRequest(`/employees/leaves/${id}/${action}`, {
    method: "PUT",
    body: JSON.stringify({ approvedById }),
  });

  if (!ok) {
    return {
      success: false,
      message: data?.message || "Unable to update the leave request.",
    };
  }

  return { success: true, data };
};

// ==========================================
// PAYROLL — read + actions
// ==========================================

const listPayroll = async (params = {}) => {
  const { ok, data } = await apiRequest(
    `/employees/payroll${buildQuery(params)}`,
  );

  if (!ok)
    return { success: false, message: "Unable to load payroll records." };

  return { success: true, ...data };
};

// CHANGED: generate (or re-generate, for the same month) a payroll record
const generatePayroll = async (payload) => {
  const { ok, data } = await apiRequest(`/employees/payroll`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!ok) {
    return {
      success: false,
      message: data?.message || data?.error || "Unable to generate payroll.",
    };
  }

  return { success: true, data };
};

// CHANGED: mark an existing payroll record as paid
const payPayroll = async (id) => {
  const { ok, data } = await apiRequest(`/employees/payroll/${id}/pay`, {
    method: "PUT",
  });

  if (!ok) {
    return {
      success: false,
      message: data?.message || "Unable to mark payroll as paid.",
    };
  }

  return { success: true, data };
};

// ==========================================
// INCENTIVES — read + actions
// ==========================================

const listIncentives = async (params = {}) => {
  const { ok, data } = await apiRequest(
    `/employees/incentives${buildQuery(params)}`,
  );

  if (!ok) return { success: false, message: "Unable to load incentives." };

  return { success: true, ...data };
};

// CHANGED: record a new incentive for an employee
const createIncentive = async (payload) => {
  const { ok, data } = await apiRequest(`/employees/incentives`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!ok) {
    return {
      success: false,
      message: data?.message || data?.error || "Unable to add incentive.",
    };
  }

  return { success: true, data };
};

// ==========================================
// PERFORMANCE — read + actions
// ==========================================

const listPerformance = async (params = {}) => {
  const { ok, data } = await apiRequest(
    `/employees/performance${buildQuery(params)}`,
  );

  if (!ok)
    return { success: false, message: "Unable to load performance records." };

  return { success: true, data };
};

// CHANGED: create or update the performance record for an employee/period
const upsertPerformance = async (payload) => {
  const { ok, data } = await apiRequest(`/employees/performance`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!ok) {
    return {
      success: false,
      message:
        data?.message || data?.error || "Unable to save performance record.",
    };
  }

  return { success: true, data };
};

// ==========================================
// ACTIVITY LOGS
// ==========================================

const listActivityLogs = async (params = {}) => {
  const { ok, data } = await apiRequest(
    `/employees/activity-logs${buildQuery(params)}`,
  );

  if (!ok) return { success: false, message: "Unable to load activity logs." };

  return { success: true, ...data };
};

// CHANGED: manual activity log entry — the backend endpoint already existed
// (POST /employees/activity-logs) but nothing in the UI called it.
const createActivityLog = async ({ employeeId, action }) => {
  const { ok, data } = await apiRequest(`/employees/activity-logs`, {
    method: "POST",
    body: JSON.stringify({ employeeId, action }),
  });

  if (!ok) {
    return {
      success: false,
      message: data?.message || "Unable to add activity log entry.",
    };
  }

  return { success: true, data };
};

// ==========================================
// EXPORT
// ==========================================

const employeesService = {
  getDashboardStats,
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  createLoginAccount,
  listAttendance,
  checkIn,
  checkOut,
  markAttendanceStatus,
  closeDayAttendance,
  listLeaves,
  createLeaveRequest,
  decideLeave,
  listPayroll,
  generatePayroll,
  payPayroll,
  listIncentives,
  createIncentive,
  listPerformance,
  upsertPerformance,
  listActivityLogs,
  createActivityLog,
};

export default employeesService;
