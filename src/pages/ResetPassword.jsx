import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../services/bankservice";

const ResetPassword = () => {
  const [params] = useSearchParams();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: params.get("email") || "", token: params.get("token") || "" },
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = (data) => {
    const body = { email: data.email.trim(), token: data.token.trim(), newPassword: data.newPassword };
    resetPassword(body)
      .then(() => {
        alert("Password changed. Please login");
        navigate("/login");
      })
      .catch((err) => setError(err.response?.data?.message || "Something went wrong"));
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "420px" }}>
      <div className="card p-4 shadow-sm">
        <h2 className="text-center mb-3">Reset Password</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input type="text" id="email" className="form-control" placeholder="Registered email"
              {...register("email", {
                required: "Please enter your email",
                pattern: { value: /\S+@\S+\.\S+/, message: "Please enter a valid email" },
              })} />
            {errors.email && <span style={{ color: "red" }}>{errors.email.message}</span>}
          </div>
          <div className="mb-3">
            <label htmlFor="token" className="form-label">Reset token (from the email link)</label>
            <input type="text" id="token" className="form-control" placeholder="Paste the token here"
              {...register("token", { required: "Please enter the reset token" })} />
            {errors.token && <span style={{ color: "red" }}>{errors.token.message}</span>}
          </div>
          <div className="mb-3">
            <label htmlFor="newPassword" className="form-label">New password</label>
            <input type="password" id="newPassword" className="form-control" placeholder="At least 6 characters"
              {...register("newPassword", {
                required: "Please enter a new password",
                minLength: { value: 6, message: "Password must be at least 6 characters" },
              })} />
            {errors.newPassword && <span style={{ color: "red" }}>{errors.newPassword.message}</span>}
          </div>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <button type="submit" className="btn btn-primary w-100">Reset password</button>
        </form>
        <p className="text-center mt-3 mb-0"><Link to="/login">Back to login</Link></p>
      </div>
    </div>
  );
};

export default ResetPassword;