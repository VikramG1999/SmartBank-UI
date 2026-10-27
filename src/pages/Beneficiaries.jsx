import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Layout from "../components/Layout";
import { getBeneficiaries, addBeneficiary, deleteBeneficiary } from "../services/bankservice";
import { errMsg } from "../services/helper";

const Beneficiaries = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    getBeneficiaries().then((r) => setList(r.data)).catch((e) => setError(errMsg(e)));
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = (data) => {
    setMsg("");
    setError("");
    addBeneficiary(data)
      .then((r) => {
        setMsg(`Payee added: ${r.data.accountHolderName}`);
        reset();
        load();
      })
      .catch((e) => setError(errMsg(e)));
  };

  const onDelete = (b) => {
    if (window.confirm(`Remove ${b.accountHolderName} from your payees?`)) {
      setMsg("");
      setError("");
      deleteBeneficiary(b.id)
        .then(() => {
          setMsg(`Payee removed: ${b.accountHolderName}`);
          load();
        })
        .catch((e) => setError(errMsg(e)));
    }
  };

  return (
    <Layout title="Saved Payees">
      {msg && <div className="alert alert-success py-2">{msg}</div>}
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <div className="row g-3">
        <div className="col-lg-4">
          <div className="card p-4">
            <h5>Add payee</h5>
            <form onSubmit={handleSubmit(onSubmit)}>
              <label htmlFor="accountNumber" className="form-label">Account number</label>
              <input type="text" id="accountNumber" className="form-control" placeholder="SB1234567890"
                {...register("accountNumber", { required: "Please enter an account number" })} />
              {errors.accountNumber && <span style={{ color: "red" }}>{errors.accountNumber.message}</span>}
              <label htmlFor="nickname" className="form-label mt-3">Nickname (optional)</label>
              <input type="text" id="nickname" className="form-control" placeholder="Nickname"
                {...register("nickname", { maxLength: { value: 30, message: "Maximum 30 characters" } })} />
              {errors.nickname && <span style={{ color: "red" }}>{errors.nickname.message}</span>}
              <button className="btn btn-primary w-100 mt-4">Verify and add</button>
            </form>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="card p-4">
            <h5 className="mb-3">Your payees</h5>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead><tr><th>Nickname</th><th>Account holder</th><th>Account number</th><th>Action</th></tr></thead>
                <tbody>
                  {list.length > 0 ? (
                    list.map((b) => (
                      <tr key={b.id}>
                        <td>{b.nickname}</td><td>{b.accountHolderName}</td><td>{b.accountNumber}</td>
                        <td><button className="btn btn-outline-danger btn-sm" onClick={() => onDelete(b)}>Remove</button></td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" className="text-center text-muted">No payees saved</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Beneficiaries;