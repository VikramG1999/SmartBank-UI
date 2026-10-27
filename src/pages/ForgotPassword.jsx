import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/bankservice";

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (data) => {
    setMessage("");
    setError("");
    forgotPassword(data)
      .then((res) => setMessage(res.data.message))
      .catch((err) => setError(err.response?.data?.message || "Something went wrong"));
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "420px" }}>
      <div className="card p-4 shadow-sm">
        <h2 className="text-center mb-3">Forgot Password</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Registered email</label>
            <input type="text" id="email" className="form-control" placeholder="Enter email"
              {...register("email", {
                required: "Please enter an email",
                pattern: { value: /\S+@\S+\.\S+/, message: "Please enter a valid email" },
              })} />
            {errors.email && <span style={{ color: "red" }}>{errors.email.message}</span>}
          </div>
          {message && <div className="alert alert-success py-2">{message}. Check your inbox.</div>}
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <button type="submit" className="btn btn-primary w-100">Send reset link</button>
        </form>
        <div className="d-flex justify-content-between mt-3">
          <Link to="/login">Back to login</Link>
          <Link to="/reset-password">I already have a reset token</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;