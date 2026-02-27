import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out!");
    navigate("/login");
  };

  return (
    <nav style={{
      background: "rgba(15, 23, 42, 0.97)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div style={{maxWidth: "1400px", margin: "0 auto", padding: "0 32px", height: "68px", display: "flex", alignItems: "center", justifyContent: "space-between"}}>

        {/* Logo */}
        <Link to="/" style={{display: "flex", alignItems: "center", gap: "12px", textDecoration: "none"}}>
          <div style={{width: "40px", height: "40px", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", boxShadow: "0 4px 20px rgba(59,130,246,0.4)"}}>
            🌍
          </div>
          <div>
            <div style={{fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "20px", color: "white", letterSpacing: "-0.5px"}}>
              Public Voice
            </div>
            <div style={{fontSize: "10px", color: "#64748b", letterSpacing: "2px", textTransform: "uppercase"}}>
              Civic Platform
            </div>
          </div>
        </Link>

        {/* Nav Links */}
        <div style={{display: "flex", alignItems: "center", gap: "4px"}}>
          {[
            { to: "/", label: "Home" },
            { to: "/trending", label: "🔥 Trending" },
            ...(user ? [{ to: "/create-issue", label: "+ Post Issue" }] : []),
            ...(user?.role === "admin" ? [{ to: "/admin", label: "⚡ Admin" }] : []),
          ].map((link) => (
            <Link key={link.to} to={link.to} style={{
              padding: "8px 16px",
              borderRadius: "8px",
              color: "#94a3b8",
              fontSize: "14px",
              fontWeight: 500,
              textDecoration: "none",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.target.style.color = "white"; e.target.style.background = "rgba(255,255,255,0.08)"; }}
            onMouseLeave={e => { e.target.style.color = "#94a3b8"; e.target.style.background = "transparent"; }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div style={{display: "flex", alignItems: "center", gap: "12px"}}>
          {user ? (
            <>
              <Link to={`/profile/${user._id}`} style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "6px 14px", borderRadius: "10px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                textDecoration: "none", transition: "all 0.2s",
              }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "8px",
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, color: "white", fontSize: "14px",
                }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{color: "white", fontSize: "14px", fontWeight: 500}}>
                  {user.name?.split(" ")[0]}
                </span>
              </Link>
              <button onClick={handleLogout} style={{
                padding: "8px 18px", borderRadius: "8px",
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171", fontSize: "14px", fontWeight: 600,
                cursor: "pointer", transition: "all 0.2s",
              }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{color: "#94a3b8", fontSize: "14px", fontWeight: 500, textDecoration: "none", padding: "8px 16px"}}>
                Login
              </Link>
              <Link to="/signup" style={{
                padding: "10px 24px", borderRadius: "10px",
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                color: "white", fontSize: "14px", fontWeight: 700,
                textDecoration: "none", boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
                transition: "all 0.2s",
              }}>
                Get Started →
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;