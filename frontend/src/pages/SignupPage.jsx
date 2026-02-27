import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

const SignupPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", city: "", state: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/signup", formData);
      login(res.data.data.user, res.data.data.token);
      toast.success("Welcome to Public Voice!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed!");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "13px 18px",
    borderRadius: "12px", border: "2px solid #e2e8f0",
    fontSize: "14px", outline: "none",
    background: "white", transition: "all 0.2s",
    color: "#0f172a", fontFamily: "'DM Sans', sans-serif",
  };

  const labelStyle = {
    display: "block", fontSize: "12px",
    fontWeight: 700, color: "#374151",
    marginBottom: "6px", letterSpacing: "0.5px",
  };

  return (
    <div style={{minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr"}}>

      {/* Left Panel */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)",
        display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "60px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)"}} />
        <div style={{position: "absolute", bottom: "-50px", left: "-50px", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)"}} />

        <div style={{position: "relative", maxWidth: "420px"}}>
          <div style={{
            width: "64px", height: "64px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: "18px", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: "32px", marginBottom: "32px",
            boxShadow: "0 8px 32px rgba(99,102,241,0.5)",
          }}>
            🌍
          </div>

          <h1 style={{fontFamily: "'Playfair Display', serif", fontSize: "38px", fontWeight: 900, color: "white", lineHeight: 1.1, marginBottom: "16px"}}>
            Join the Movement<br/>
            <span style={{background: "linear-gradient(135deg, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"}}>
              for Change
            </span>
          </h1>

          <p style={{color: "#94a3b8", fontSize: "15px", lineHeight: 1.7, marginBottom: "40px"}}>
            Become part of a growing community of citizens working together to solve civic problems and improve their neighborhoods.
          </p>

          {/* Steps */}
          <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
            {[
              { step: "01", title: "Create Account", desc: "Sign up in under 60 seconds" },
              { step: "02", title: "Post Issues", desc: "Report problems in your area" },
              { step: "03", title: "Gather Support", desc: "Get community backing" },
              { step: "04", title: "Drive Change", desc: "See real results happen" },
            ].map((s) => (
              <div key={s.step} style={{display: "flex", alignItems: "center", gap: "16px"}}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "12px",
                  background: "rgba(99,102,241,0.2)",
                  border: "1px solid rgba(99,102,241,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#818cf8", fontWeight: 800, fontSize: "12px", flexShrink: 0,
                }}>
                  {s.step}
                </div>
                <div>
                  <div style={{color: "white", fontWeight: 700, fontSize: "14px"}}>{s.title}</div>
                  <div style={{color: "#64748b", fontSize: "12px"}}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{
        background: "#f8fafc",
        display: "flex", alignItems: "center",
        justifyContent: "center", padding: "40px 60px",
        overflowY: "auto",
      }}>
        <div style={{width: "100%", maxWidth: "440px"}}>

          {/* Header */}
          <div style={{marginBottom: "32px"}}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "#dcfce7", borderRadius: "99px",
              padding: "6px 14px", marginBottom: "16px",
            }}>
              <span style={{width: "6px", height: "6px", background: "#22c55e", borderRadius: "50%"}} />
              <span style={{color: "#16a34a", fontSize: "12px", fontWeight: 700, letterSpacing: "1px"}}>FREE FOREVER</span>
            </div>
            <h2 style={{fontFamily: "'Playfair Display', serif", fontSize: "32px", fontWeight: 800, color: "#0f172a", lineHeight: 1.1, marginBottom: "8px"}}>
              Create your account
            </h2>
            <p style={{color: "#64748b", fontSize: "14px"}}>
              Already have an account?{" "}
              <Link to="/login" style={{color: "#6366f1", fontWeight: 700, textDecoration: "none"}}>
                Sign in →
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{marginBottom: "16px"}}>
              <label style={labelStyle}>FULL NAME</label>
              <input type="text" name="name" value={formData.name}
                onChange={handleChange} placeholder="Rahul Sharma" required
                style={inputStyle}
                onFocus={e => { e.target.style.border = "2px solid #6366f1"; e.target.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.1)"; }}
                onBlur={e => { e.target.style.border = "2px solid #e2e8f0"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div style={{marginBottom: "16px"}}>
              <label style={labelStyle}>EMAIL ADDRESS</label>
              <input type="email" name="email" value={formData.email}
                onChange={handleChange} placeholder="you@example.com" required
                style={inputStyle}
                onFocus={e => { e.target.style.border = "2px solid #6366f1"; e.target.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.1)"; }}
                onBlur={e => { e.target.style.border = "2px solid #e2e8f0"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div style={{marginBottom: "16px"}}>
              <label style={labelStyle}>PASSWORD</label>
              <input type="password" name="password" value={formData.password}
                onChange={handleChange} placeholder="Min 6 characters" required
                style={inputStyle}
                onFocus={e => { e.target.style.border = "2px solid #6366f1"; e.target.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.1)"; }}
                onBlur={e => { e.target.style.border = "2px solid #e2e8f0"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "28px"}}>
              <div>
                <label style={labelStyle}>CITY</label>
                <input type="text" name="city" value={formData.city}
                  onChange={handleChange} placeholder="Ludhiana"
                  style={inputStyle}
                  onFocus={e => { e.target.style.border = "2px solid #6366f1"; e.target.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.1)"; }}
                  onBlur={e => { e.target.style.border = "2px solid #e2e8f0"; e.target.style.boxShadow = "none"; }}
                />
              </div>
              <div>
                <label style={labelStyle}>STATE</label>
                <input type="text" name="state" value={formData.state}
                  onChange={handleChange} placeholder="Punjab"
                  style={inputStyle}
                  onFocus={e => { e.target.style.border = "2px solid #6366f1"; e.target.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.1)"; }}
                  onBlur={e => { e.target.style.border = "2px solid #e2e8f0"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "15px", borderRadius: "12px",
              border: "none",
              background: loading ? "#94a3b8" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white", fontSize: "16px", fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.4)",
              transition: "all 0.2s",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {loading ? "⏳ Creating account..." : "Create Account →"}
            </button>

            <p style={{textAlign: "center", color: "#94a3b8", fontSize: "12px", marginTop: "16px"}}>
              By signing up, you agree to our Terms of Service
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;