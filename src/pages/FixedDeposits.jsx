import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Layout from "../components/Layout";
import { getFdOptions, getFdQuote, openFd, getMyFds, closeFd } from "../services/bankservice";
import { errMsg, money } from "../services/helper";

const FixedDeposits = () => {
  const { register, handleSubmit, getValues, reset, trigger, formState: { errors } } = useForm({
    defaultValues: { amount: "", months: "12" },
  });
  const [options, setOptions] = useState(null);
  const [quote, setQuote] = useState(null);
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const today = new Date().toLocaleDateString("en-CA"); // yyyy-mm-dd in local time
  const daysLeft = (d) => Math.max(0, Math.ceil((new Date(d) - new Date(today)) / 86400000));
  const active = list.filter((f) => f.status === "ACTIVE");
  const invested = active.reduce((s, f) => s + Number(f.principal), 0);
  const expected = active.reduce((s, f) => s + Number(f.maturityAmount), 0);

  const load = () => {
    getMyFds().then((r) => setList(r.data)).catch((e) => setError(errMsg(e)));
  };

  useEffect(() => {
    getFdOptions().then((r) => setOptions(r.data)).catch(console.error);
    load();
  }, []);

  const onQuote = () => {
    trigger("amount").then((ok) => {
      if (!ok) return;
      const { amount, months } = getValues();
      getFdQuote({ amount: Number(amount), months: Number(months) })
        .then((r) => {
          setQuote(r.data);
          setError("");
        })
        .catch((e) => setError(errMsg(e)));
    });
  };

  const onOpen = (data) => {
    openFd({ amount: Number(data.amount), months: Number(data.months) })
      .then(() => {
        setMsg("Fixed deposit created");
        setError("");
        setQuote(null);
        reset();
        load();
      })
      .catch((e) => {
        setError(errMsg(e));
        setMsg("");
      });
  };

  const onClose = (id) => {
    closeFd(id)
      .then(() => {
        setMsg("Fixed deposit closed. The maturity amount was credited to your account");
        setError("");
        load();
      })
      .catch((e) => setError(errMsg(e)));
  };

  return (
    <Layout title="Fixed Deposits">
      {msg && <div className="alert alert-success py-2">{msg}</div>}
      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-md-4"><div className="card stat-card"><div className="stat-label">Active deposits</div><div className="stat-value">{active.length}</div></div></div>
        <div className="col-md-4"><div className="card stat-card"><div className="stat-label">Total invested</div><div className="stat-value">₹ {money(invested)}</div></div></div>
        <div className="col-md-4"><div className="card stat-card"><div className="stat-label">Expected at maturity</div><div className="stat-value">₹ {money(expected)}</div></div></div>
      </div>

      <div className="card p-4 mb-4">
        <h5>Open a fixed deposit</h5>
        {options && (
          <p className="text-muted mb-3">
            Interest rate {options.annualRatePercent}% per year · Minimum ₹ {money(options.minimumAmount)}<br />
            <small>{options.formula}</small>
          </p>
        )}
        <form className="row g-2" onSubmit={handleSubmit(onOpen)}>
          <div className="col-md-4">
            <input type="text" className="form-control" placeholder="Amount (minimum 1000)"
              {...register("amount", {
                required: "Please enter an amount",
                pattern: { value: /^\d+(\.\d{1,2})?$/, message: "Enter a valid amount, for example 5000" },
                validate: (v) => Number(v) >= 1000 || "Minimum amount is 1000",
              })} />
            {errors.amount && <span style={{ color: "red" }}>{errors.amount.message}</span>}
          </div>
          <div className="col-md-3">
            <select className="form-select" {...register("months")}>
              {(options?.tenuresInMonths || [12]).map((m) => (
                <option key={m} value={m}>{m} months</option>
              ))}
            </select>
          </div>
          <div className="col-md-3 col-6"><button type="button" className="btn btn-outline-primary w-100" onClick={onQuote}>Check maturity</button></div>
          <div className="col-md-2 col-6"><button className="btn btn-primary w-100">Open FD</button></div>
        </form>
        {quote && (
          <div className="alert alert-info mt-3 mb-0">
            Interest: ₹ {money(quote.interest)} · Maturity amount: <b>₹ {money(quote.maturityAmount)}</b> · Maturity date: {quote.maturityDate}
          </div>
        )}
      </div>

      <div className="card p-4 mb-4">
        <h5 className="mb-1">My deposits</h5>
        <p className="text-muted">A deposit can be closed only on or after its maturity date. The maturity amount is credited to the account it was opened from.</p>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr><th>Reference</th><th>Amount</th><th>Rate</th><th>Tenure</th><th>Maturity amount</th><th>Maturity date</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {list.length > 0 ? (
                list.map((f) => (
                  <tr key={f.id}>
                    <td>{f.referenceNo}</td>
                    <td>₹ {money(f.principal)}</td>
                    <td>{f.annualRate}%</td>
                    <td>{f.months} months</td>
                    <td>₹ {money(f.maturityAmount)}</td>
                    <td>{f.maturityDate}</td>
                    <td><span className={`badge ${f.status === "ACTIVE" ? "badge-soft-primary" : "badge-soft-success"}`}>{f.status}</span></td>
                    <td>
                      {f.status !== "ACTIVE" ? (
                        <span className="text-muted">Closed</span>
                      ) : f.maturityDate <= today ? (
                        <button className="btn btn-success btn-sm" onClick={() => onClose(f.id)}>Close and withdraw</button>
                      ) : (
                        <div>
                          <button className="btn btn-outline-secondary btn-sm" disabled>Locked</button>
                          <div className="small text-muted mt-1">Opens {f.maturityDate} ({daysLeft(f.maturityDate)} days)</div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="8" className="text-center text-muted">No fixed deposits yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default FixedDeposits;