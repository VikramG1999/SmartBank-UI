import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/bankservice";

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = (data) => {
    registerUser(data)
      .then((res) => {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("name", res.data.name);
        localStorage.setItem("role", res.data.role);
        localStorage.removeItem("account");
        navigate("/dashboard");
      })
      .catch((err) => setError(err.response?.data?.message || "Registration failed"));
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "420px" }}>
      <div className="card p-4 shadow-sm">
        <h2 className="text-center mb-3">Create Account</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Name</label>
            <input type="text" id="name" className="form-control" placeholder="Enter name"
              {...register("name", {
                required: "Please enter a name",
                minLength: { value: 3, message: "Please enter at least 3 characters" },
              })} />
            {errors.name && <span style={{ color: "red" }}>{errors.name.message}</span>}
          </div>
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
            <input type="password" id="password" className="form-control" placeholder="At least 6 characters"
              {...register("password", {
                required: "Please enter a password",
                minLength: { value: 6, message: "Password must be at least 6 characters" },
              })} />
            {errors.password && <span style={{ color: "red" }}>{errors.password.message}</span>}
          </div>
          <div className="mb-3">
            <label htmlFor="accountType" className="form-label">Account type</label>
            <select id="accountType" className="form-select" {...register("accountType")}>
              <option value="SAVINGS">Savings</option>
              <option value="CURRENT">Current</option>
            </select>
          </div>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <button type="submit" className="btn btn-primary w-100">Register</button>
        </form>
        <p className="text-center mt-3 mb-0">Already registered? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
};

export default Register;