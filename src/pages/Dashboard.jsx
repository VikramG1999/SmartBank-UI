import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Layout from "../components/Layout";
import {
  getAccounts, getAccount, openAccount, depositMoney, withdrawMoney, transferMoney, getBeneficiaries,
} from "../services/bankservice";
import { errMsg, money, amountRules } from "../services/helper";

const Dashboard = () => {
  const [account, setAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [payees, setPayees] = useState([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const dep = useForm();
  const wd = useForm();
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

  const onDeposit = (d) =>
    depositMoney({ amount: Number(d.amount) }).then(() => done("Deposit successful (simulated)", dep)).catch(fail);
  const onWithdraw = (d) =>
    withdrawMoney({ amount: Number(d.amount) }).then(() => done("Withdrawal successful (simulated)", wd)).catch(fail);
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
        <div className="col-lg-4">
          <div className="card action-card deposit h-100 p-4">
            <h5>Deposit</h5>
            <form onSubmit={dep.handleSubmit(onDeposit)}>
              <input type="text" className="form-control mb-1" placeholder="Amount" {...dep.register("amount", amountRules)} />
              {dep.formState.errors.amount && <span style={{ color: "red" }}>{dep.formState.errors.amount.message}</span>}
              <button className="btn btn-success w-100 mt-3">Deposit</button>
            </form>
            <small className="text-muted mt-2">Simulated transaction</small>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card action-card withdraw h-100 p-4">
            <h5>Withdraw</h5>
            <form onSubmit={wd.handleSubmit(onWithdraw)}>
              <input type="text" className="form-control mb-1" placeholder="Amount" {...wd.register("amount", amountRules)} />
              {wd.formState.errors.amount && <span style={{ color: "red" }}>{wd.formState.errors.amount.message}</span>}
              <button className="btn btn-warning w-100 mt-3">Withdraw</button>
            </form>
            <small className="text-muted mt-2">Simulated transaction</small>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card action-card h-100 p-4">
            <h5>Transfer</h5>
            <form onSubmit={tr.handleSubmit(onTransfer)}>
              <select className="form-select mb-2" defaultValue="" onChange={(e) => tr.setValue("toAccount", e.target.value)}>
                <option value="">Choose a saved payee</option>
                {payees.map((p) => (
                  <option key={p.id} value={p.accountNumber}>{p.nickname} - {p.accountNumber}</option>
                ))}
              </select>
              <input type="text" className="form-control mb-1" placeholder="Receiver account number"
                {...tr.register("toAccount", { required: "Please enter the receiver account" })} />
              {tr.formState.errors.toAccount && <span style={{ color: "red" }}>{tr.formState.errors.toAccount.message}</span>}
              <input type="text" className="form-control mt-2 mb-1" placeholder="Amount" {...tr.register("amount", amountRules)} />
              {tr.formState.errors.amount && <span style={{ color: "red" }}>{tr.formState.errors.amount.message}</span>}
              <button className="btn btn-primary w-100 mt-3">Send money</button>
            </form>
            <small className="text-muted mt-2">Daily transfer limit: ₹ 50,000</small>
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