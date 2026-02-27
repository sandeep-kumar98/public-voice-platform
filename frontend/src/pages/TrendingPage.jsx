import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const categoryConfig = {
  Road: { gradient: "linear-gradient(135deg, #f97316, #ea580c)", emoji: "🛣️" },
  Water: { gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)", emoji: "💧" },
  Electricity: { gradient: "linear-gradient(135deg, #eab308, #ca8a04)", emoji: "⚡" },
  Sanitation: { gradient: "linear-gradient(135deg, #22c55e, #16a34a)", emoji: "🧹" },
  Crime: { gradient: "linear-gradient(135deg, #ef4444, #dc2626)", emoji: "🚨" },
  Education: { gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)", emoji: "📚" },
  Health: { gradient: "linear-gradient(135deg, #ec4899, #db2777)", emoji: "🏥" },
  Environment: { gradient: "linear-gradient(135deg, #14b8a6, #0d9488)", emoji: "🌿" },
  Other: { gradient: "linear-gradient(135deg, #6b7280, #4b5563)", emoji: "📌" },
};

const rankConfig = [
  { bg: "linear-gradient(135deg, #fbbf24, #f59e0b)", shadow: "rgba(251,191,36,0.4)", label: "🥇" },
  { bg: "linear-gradient(135deg, #94a3b8, #64748b)", shadow: "rgba(148,163,184,0.4)", label: "🥈" },
  { bg: "linear-gradient(135deg, #f97316, #ea580c)", shadow: "rgba(249,115,22,0.4)", label: "🥉" },
];

