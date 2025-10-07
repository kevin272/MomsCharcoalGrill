import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../config/axios.config";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
const res = await axiosInstance.post("/auth/login", {
      username: email.trim(),   // 👈 map the email input to `username`
      password,
    });      const token =
        res?.data?.token ||
        res?.data?.accessToken ||
        res?.data?.data?.token;

      if (!token) throw new Error("Login succeeded but no token returned.");

      if (remember) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }

      navigate(from, { replace: true });
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Unable to sign in. Please check your credentials.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="section" aria-labelledby="login-title">
      <div className="container">
        <div className="auth-wrap" style={{ maxWidth: 520, margin: "0 auto" }}>
          <div className="card auth-card">
            <div className="card-body">
              <h1 id="login-title" className="title" style={{ marginBottom: 8 }}>
                Sign in
              </h1>
              <p className="subtitle" style={{ marginBottom: 24 }}>
                Welcome back! Enter your details to continue.
              </p>

              {err && (
                <div className="alert alert-danger" role="alert" style={{ marginBottom: 16 }}>
                  {err}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-control"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 8 }}>
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="input-group">
                    <input
                      id="password"
                      name="password"
                      type={showPwd ? "text" : "password"}
                      className="form-control"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="btn btn-link"
                      onClick={() => setShowPwd((s) => !s)}
                      aria-label={showPwd ? "Hide password" : "Show password"}
                    >
                      {showPwd ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div
                  className="form-group"
                  style={{
                    marginBottom: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <label className="checkbox" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    <span>Remember me</span>
                  </label>

                  <Link to="/forgot-password" className="link">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  aria-busy={loading}
                  style={{ width: "100%" }}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>

              <p style={{ marginTop: 16, textAlign: "center" }}>
                Don&apos;t have an account?{" "}
                <Link to="/register" className="link">
                  Create one
                </Link>
              </p>
            </div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-body" style={{ textAlign: "center" }}>
              <p style={{ marginBottom: 12 }}>Or continue with</p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button className="btn btn-outline" type="button">
                  Google
                </button>
                <button className="btn btn-outline" type="button">
                  Facebook
                </button>
              </div>
            </div>
          </div>

          <p style={{ marginTop: 16, fontSize: 12, color: "var(--muted, #666)", textAlign: "center" }}>
            By continuing, you agree to our{" "}
            <Link to="/terms" className="link">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="link">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
