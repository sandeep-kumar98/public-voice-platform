import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import IssueCard from "../components/issues/IssueCard";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const CATEGORIES = ["All","Road","Water","Electricity","Sanitation","Crime","Education","Health","Environment","Other"];
const SORTS = [
  { value: "trending", label: "🔥 Trending" },
  { value: "newest", label: "🆕 Newest" },
  { value: "mostVoted", label: "👍 Most Voted" },
  { value: "mostSupported", label: "✊ Most Supported" },
];

const HomePage = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ category: "", sort: "trending", search: "", city: "" });
  const [pagination, setPagination] = useState({});

  useEffect(() => { fetchIssues(); }, [filter]);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.category) params.append("category", filter.category);
      if (filter.sort) params.append("sort", filter.sort);
      if (filter.search) params.append("search", filter.search);
      if (filter.city) params.append("city", filter.city);
      const res = await axiosInstance.get(`/issues?${params}`);
      setIssues(res.data.data.issues);
      setPagination(res.data.data.pagination);
    } catch (error) {
      toast.error("Failed to load issues");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight: "100vh", background: "#f8fafc"}}>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)",
        padding: "60px 32px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background decoration */}
        <div style={{position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)", pointerEvents: "none"}} />
        <div style={{position: "absolute", bottom: "-50px", left: "10%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)", pointerEvents: "none"}} />

        <div style={{maxWidth: "1400px", margin: "0 auto", position: "relative"}}>
          <div style={{display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", borderRadius: "99px", padding: "6px 16px", marginBottom: "20px"}}>
            <span style={{width: "6px", height: "6px", background: "#818cf8", borderRadius: "50%", animation: "pulse 2s infinite"}} />
            <span style={{color: "#a5b4fc", fontSize: "12px", fontWeight: 600, letterSpacing: "1px"}}>LIVE CIVIC PLATFORM</span>
          </div>

          <h1 style={{fontFamily: "'Playfair Display', serif", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 900, color: "white", lineHeight: 1.1, marginBottom: "16px", maxWidth: "700px"}}>
            Your Voice,<br/>
            <span style={{background: "linear-gradient(135deg, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"}}>
              Their Problem.
            </span>
          </h1>
          <p style={{color: "#94a3b8", fontSize: "18px", marginBottom: "32px", maxWidth: "500px", lineHeight: 1.6}}>
            Raise civic issues, gather support, and drive real change in your community.
          </p>

          {/* Search Bar */}
          <div style={{display: "flex", gap: "12px", maxWidth: "600px"}}>
            <div style={{flex: 1, position: "relative"}}>
              <span style={{position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "16px"}}>🔍</span>
              <input
                type="text"
                placeholder="Search issues, locations, categories..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                style={{
                  width: "100%", padding: "14px 16px 14px 44px",
                  borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(10px)",
                  color: "white", fontSize: "15px",
                  outline: "none",
                }}
                onFocus={e => e.target.style.border = "1px solid rgba(99,102,241,0.6)"}
                onBlur={e => e.target.style.border = "1px solid rgba(255,255,255,0.1)"}
              />
            </div>
            <Link to="/create-issue" style={{
              padding: "14px 28px", borderRadius: "14px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white", fontWeight: 700, fontSize: "15px",
              textDecoration: "none", whiteSpace: "nowrap",
              boxShadow: "0 4px 24px rgba(99,102,241,0.5)",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              ✏️ Post Issue
            </Link>
          </div>

          {/* Stats Row */}
          <div style={{display: "flex", gap: "24px", marginTop: "40px"}}>
            {[
              { value: pagination.total || 0, label: "Total Issues", emoji: "📢" },
              { value: "Free", label: "Always Free", emoji: "🆓" },
              { value: "24/7", label: "Live Updates", emoji: "⚡" },
            ].map((s) => (
              <div key={s.label} style={{display: "flex", alignItems: "center", gap: "10px"}}>
                <span style={{fontSize: "24px"}}>{s.emoji}</span>
                <div>
                  <div style={{color: "white", fontWeight: 800, fontSize: "18px"}}>{s.value}</div>
                  <div style={{color: "#64748b", fontSize: "11px", fontWeight: 500}}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{maxWidth: "1400px", margin: "0 auto", padding: "40px 32px", display: "flex", gap: "28px", alignItems: "flex-start"}}>

        {/* Sidebar */}
        <div style={{width: "260px", flexShrink: 0, position: "sticky", top: "88px"}}>

          {/* City Filter */}
          <div style={{background: "white", borderRadius: "16px", padding: "20px", marginBottom: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)"}}>
            <h3 style={{fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "12px"}}>
              📍 Filter by City
            </h3>
            <input
              type="text"
              placeholder="Enter city name..."
              value={filter.city}
              onChange={(e) => setFilter({ ...filter, city: e.target.value })}
              style={{
                width: "100%", padding: "10px 14px",
                borderRadius: "10px", border: "2px solid #f1f5f9",
                fontSize: "13px", outline: "none", transition: "border 0.2s",
              }}
              onFocus={e => e.target.style.border = "2px solid #6366f1"}
              onBlur={e => e.target.style.border = "2px solid #f1f5f9"}
            />
          </div>

          {/* Sort */}
          <div style={{background: "white", borderRadius: "16px", padding: "20px", marginBottom: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)"}}>
            <h3 style={{fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "12px"}}>
              📊 Sort By
            </h3>
            {SORTS.map((opt) => (
              <button key={opt.value}
                onClick={() => setFilter({ ...filter, sort: opt.value })}
                style={{
                  width: "100%", textAlign: "left",
                  padding: "10px 14px", borderRadius: "10px",
                  marginBottom: "4px", border: "none",
                  cursor: "pointer", fontSize: "13px", fontWeight: 600,
                  transition: "all 0.2s",
                  ...(filter.sort === opt.value
                    ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }
                    : { background: "#f8fafc", color: "#64748b" })
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Categories */}
          <div style={{background: "white", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)"}}>
            <h3 style={{fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "12px"}}>
              📂 Categories
            </h3>
            {CATEGORIES.map((cat) => (
              <button key={cat}
                onClick={() => setFilter({ ...filter, category: cat === "All" ? "" : cat })}
                style={{
                  width: "100%", textAlign: "left",
                  padding: "9px 14px", borderRadius: "10px",
                  marginBottom: "3px", border: "none",
                  cursor: "pointer", fontSize: "13px", fontWeight: 500,
                  transition: "all 0.2s",
                  ...((cat === "All" && !filter.category) || filter.category === cat
                    ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }
                    : { background: "transparent", color: "#64748b" })
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Feed */}
        <div style={{flex: 1}}>
          {/* Feed Header */}
          <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px"}}>
            <div>
              <h2 style={{fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 800, color: "#0f172a"}}>
                {filter.sort === "trending" ? "🔥 Trending Issues" :
                 filter.sort === "newest" ? "🆕 Latest Issues" :
                 filter.sort === "mostVoted" ? "👍 Most Voted" : "✊ Most Supported"}
              </h2>
              <p style={{color: "#64748b", fontSize: "13px", marginTop: "4px"}}>
                {pagination.total || 0} issues found
                {filter.category && ` in ${filter.category}`}
                {filter.city && ` near ${filter.city}`}
              </p>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{textAlign: "center", padding: "80px 0"}}>
              <div style={{width: "48px", height: "48px", border: "3px solid #e2e8f0", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px"}} />
              <p style={{color: "#94a3b8", fontWeight: 500}}>Loading issues...</p>
            </div>
          )}

          {/* Empty */}
          {!loading && issues.length === 0 && (
            <div style={{textAlign: "center", padding: "80px 40px", background: "white", borderRadius: "24px", border: "1px solid #e2e8f0"}}>
              <div style={{fontSize: "64px", marginBottom: "16px"}}>📭</div>
              <h3 style={{fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 700, color: "#0f172a", marginBottom: "8px"}}>
                No Issues Found
              </h3>
              <p style={{color: "#94a3b8", marginBottom: "24px", fontSize: "15px"}}>
                Be the first to raise a civic issue in your area!
              </p>
              <Link to="/create-issue" style={{
                display: "inline-block", padding: "14px 32px", borderRadius: "12px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "white", fontWeight: 700, textDecoration: "none",
                boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
              }}>
                ✏️ Post First Issue
              </Link>
            </div>
          )}

          {/* Issues Grid */}
          {!loading && issues.length > 0 && (
            <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px"}}>
              {issues.map((issue) => (
                <IssueCard key={issue._id} issue={issue} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;