import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAccounts } from "../services/bankservice";

const Navbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");
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

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <span className="navbar-brand">{role === "ADMIN" ? "SmartBank Admin" : "SmartBank"}</span>
      {role === "CUSTOMER" && (
        <div className="navbar-nav me-auto">
          <Link className="nav-link" to="/dashboard">Dashboard</Link>
          <Link className="nav-link" to="/beneficiaries">Payees</Link>
          <Link className="nav-link" to="/transactions">Transactions</Link>
          <Link className="nav-link" to="/fixed-deposits">Fixed Deposits</Link>
        </div>
      )}
      <div className="d-flex align-items-center gap-2 ms-auto">
        {role === "CUSTOMER" && accounts.length > 0 && (
          <select className="form-select form-select-sm" value={selected} onChange={changeAccount}>
            {accounts.map((a) => (
              <option key={a.id} value={a.accountNumber}>{a.accountType} - {a.accountNumber}</option>
            ))}
          </select>
        )}
        <span className="text-white small">{name}</span>
        <button className="btn btn-outline-light btn-sm" onClick={logout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;