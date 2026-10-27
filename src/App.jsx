import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Beneficiaries from "./pages/Beneficiaries";
import Transactions from "./pages/Transactions";
import FixedDeposits from "./pages/FixedDeposits";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthShell from "./components/AuthShell";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<AuthShell><Login /></AuthShell>} />
      <Route path="/register" element={<AuthShell><Register /></AuthShell>} />
      <Route path="/forgot-password" element={<AuthShell><ForgotPassword /></AuthShell>} />
      <Route path="/reset-password" element={<AuthShell><ResetPassword /></AuthShell>} />
      <Route path="/dashboard" element={<ProtectedRoute role="CUSTOMER"><Dashboard /></ProtectedRoute>} />
      <Route path="/beneficiaries" element={<ProtectedRoute role="CUSTOMER"><Beneficiaries /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute role="CUSTOMER"><Transactions /></ProtectedRoute>} />
      <Route path="/fixed-deposits" element={<ProtectedRoute role="CUSTOMER"><FixedDeposits /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;