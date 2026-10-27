import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getAccounts } from "../services/bankservice";

const Layout = ({ title, children }) => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name") || "";
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState(localStorage.getItem("account") || "");

  useEffect(() => {
    if (role === "CUSTOMER") {
      getAccounts()
        .then((res) => {
          setAccounts(res.data);
          if (!selected && res.data.length > 0) setSelected(res.data[0].accountNumber);
        })
        .catch(console.error);
    }
  }, []);

  const changeAccount = (e) => {
    localStorage.setItem("account", e.target.value);
    setSelected(e.target.value);
    window.location.reload();
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const links =
    role === "ADMIN"
      ? [{ to: "/admin", label: "Admin Dashboard" }]
      : [
          { to: "/dashboard", label: "Dashboard" },
          { to: "/beneficiaries", label: "Payees" },
          { to: "/transactions", label: "Transactions" },
          { to: "/fixed-deposits", label: "Fixed Deposits" },
        ];

  const todayText = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="app">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand"><span className="brand-logo">S</span>SmartBank</div>
        <nav>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}
              className={({ isActive }) => "side-link" + (isActive ? " active" : "")}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">
          {role === "CUSTOMER" && accounts.length > 0 && (
            <>
              <label className="small mb-1 d-block">Active account</label>
              <select className="form-select form-select-sm" value={selected} onChange={changeAccount}>
                {accounts.map((a) => (
                  <option key={a.id} value={a.accountNumber}>{a.accountType} - {a.accountNumber}</option>
                ))}
              </select>
            </>
          )}
          <div className="d-flex align-items-center gap-2 mt-3">
            <span className="avatar">{name.charAt(0).toUpperCase()}</span>
            <div>
              <div className="text-white fw-semibold">{name}</div>
              <small>{role === "ADMIN" ? "Administrator" : "Customer"}</small>
            </div>
          </div>
          <button className="btn btn-outline-light btn-sm w-100 mt-3" onClick={logout}>Logout</button>
        </div>
      </aside>
      {open && <div className="backdrop" onClick={() => setOpen(false)} />}
      <div className="main">
        <header className="topbar">
          <div className="d-flex align-items-center gap-3">
            <button className="menu-btn btn btn-outline-secondary btn-sm" onClick={() => setOpen(true)}>☰</button>
            <h4 className="mb-0">{title}</h4>
          </div>
          <span className="text-muted small d-none d-md-inline">{todayText}</span>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;