const TrendingPage = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axiosInstance.get("/issues/trending");
        setIssues(res.data.data.issues);
      } catch { toast.error("Failed to load trending issues"); }
      finally { setLoading(false); }
    };
    fetchTrending();
  }, []);

  const formatDate = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 60000);
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div style={{minHeight: "100vh", background: "#f8fafc"}}>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)",
        padding: "60px 40px 100px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{position: "absolute", top: "-100px", right: "-100px", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)"}} />
        <div style={{position: "absolute", bottom: "-60px", left: "5%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)"}} />

        <div style={{maxWidth: "900px", margin: "0 auto", position: "relative", textAlign: "center"}}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)",
            borderRadius: "99px", padding: "8px 20px", marginBottom: "24px",
          }}>
            <span style={{fontSize: "16px"}}>🔥</span>
            <span style={{color: "#fbbf24", fontSize: "12px", fontWeight: 700, letterSpacing: "2px"}}>TRENDING NOW</span>
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(36px, 5vw, 56px)",
            fontWeight: 900, color: "white", lineHeight: 1.1, marginBottom: "16px",
          }}>
            Top Civic Issues<br/>
            <span style={{background: "linear-gradient(135deg, #fbbf24, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"}}>
              This Week
            </span>
          </h1>
          <p style={{color: "#94a3b8", fontSize: "17px", maxWidth: "500px", margin: "0 auto"}}>
            Issues ranked by community votes, support, and urgency score.
          </p>

          {/* Live indicator */}
          <div style={{display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "24px"}}>
            <span style={{width: "8px", height: "8px", background: "#22c55e", borderRadius: "50%", boxShadow: "0 0 8px #22c55e"}} />
            <span style={{color: "#94a3b8", fontSize: "13px"}}>Live rankings · Updates in real-time</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{maxWidth: "900px", margin: "-50px auto 0", padding: "0 32px 60px", position: "relative"}}>

        {loading && (
          <div style={{textAlign: "center", padding: "80px"}}>
            <div style={{width: "48px", height: "48px", border: "3px solid #e2e8f0", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px"}} />
            <p style={{color: "#94a3b8"}}>Loading trending issues...</p>
          </div>
        )}

        {!loading && issues.length === 0 && (
          <div style={{textAlign: "center", padding: "80px", background: "white", borderRadius: "24px", border: "1px solid #e2e8f0"}}>
            <div style={{fontSize: "64px", marginBottom: "16px"}}>📭</div>
            <h3 style={{fontFamily: "'Playfair Display', serif", fontSize: "24px", color: "#0f172a", marginBottom: "8px"}}>No trending issues yet</h3>
            <p style={{color: "#94a3b8"}}>Be the first to post and get community support!</p>
          </div>
        )}

        <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
          {issues.map((issue, index) => {
            const config = categoryConfig[issue.category] || categoryConfig.Other;
            const rank = rankConfig[index] || { bg: "linear-gradient(135deg, #e2e8f0, #cbd5e1)", shadow: "rgba(0,0,0,0.1)", label: `#${index + 1}` };
            const isTop3 = index < 3;

            return (
              <div
                key={issue._id}
                onClick={() => navigate(`/issues/${issue._id}`)}
                style={{
                  background: "white",
                  borderRadius: "20px",
                  border: isTop3 ? "1px solid rgba(99,102,241,0.2)" : "1px solid #e2e8f0",
                  boxShadow: isTop3 ? "0 8px 40px rgba(99,102,241,0.1)" : "0 2px 16px rgba(0,0,0,0.04)",
                  overflow: "hidden", cursor: "pointer",
                  transition: "all 0.3s",
                  display: "flex",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = isTop3 ? "0 8px 40px rgba(99,102,241,0.1)" : "0 2px 16px rgba(0,0,0,0.04)"; }}
              >
                {/* Rank Badge */}
                <div style={{
                  width: "72px", flexShrink: 0,
                  background: rank.bg,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: "4px",
                  boxShadow: `inset -4px 0 20px rgba(0,0,0,0.1)`,
                }}>
                  <span style={{fontSize: isTop3 ? "28px" : "18px"}}>
                    {isTop3 ? rank.label : `#${index + 1}`}
                  </span>
                  {isTop3 && (
                    <span style={{color: "rgba(255,255,255,0.8)", fontSize: "10px", fontWeight: 700}}>
                      RANK
                    </span>
                  )}
                </div>

                {/* Left color accent */}
                <div style={{width: "4px", background: config.gradient, flexShrink: 0}} />

                {/* Content */}
                <div style={{flex: 1, padding: "20px 24px"}}>
                  <div style={{display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px"}}>
                    <div style={{flex: 1}}>
                      {/* Category + Status */}
                      <div style={{display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px"}}>
                        <span style={{
                          fontSize: "11px", fontWeight: 700, padding: "3px 10px",
                          borderRadius: "99px", background: "#f8fafc", color: "#64748b",
                          border: "1px solid #e2e8f0",
                        }}>
                          {config.emoji} {issue.category}
                        </span>
                        <span style={{
                          fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "99px",
                          ...(issue.status === "resolved" ? { background: "#dcfce7", color: "#16a34a" } :
                              issue.status === "flagged" ? { background: "#fee2e2", color: "#dc2626" } :
                              { background: "#dbeafe", color: "#2563eb" })
                        }}>
                          {issue.status === "resolved" ? "✅ Resolved" : issue.status === "flagged" ? "🚩 Flagged" : "🔵 Open"}
                        </span>
                        {issue.sentiment === "urgent" && (
                          <span style={{fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "99px", background: "#fff7ed", color: "#ea580c", border: "1px solid #fed7aa"}}>
                            🚨 Urgent
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "18px", fontWeight: 800,
                        color: "#0f172a", lineHeight: 1.3,
                        marginBottom: "6px",
                      }}>
                        {issue.title}
                      </h2>

                      {/* Description */}
                      <p style={{
                        color: "#64748b", fontSize: "13px",
                        lineHeight: 1.6, marginBottom: "14px",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>
                        {issue.description}
                      </p>

                      {/* Author + Location */}
                      <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                        <div style={{
                          width: "28px", height: "28px", borderRadius: "8px",
                          background: config.gradient,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 700, color: "white", fontSize: "12px",
                        }}>
                          {issue.author?.name?.charAt(0)}
                        </div>
                        <span style={{fontSize: "12px", fontWeight: 600, color: "#374151"}}>
                          {issue.author?.name}
                        </span>
                        <span style={{color: "#cbd5e1", fontSize: "12px"}}>·</span>
                        <span style={{fontSize: "12px", color: "#94a3b8"}}>
                          📍 {issue.location?.city}, {issue.location?.state}
                        </span>
                        <span style={{color: "#cbd5e1", fontSize: "12px"}}>·</span>
                        <span style={{fontSize: "12px", color: "#94a3b8"}}>
                          {formatDate(issue.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Stats Column */}
                    <div style={{display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0}}>
                      {[
                        { emoji: "👍", value: issue.voteCount, color: "#3b82f6", bg: "#eff6ff" },
                        { emoji: "✊", value: issue.supportCount, color: "#22c55e", bg: "#f0fdf4" },
                        { emoji: "💬", value: issue.commentCount, color: "#8b5cf6", bg: "#f5f3ff" },
                      ].map((stat) => (
                        <div key={stat.emoji} style={{
                          display: "flex", alignItems: "center", gap: "6px",
                          background: stat.bg, padding: "6px 12px",
                          borderRadius: "8px", minWidth: "70px",
                          justifyContent: "center",
                        }}>
                          <span style={{fontSize: "14px"}}>{stat.emoji}</span>
                          <span style={{fontWeight: 800, color: stat.color, fontSize: "14px"}}>{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrendingPage;