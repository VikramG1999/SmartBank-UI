import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/bankservice";

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = (data) => {
    loginUser(data)
      .then((res) => {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("name", res.data.name);
        localStorage.setItem("role", res.data.role);
        localStorage.removeItem("account");
        navigate(res.data.role === "ADMIN" ? "/admin" : "/dashboard");
      })
      .catch((err) => setError(err.response?.data?.message || "Login failed"));
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "420px" }}>
      <div className="card p-4 shadow-sm">
        <h2 className="text-center mb-3">SmartBank Login</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input type="text" id="email" className="form-control" placeholder="Enter email"
              {...register("email", {
                required: "Please enter an email",
                pattern: { value: /\S+@\S+\.\S+/, message: "Please enter a valid email" },
              })} />
            {errors.email && <span style={{ color: "red" }}>{errors.email.message}</span>}
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" id="password" className="form-control" placeholder="Enter password"
              {...register("password", { required: "Please enter a password" })} />
            {errors.password && <span style={{ color: "red" }}>{errors.password.message}</span>}
          </div>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
        <div className="d-flex justify-content-between mt-3">
          <Link to="/forgot-password">Forgot password?</Link>
          <Link to="/register">Create account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;