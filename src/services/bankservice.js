import axios from "axios";

const url = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({ baseURL: url });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const account = localStorage.getItem("account");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (account) config.headers["X-Account-Number"] = account;
  return config;
});

// ---- auth ----
export const loginUser = (data) => api.post("/api/auth/login", data);
export const registerUser = (data) => api.post("/api/auth/register", data);
export const forgotPassword = (data) => api.post("/api/auth/forgot-password", data);
export const resetPassword = (data) => api.post("/api/auth/reset-password", data);

// ---- accounts ----
export const getAccounts = () => api.get("/api/accounts");
export const openAccount = (data) => api.post("/api/accounts", data);
export const getAccount = () => api.get("/api/account/me");
export const depositMoney = (data) => api.post("/api/account/deposit", data);
export const withdrawMoney = (data) => api.post("/api/account/withdraw", data);
export const transferMoney = (data) => api.post("/api/account/transfer", data);

// ---- beneficiaries ----
export const getBeneficiaries = () => api.get("/api/beneficiaries");
export const addBeneficiary = (data) => api.post("/api/beneficiaries", data);
export const deleteBeneficiary = (id) => api.delete(`/api/beneficiaries/${id}`);

// ---- transactions and statements ----
export const getTransactions = (params) => api.get("/api/transactions", { params });
export const downloadCsv = (month) => api.get("/api/statement", { params: { month }, responseType: "blob" });
export const downloadPdf = (month) => api.get("/api/statement/pdf", { params: { month }, responseType: "blob" });

// ---- fixed deposits ----
export const getFdOptions = () => api.get("/api/fd/options");
export const getFdQuote = (params) => api.get("/api/fd/quote", { params });
export const openFd = (data) => api.post("/api/fd", data);
export const getMyFds = () => api.get("/api/fd");
export const closeFd = (id) => api.post(`/api/fd/${id}/close`);

// ---- admin ----
export const getStats = () => api.get("/api/admin/stats");
export const getUsers = () => api.get("/api/admin/users");
export const getAdminAccounts = () => api.get("/api/admin/accounts");
export const getAdminTransactions = (params) => api.get("/api/admin/transactions", { params });
export const getAdminFds = (status) => api.get("/api/admin/fd", { params: { status } });
export const freezeAccount = (no) => api.put(`/api/admin/freeze/${no}`);
export const unfreezeAccount = (no) => api.put(`/api/admin/unfreeze/${no}`);