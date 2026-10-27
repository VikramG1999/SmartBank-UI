import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Layout from "../components/Layout";
import {
  getStats, getUsers, getAdminAccounts, getAdminTransactions, getAdminFds, freezeAccount, unfreezeAccount,
} from "../services/bankservice";
import { errMsg, money, openPicker } from "../services/helper";

const AdminDashboard = () => {
  const [tab, setTab] = useState("accounts");
  const [stats, setStats] = useState({});
  const [accounts, setAccounts] = useState([]);
  const [users, setUsers] = useState([]);
  const [fds, setFds] = useState([]);
  const [fdStatus, setFdStatus] = useState("");
  const [tx, setTx] = useState({ content: [], page: 0, totalPages: 0, totalElements: 0 });
  const [error, setError] = useState("");
  const { register, getValues, handleSubmit } = useForm({ defaultValues: { account: "", type: "", from: "", to: "" } });

  const loadMain = () => {
    getStats().then((r) => setStats(r.data)).catch((e) => setError(errMsg(e)));
    getAdminAccounts().then((r) => setAccounts(r.data)).catch(console.error);
    getUsers().then((r) => setUsers(r.data)).catch(console.error);
  };
  const loadTx = (p) => {
    getAdminTransactions({ ...getValues(), page: p, size: 8 }).then((r) => setTx(r.data)).catch((e) => setError(errMsg(e)));
  };
  const loadFds = (status) => {
    getAdminFds(status).then((r) => setFds(r.data)).catch((e) => setError(errMsg(e)));
  };

  useEffect(() => {
    loadMain();
    loadTx(0);
    loadFds("");
  }, []);

  const toggle = (a) => {
    const call = a.status === "ACTIVE" ? freezeAccount : unfreezeAccount;
    call(a.accountNumber).then(() => loadMain()).catch((e) => setError(errMsg(e)));
  };

  const cards = [
    ["Customers", stats.totalCustomers],
    ["Accounts", stats.totalAccounts],
    ["Frozen", stats.frozenAccounts],
    ["Transactions", stats.totalTransactions],
    ["Active FDs", stats.activeFixedDeposits],
    ["Total balance", stats.totalBalance === undefined ? "" : `₹ ${money(stats.totalBalance)}`],
  ];

  return (
    <Layout title="Admin Dashboard">
      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="row g-3 mb-4">
        {cards.map(([label, value]) => (
          <div className="col-xl-2 col-md-4 col-6" key={label}>
            <div className="card stat-card">
              <div className="stat-label">{label}</div>
              <div className="stat-value">{value}</div>
            </div>
          </div>
        ))}
      </div>

      <ul className="nav nav-pills mb-3 gap-1">
        {["accounts", "users", "transactions", "fixed deposits"].map((t) => (
          <li className="nav-item" key={t}>
            <button className={`nav-link ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>
          </li>
        ))}
      </ul>

      <div className="card p-4 mb-4">
        {tab === "accounts" && (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead><tr><th>Account</th><th>Owner</th><th>Email</th><th>Type</th><th>Balance</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id}>
                    <td>{a.accountNumber}</td><td>{a.user.name}</td><td>{a.user.email}</td>
                    <td>{a.accountType}</td><td>₹ {money(a.balance)}</td>
                    <td><span className={`badge ${a.status === "ACTIVE" ? "badge-soft-success" : "badge-soft-danger"}`}>{a.status}</span></td>
                    <td>
                      <button className={`btn btn-sm ${a.status === "ACTIVE" ? "btn-outline-danger" : "btn-success"}`} onClick={() => toggle(a)}>
                        {a.status === "ACTIVE" ? "Freeze" : "Unfreeze"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "users" && (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td><td>{u.name}</td><td>{u.email}</td>
                    <td><span className={`badge ${u.role === "ADMIN" ? "badge-soft-warning" : "badge-soft-primary"}`}>{u.role}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "transactions" && (
          <>
            <form className="row g-2 mb-3" onSubmit={handleSubmit(() => loadTx(0))}>
              <div className="col-md-3"><input type="text" className="form-control" placeholder="Account number" {...register("account")} /></div>
              <div className="col-md-2">
                <select className="form-select" {...register("type")}>
                  <option value="">All types</option>
                  <option value="DEPOSIT">Deposit</option>
                  <option value="WITHDRAW">Withdraw</option>
                  <option value="TRANSFER">Transfer</option>
                  <option value="FD_OPEN">FD opened</option>
                  <option value="FD_MATURITY">FD matured</option>
                </select>
              </div>
              <div className="col-md-2"><input type="date" className="form-control" onClick={openPicker} {...register("from")} /></div>
              <div className="col-md-2"><input type="date" className="form-control" onClick={openPicker} {...register("to")} /></div>
              <div className="col-md-2"><button className="btn btn-primary w-100">Filter</button></div>
            </form>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead><tr><th>Reference</th><th>Date</th><th>Type</th><th>From</th><th>To</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {tx.content.length > 0 ? (
                    tx.content.map((t) => (
                      <tr key={t.id}>
                        <td>{t.referenceNo}</td><td>{new Date(t.createdAt).toLocaleString()}</td>
                        <td><span className="badge badge-soft-primary">{t.type}</span></td>
                        <td>{t.fromAccount || "-"}</td><td>{t.toAccount || "-"}</td>
                        <td>₹ {money(t.amount)}</td>
                        <td><span className="badge badge-soft-success">{t.status}</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="7" className="text-center text-muted">No transactions found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
              <span className="text-muted">Page {tx.totalPages === 0 ? 0 : tx.page + 1} of {tx.totalPages} · {tx.totalElements} transactions</span>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-secondary btn-sm" disabled={tx.page === 0} onClick={() => loadTx(tx.page - 1)}>Previous</button>
                <button className="btn btn-primary btn-sm" disabled={tx.page + 1 >= tx.totalPages} onClick={() => loadTx(tx.page + 1)}>Next</button>
              </div>
            </div>
          </>
        )}

        {tab === "fixed deposits" && (
          <>
            <select className="form-select w-auto mb-3" value={fdStatus}
              onChange={(e) => { setFdStatus(e.target.value); loadFds(e.target.value); }}>
              <option value="">All</option>
              <option value="ACTIVE">Active</option>
              <option value="MATURED">Matured</option>
            </select>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead><tr><th>Reference</th><th>Owner</th><th>Account</th><th>Amount</th><th>Maturity amount</th><th>Maturity date</th><th>Status</th></tr></thead>
                <tbody>
                  {fds.length > 0 ? (
                    fds.map((f) => (
                      <tr key={f.id}>
                        <td>{f.referenceNo}</td><td>{f.ownerEmail}</td><td>{f.accountNumber}</td>
                        <td>₹ {money(f.principal)}</td><td>₹ {money(f.maturityAmount)}</td><td>{f.maturityDate}</td>
                        <td><span className={`badge ${f.status === "ACTIVE" ? "badge-soft-primary" : "badge-soft-success"}`}>{f.status}</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="7" className="text-center text-muted">No fixed deposits</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;