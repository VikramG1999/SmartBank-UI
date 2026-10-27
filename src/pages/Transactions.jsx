import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Layout from "../components/Layout";
import { getAccount, getTransactions, downloadCsv, downloadPdf } from "../services/bankservice";
import { errMsg, money, openPicker } from "../services/helper";

const Transactions = () => {
  const { register, getValues, handleSubmit } = useForm({
    defaultValues: { type: "", search: "", from: "", to: "" },
  });
  const [data, setData] = useState({ content: [], page: 0, totalPages: 0, totalElements: 0 });
  const [accountNo, setAccountNo] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [error, setError] = useState("");

  const load = (p) => {
    getTransactions({ ...getValues(), page: p, size: 8 })
      .then((r) => {
        setData(r.data);
        setError("");
      })
      .catch((e) => setError(errMsg(e)));
  };

  useEffect(() => {
    getAccount().then((r) => setAccountNo(r.data.accountNumber)).catch(console.error);
    load(0);
  }, []);

  const save = (res, name) => {
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const onCsv = () =>
    downloadCsv(month).then((r) => save(r, `statement-${month}.csv`)).catch(() => setError("Could not download the CSV"));
  const onPdf = () =>
    downloadPdf(month).then((r) => save(r, `statement-${month}.pdf`)).catch(() => setError("Could not download the PDF"));

  return (
    <Layout title="Transactions">
      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="card p-4 mb-3">
        <form className="row g-2" onSubmit={handleSubmit(() => load(0))}>
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
          <div className="col-md-3">
            <input type="text" className="form-control" placeholder="Search reference or account" {...register("search")} />
          </div>
          <div className="col-md-2"><input type="date" className="form-control" onClick={openPicker} {...register("from")} /></div>
          <div className="col-md-2"><input type="date" className="form-control" onClick={openPicker} {...register("to")} /></div>
          <div className="col-md-2"><button className="btn btn-primary w-100">Filter</button></div>
        </form>
        <hr />
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <span className="fw-semibold">Statement month</span>
          <input type="month" className="form-control w-auto" value={month} onClick={openPicker}
            onChange={(e) => setMonth(e.target.value)} />
          <button className="btn btn-outline-secondary" onClick={onCsv}>Download CSV</button>
          <button className="btn btn-outline-danger" onClick={onPdf}>Download PDF</button>
        </div>
      </div>

      <div className="card p-4 mb-4">
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr><th>Reference</th><th>Date</th><th>Type</th><th>Details</th><th>Amount</th><th>Balance</th><th>Status</th></tr>
            </thead>
            <tbody>
              {data.content.length > 0 ? (
                data.content.map((t) => {
                  const debit = t.fromAccount === accountNo;
                  const balance = debit ? t.fromBalanceAfter : t.toBalanceAfter;
                  return (
                    <tr key={t.id}>
                      <td>{t.referenceNo}</td>
                      <td>{new Date(t.createdAt).toLocaleString()}</td>
                      <td><span className="badge badge-soft-primary">{t.type}</span>{t.category ? <small className="text-muted"> {t.category}</small> : null}</td>
                      <td>{t.fromAccount || "-"} → {t.toAccount || "-"}</td>
                      <td className={debit ? "text-danger fw-semibold" : "text-success fw-semibold"}>{debit ? "-" : "+"} ₹ {money(t.amount)}</td>
                      <td>{balance === null || balance === undefined ? "-" : `₹ ${money(balance)}`}</td>
                      <td><span className="badge badge-soft-success">{t.status}</span></td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="7" className="text-center text-muted">No transactions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
          <span className="text-muted">Page {data.totalPages === 0 ? 0 : data.page + 1} of {data.totalPages} · {data.totalElements} transactions</span>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" disabled={data.page === 0} onClick={() => load(data.page - 1)}>Previous</button>
            <button className="btn btn-primary btn-sm" disabled={data.page + 1 >= data.totalPages} onClick={() => load(data.page + 1)}>Next</button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Transactions;