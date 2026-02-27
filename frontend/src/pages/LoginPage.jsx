import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/login", formData);
      login(res.data.data.user, res.data.data.token);
      toast.success("Welcome back!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
    }}>

      {/* Left Panel */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)",
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        padding: "60px", position: "relative", overflow: "hidden",
      }}>
        {/* Decorations */}
        <div style={{position: "absolute", top: "-80px", right: "-80px", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)"}} />
        <div style={{position: "absolute", bottom: "-60px", left: "-60px", width: "250px", height: "250px", background: "radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)"}} />
        <div style={{position: "absolute", top: "40%", left: "10%", width: "150px", height: "150px", background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)"}} />

        {/* Content */}
        <div style={{position: "relative", textAlign: "center", maxWidth: "400px"}}>
          <div style={{
            width: "80px", height: "80px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: "24px", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: "40px", margin: "0 auto 32px",
            boxShadow: "0 8px 40px rgba(99,102,241,0.5)",
          }}>
            🌍
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "42px", fontWeight: 900,
            color: "white", lineHeight: 1.1,
            marginBottom: "20px",
          }}>
            Make Your<br/>
            <span style={{background: "linear-gradient(135deg, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"}}>
              Voice Heard
            </span>
          </h1>
          <p style={{color: "#94a3b8", fontSize: "16px", lineHeight: 1.7, marginBottom: "40px"}}>
            Join thousands of citizens raising civic issues and driving real change in their communities.
          </p>

          {/* Stats */}
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"}}>
            {[
              { value: "10K+", label: "Active Users", emoji: "👥" },
              { value: "50K+", label: "Issues Raised", emoji: "📢" },
              { value: "80%", label: "Issues Resolved", emoji: "✅" },
              { value: "100+", label: "Cities Covered", emoji: "🏙️" },
            ].map((s) => (
              <div key={s.label} style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px", padding: "16px", textAlign: "left",
              }}>
                <div style={{fontSize: "20px", marginBottom: "4px"}}>{s.emoji}</div>
                <div style={{color: "white", fontWeight: 800, fontSize: "22px"}}>{s.value}</div>
                <div style={{color: "#64748b", fontSize: "12px"}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div style={{
        background: "#f8fafc",
        display: "flex", alignItems: "center",
        justifyContent: "center", padding: "60px",
      }}>
        <div style={{width: "100%", maxWidth: "420px"}}>

          {/* Header */}
          <div style={{marginBottom: "40px"}}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "#ede9fe", borderRadius: "99px",
              padding: "6px 14px", marginBottom: "20px",
            }}>
              <span style={{width: "6px", height: "6px", background: "#8b5cf6", borderRadius: "50%"}} />
              <span style={{color: "#7c3aed", fontSize: "12px", fontWeight: 700, letterSpacing: "1px"}}>WELCOME BACK</span>
            </div>
            <h2 style={{fontFamily: "'Playfair Display', serif", fontSize: "36px", fontWeight: 800, color: "#0f172a", lineHeight: 1.1, marginBottom: "8px"}}>
              Sign in to your account
            </h2>
            <p style={{color: "#64748b", fontSize: "15px"}}>
              Don't have an account?{" "}
              <Link to="/signup" style={{color: "#6366f1", fontWeight: 700, textDecoration: "none"}}>
                Create one free →
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{marginBottom: "20px"}}>
              <label style={{display: "block", fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px", letterSpacing: "0.5px"}}>
                EMAIL ADDRESS
              </label>
              <input
                type="email" name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                style={{
                  width: "100%", padding: "14px 18px",
                  borderRadius: "12px", border: "2px solid #e2e8f0",
                  fontSize: "15px", outline: "none",
                  background: "white", transition: "all 0.2s",
                  color: "#0f172a",
                }}
                onFocus={e => { e.target.style.border = "2px solid #6366f1"; e.target.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.1)"; }}
                onBlur={e => { e.target.style.border = "2px solid #e2e8f0"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div style={{marginBottom: "28px"}}>
              <label style={{display: "block", fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px", letterSpacing: "0.5px"}}>
                PASSWORD
              </label>
              <input
                type="password" name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                style={{
                  width: "100%", padding: "14px 18px",
                  borderRadius: "12px", border: "2px solid #e2e8f0",
                  fontSize: "15px", outline: "none",
                  background: "white", transition: "all 0.2s",
                  color: "#0f172a",
                }}
                onFocus={e => { e.target.style.border = "2px solid #6366f1"; e.target.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.1)"; }}
                onBlur={e => { e.target.style.border = "2px solid #e2e8f0"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                width: "100%", padding: "15px",
                borderRadius: "12px", border: "none",
                background: loading ? "#94a3b8" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "white", fontSize: "16px", fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.4)",
                transition: "all 0.2s",
              }}
            >
              {loading ? "⏳ Signing in..." : "Sign In →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;