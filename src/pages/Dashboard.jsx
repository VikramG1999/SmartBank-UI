import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Layout from "../components/Layout";
import {
  getAccounts, getAccount, openAccount, transferMoney, getBeneficiaries,
} from "../services/bankservice";
import { errMsg, money, amountRules } from "../services/helper";

const Dashboard = () => {
  const [account, setAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [payees, setPayees] = useState([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const tr = useForm();
  const oa = useForm({ defaultValues: { accountType: "SAVINGS" } });

  const load = () => {
    getAccount().then((r) => setAccount(r.data)).catch((e) => setError(errMsg(e)));
    getAccounts().then((r) => setAccounts(r.data)).catch(console.error);
    getBeneficiaries().then((r) => setPayees(r.data)).catch(console.error);
  };

  useEffect(() => {
    load();
  }, []);

  const done = (text, form) => {
    setMsg(text);
    setError("");
    if (form) form.reset();
    load();
  };
  const fail = (e) => {
    setError(errMsg(e));
    setMsg("");
  };

  const onTransfer = (d) =>
    transferMoney({ toAccount: d.toAccount.trim(), amount: Number(d.amount) })
      .then(() => done("Transfer successful", tr))
      .catch(fail);
  const onOpen = (d) => openAccount(d).then(() => done("New account opened", null)).catch(fail);

  return (
    <Layout title="Dashboard">
      {msg && <div className="alert alert-success py-2">{msg}</div>}
      {error && <div className="alert alert-danger py-2">{error}</div>}

      {account && (
        <div className="hero-card mb-4">
          <div>
            <div className="hero-label">{account.accountType} account</div>
            <div className="hero-number">{account.accountNumber}</div>
            <span className={`badge ${account.status === "ACTIVE" ? "badge-soft-success" : "badge-soft-danger"}`}>
              {account.status}
            </span>
          </div>
          <div className="text-md-end">
            <div className="hero-label">Available balance</div>
            <div className="hero-balance">₹ {money(account.balance)}</div>
          </div>
        </div>
      )}

      <div className="row g-3 mb-4">
               <div className="col-12">
          <div className="card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Transfer</h5>
              <small className="text-muted">Daily transfer limit: ₹ 50,000</small>
            </div>
            <form onSubmit={tr.handleSubmit(onTransfer)}>
              <div className="row g-2 align-items-start">
                <div className="col-md-3">
                  <select className="form-select" defaultValue="" onChange={(e) => tr.setValue("toAccount", e.target.value)}>
                    <option value="">Choose a saved payee</option>
                    {payees.map((p) => (
                      <option key={p.id} value={p.accountNumber}>{p.nickname} - {p.accountNumber}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <input type="text" className="form-control" placeholder="Receiver account number"
                    {...tr.register("toAccount", { required: "Please enter the receiver account" })} />
                  {tr.formState.errors.toAccount && <span style={{ color: "red" }}>{tr.formState.errors.toAccount.message}</span>}
                </div>
                <div className="col-md-3">
                  <input type="text" className="form-control" placeholder="Amount" {...tr.register("amount", amountRules)} />
                  {tr.formState.errors.amount && <span style={{ color: "red" }}>{tr.formState.errors.amount.message}</span>}
                </div>
                <div className="col-md-3">
                  <button className="btn btn-primary w-100">Send money</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <h5 className="mb-0">My accounts</h5>
          <form className="d-flex gap-2" onSubmit={oa.handleSubmit(onOpen)}>
            <select className="form-select w-auto" {...oa.register("accountType")}>
              <option value="SAVINGS">Savings</option>
              <option value="CURRENT">Current</option>
            </select>
            <button className="btn btn-outline-primary">Open new account</button>
          </form>
        </div>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead><tr><th>Account number</th><th>Type</th><th>Status</th><th>Balance</th></tr></thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id}>
                  <td>{a.accountNumber}</td>
                  <td>{a.accountType}</td>
                  <td><span className={`badge ${a.status === "ACTIVE" ? "badge-soft-success" : "badge-soft-danger"}`}>{a.status}</span></td>
                  <td>₹ {money(a.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;