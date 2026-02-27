import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { useState } from "react";

const categoryConfig = {
  Road: { gradient: "linear-gradient(135deg, #f97316, #ea580c)", emoji: "🛣️", light: "#fff7ed" },
  Water: { gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)", emoji: "💧", light: "#eff6ff" },
  Electricity: { gradient: "linear-gradient(135deg, #eab308, #ca8a04)", emoji: "⚡", light: "#fefce8" },
  Sanitation: { gradient: "linear-gradient(135deg, #22c55e, #16a34a)", emoji: "🧹", light: "#f0fdf4" },
  Crime: { gradient: "linear-gradient(135deg, #ef4444, #dc2626)", emoji: "🚨", light: "#fef2f2" },
  Education: { gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)", emoji: "📚", light: "#f5f3ff" },
  Health: { gradient: "linear-gradient(135deg, #ec4899, #db2777)", emoji: "🏥", light: "#fdf2f8" },
  Environment: { gradient: "linear-gradient(135deg, #14b8a6, #0d9488)", emoji: "🌿", light: "#f0fdfa" },
  Other: { gradient: "linear-gradient(135deg, #6b7280, #4b5563)", emoji: "📌", light: "#f9fafb" },
};

const IssueCard = ({ issue: initialIssue }) => {
  const config = categoryConfig[initialIssue.category] || categoryConfig.Other;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(initialIssue);
  const [userVote, setUserVote] = useState(null);
  const [supported, setSupported] = useState(false);

  const formatDate = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 60000);
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const handleVote = async (e, type) => {
    e.stopPropagation();
    if (!user) return toast.error("Please login to vote!");
    try {
      const res = await axiosInstance.post(`/votes/${issue._id}`, { type });
      setIssue(prev => ({ ...prev, voteCount: res.data.data.voteCount }));
      setUserVote(userVote === type ? null : type);
      toast.success(res.data.message);
    } catch { toast.error("Vote failed!"); }
  };

  const handleSupport = async (e) => {
    e.stopPropagation();
    if (!user) return toast.error("Please login to support!");
    try {
      if (supported) {
        const res = await axiosInstance.delete(`/petitions/${issue._id}`);
        setIssue(prev => ({ ...prev, supportCount: res.data.data.supportCount }));
        setSupported(false);
        toast.success("Support removed!");
      } else {
        const res = await axiosInstance.post(`/petitions/${issue._id}`);
        setIssue(prev => ({ ...prev, supportCount: res.data.data.supportCount }));
        setSupported(true);
        toast.success("Supported!");
      }
    } catch { toast.error("Action failed!"); }
  };

  return (
    <div
      onClick={() => navigate(`/issues/${issue._id}`)}
      className="card-hover"
      style={{
        background: "white", borderRadius: "20px",
        overflow: "hidden", border: "1px solid #e2e8f0",
        boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
        cursor: "pointer",
      }}
    >
      {/* Top gradient bar */}
      <div style={{background: config.gradient, height: "4px"}} />

      {/* Image */}
      {issue.image && (
        <div style={{overflow: "hidden", height: "180px"}}>
          <img src={issue.image} alt={issue.title}
            style={{width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s"}}
          />
        </div>
      )}

      <div style={{padding: "20px"}}>

        {/* Category + Status */}
        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px"}}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            padding: "4px 12px", borderRadius: "99px",
            background: config.light,
            border: "1px solid rgba(0,0,0,0.06)",
            fontSize: "12px", fontWeight: 700, color: "#374151",
          }}>
            {config.emoji} {issue.category}
          </span>
          <span style={{
            fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "99px",
            ...(issue.status === "resolved" ? { background: "#dcfce7", color: "#16a34a" } :
                issue.status === "flagged" ? { background: "#fee2e2", color: "#dc2626" } :
                { background: "#dbeafe", color: "#2563eb" })
          }}>
            {issue.status === "resolved" ? "✅ Resolved" :
             issue.status === "flagged" ? "🚩 Flagged" : "🔵 Open"}
          </span>
        </div>

        {/* Title */}
        <h2 className="line-clamp-2" style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "17px", fontWeight: 700,
          color: "#0f172a", lineHeight: "1.4",
          marginBottom: "8px",
        }}>
          {issue.title}
        </h2>

        {/* Description */}
        <p className="line-clamp-2" style={{
          fontSize: "13px", color: "#64748b",
          lineHeight: "1.6", marginBottom: "16px",
        }}>
          {issue.description}
        </p>

        {/* Author */}
        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px"}}>
          <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: config.gradient,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, color: "white", fontSize: "13px",
            }}>
              {issue.author?.name?.charAt(0)}
            </div>
            <div>
              <p style={{fontSize: "12px", fontWeight: 600, color: "#374151"}}>{issue.author?.name}</p>
              <p style={{fontSize: "11px", color: "#94a3b8"}}>📍 {issue.location?.city}</p>
            </div>
          </div>
          <span style={{fontSize: "11px", color: "#94a3b8"}}>{formatDate(issue.createdAt)}</span>
        </div>

        {/* Quick Action Buttons */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: "6px", paddingTop: "14px",
          borderTop: "1px solid #f1f5f9",
        }}>
          {/* Upvote */}
          <button onClick={(e) => handleVote(e, "up")} style={{
            padding: "8px 4px", borderRadius: "10px", border: "none",
            cursor: "pointer", fontSize: "12px", fontWeight: 700,
            transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
            ...(userVote === "up"
              ? { background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "white" }
              : { background: "#eff6ff", color: "#3b82f6" })
          }}>
            👍 {issue.voteCount}
          </button>

          {/* Downvote */}
          <button onClick={(e) => handleVote(e, "down")} style={{
            padding: "8px 4px", borderRadius: "10px", border: "none",
            cursor: "pointer", fontSize: "12px", fontWeight: 700,
            transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
            ...(userVote === "down"
              ? { background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "white" }
              : { background: "#fef2f2", color: "#ef4444" })
          }}>
            👎
          </button>

          {/* Support */}
          <button onClick={handleSupport} style={{
            padding: "8px 4px", borderRadius: "10px", border: "none",
            cursor: "pointer", fontSize: "12px", fontWeight: 700,
            transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
            ...(supported
              ? { background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "white" }
              : { background: "#f0fdf4", color: "#22c55e" })
          }}>
            ✊ {issue.supportCount}
          </button>

          {/* Comments */}
          <button onClick={(e) => { e.stopPropagation(); navigate(`/issues/${issue._id}#comments`); }} style={{
            padding: "8px 4px", borderRadius: "10px", border: "none",
            cursor: "pointer", fontSize: "12px", fontWeight: 700,
            background: "#f5f3ff", color: "#8b5cf6",
            transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
          }}>
            💬 {issue.commentCount}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;