const AuthShell = ({ children }) => (
  <div className="auth-shell">
    <div className="auth-brand">
      <div className="brand"><span className="brand-logo">S</span>SmartBank</div>
      <h1>Banking made simple and secure.</h1>
      <p>Manage your accounts, transfers, fixed deposits and statements in one place.</p>
    </div>
    <div className="auth-form">{children}</div>
  </div>
);

export default AuthShell;