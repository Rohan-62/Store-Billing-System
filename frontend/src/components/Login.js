import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Check your credentials.");
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ 
            width: 48, height: 48, borderRadius: 12, 
            background: "var(--primary)", display: "inline-flex", 
            alignItems: "center", justifyContent: "center",
            marginBottom: 16, fontSize: "1.4rem"
          }}>
            🏪
          </div>
          <h2 style={{ marginBottom: 4 }}>Store Billing</h2>
          <p className="login-subtitle">Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Username</label>
            <input 
              className="form-input"
              placeholder="Enter username" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input"
              placeholder="Enter password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required
            />
          </div>
          <button 
            className="btn btn-primary" 
            type="submit" 
            disabled={loading}
            style={{ width: "100%", padding: "12px" }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        {error && (
          <div className="alert alert-danger" style={{ marginTop: 16, marginBottom: 0 }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
