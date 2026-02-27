import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

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

const IssueDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [userVote, setUserVote] = useState(null);
  const [supported, setSupported] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    fetchIssue();
    fetchComments();
    if (user) { fetchUserVote(); fetchSupportStatus(); }
  }, [id]);

  const fetchIssue = async () => {
    try {
      const res = await axiosInstance.get(`/issues/${id}`);
      setIssue(res.data.data.issue);
    } catch { toast.error("Issue not found"); navigate("/"); }
    finally { setLoading(false); }
  };

  const fetchComments = async () => {
    try {
      const res = await axiosInstance.get(`/comments/${id}`);
      setComments(res.data.data.comments);
    } catch {}
  };

  const fetchUserVote = async () => {
    try {
      const res = await axiosInstance.get(`/votes/${id}`);
      setUserVote(res.data.data.vote);
    } catch {}
  };

  const fetchSupportStatus = async () => {
    try {
      const res = await axiosInstance.get(`/petitions/${id}`);
      setSupported(res.data.data.supported);
    } catch {}
  };

  const handleVote = async (type) => {
    if (!user) return toast.error("Please login to vote!");
    try {
      const res = await axiosInstance.post(`/votes/${id}`, { type });
      setIssue(prev => ({ ...prev, voteCount: res.data.data.voteCount }));
      setUserVote(userVote === type ? null : type);
      toast.success(res.data.message);
    } catch { toast.error("Vote failed!"); }
  };

  const handleSupport = async () => {
    if (!user) return toast.error("Please login to support!");
    try {
      if (supported) {
        const res = await axiosInstance.delete(`/petitions/${id}`);
        setIssue(prev => ({ ...prev, supportCount: res.data.data.supportCount }));
        setSupported(false);
        toast.success("Support removed!");
      } else {
        const res = await axiosInstance.post(`/petitions/${id}`);
        setIssue(prev => ({ ...prev, supportCount: res.data.data.supportCount }));
        setSupported(true);
        toast.success("Issue supported!");
      }
    } catch { toast.error("Action failed!"); }
  };

  const handleResolve = async () => {
    if (!window.confirm("Mark this issue as resolved? This cannot be undone.")) return;
    try {
      await axiosInstance.put(`/admin/issues/${id}/resolve`);
      setIssue(prev => ({ ...prev, status: "resolved" }));
      toast.success("🎉 Issue marked as resolved!");
    } catch { toast.error("Failed to resolve!"); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;
    try {
      await axiosInstance.delete(`/issues/${id}`);
      toast.success("Issue deleted!");
      navigate("/");
    } catch { toast.error("Failed to delete!"); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Please login to comment!");
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      await axiosInstance.post(`/comments/${id}`, { content: newComment });
      setNewComment("");
      fetchComments();
      setIssue(prev => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
      toast.success("Comment added!");
    } catch { toast.error("Failed to add comment!"); }
    finally { setCommentLoading(false); }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await axiosInstance.delete(`/comments/${commentId}`);
      fetchComments();
      setIssue(prev => ({ ...prev, commentCount: Math.max(0, (prev.commentCount || 1) - 1) }));
      toast.success("Comment deleted!");
    } catch { toast.error("Failed!"); }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  const formatTime = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 60000);
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  if (loading) return (
    <div style={{minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center"}}>
      <div style={{textAlign: "center"}}>
        <div style={{width: "48px", height: "48px", border: "3px solid #e2e8f0", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px"}} />
        <p style={{color: "#94a3b8", fontWeight: 500}}>Loading issue...</p>
      </div>
    </div>
  );

  if (!issue) return null;

  const config = categoryConfig[issue.category] || categoryConfig.Other;
  const isOwner = user?._id === issue.author?._id;
  const isAdmin = user?.role === "admin";

  return (
    <div style={{minHeight: "100vh", background: "#f8fafc"}}>

      {/* Hero Header */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
        padding: "48px 32px 100px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{position: "absolute", top: "-100px", right: "-100px", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)"}} />
        <div style={{position: "absolute", bottom: "-60px", left: "5%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)"}} />

        <div style={{maxWidth: "860px", margin: "0 auto", position: "relative"}}>

          {/* Breadcrumb */}
          <div style={{display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px"}}>
            <Link to="/" style={{color: "#64748b", fontSize: "13px", textDecoration: "none", transition: "color 0.2s"}}
              onMouseEnter={e => e.target.style.color = "#94a3b8"}
              onMouseLeave={e => e.target.style.color = "#64748b"}
            >
              Home
            </Link>
            <span style={{color: "#334155", fontSize: "13px"}}>›</span>
            <Link to="/" style={{color: "#64748b", fontSize: "13px", textDecoration: "none"}}>
              {issue.category}
            </Link>
            <span style={{color: "#334155", fontSize: "13px"}}>›</span>
            <span style={{color: "#94a3b8", fontSize: "13px"}}>Issue Detail</span>
          </div>

          {/* Badges */}
          <div style={{display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "20px"}}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
              color: "white", padding: "6px 14px", borderRadius: "99px",
              fontSize: "12px", fontWeight: 700,
            }}>
              {config.emoji} {issue.category}
            </span>

            <span style={{
              fontSize: "12px", fontWeight: 700, padding: "6px 14px", borderRadius: "99px",
              ...(issue.status === "resolved"
                ? { background: "rgba(34,197,94,0.2)", color: "#86efac", border: "1px solid rgba(34,197,94,0.3)" }
                : issue.status === "flagged"
                ? { background: "rgba(239,68,68,0.2)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" }
                : { background: "rgba(59,130,246,0.2)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.3)" })
            }}>
              {issue.status === "resolved" ? "✅ Resolved" : issue.status === "flagged" ? "🚩 Flagged" : "🔵 Open"}
            </span>

            {issue.sentiment === "urgent" && (
              <span style={{
                background: "rgba(249,115,22,0.2)", color: "#fdba74",
                border: "1px solid rgba(249,115,22,0.3)",
                padding: "6px 14px", borderRadius: "99px",
                fontSize: "12px", fontWeight: 700,
              }}>
                🚨 AI Detected: Urgent
              </span>
            )}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(24px, 4vw, 42px)",
            fontWeight: 900, color: "white",
            lineHeight: 1.15, marginBottom: "20px",
          }}>
            {issue.title}
          </h1>

          {/* Author Row */}
          <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px"}}>
            <Link to={`/profile/${issue.author?._id}`} style={{
              display: "flex", alignItems: "center", gap: "10px",
              textDecoration: "none",
            }}>
              <div style={{
                width: "42px", height: "42px", borderRadius: "12px",
                background: config.gradient,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, color: "white", fontSize: "18px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              }}>
                {issue.author?.name?.charAt(0)}
              </div>
              <div>
                <p style={{color: "white", fontWeight: 700, fontSize: "14px", marginBottom: "2px"}}>
                  {issue.author?.name}
                </p>
                <p style={{color: "#64748b", fontSize: "12px"}}>
                  📍 {issue.location?.city}, {issue.location?.state} · {formatDate(issue.createdAt)}
                </p>
              </div>
            </Link>

            {/* Owner Actions */}
            {(isOwner || isAdmin) && (
              <div style={{display: "flex", gap: "8px"}}>
                {isOwner && issue.status !== "resolved" && (
                  <button onClick={handleResolve} style={{
                    padding: "8px 16px", borderRadius: "10px", border: "none",
                    background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)",
                    color: "#86efac", fontSize: "12px", fontWeight: 700,
                    cursor: "pointer", transition: "all 0.2s",
                  }}>
                    ✅ Mark Resolved
                  </button>
                )}
                {(isOwner || isAdmin) && (
                  <button onClick={handleDelete} style={{
                    padding: "8px 16px", borderRadius: "10px",
                    background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
                    color: "#fca5a5", fontSize: "12px", fontWeight: 700,
                    cursor: "pointer", transition: "all 0.2s",
                  }}>
                    🗑️ Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{maxWidth: "860px", margin: "-48px auto 0", padding: "0 32px 60px", position: "relative"}}>

        {/* Issue Body Card */}
        <div style={{
          background: "white", borderRadius: "24px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
          overflow: "hidden", marginBottom: "20px",
        }}>
          {/* Top color bar */}
          <div style={{height: "4px", background: config.gradient}} />

          {/* Image */}
          {issue.image && (
            <div style={{overflow: "hidden", maxHeight: "420px"}}>
              <img src={issue.image} alt={issue.title}
                style={{width: "100%", objectFit: "cover"}}
              />
            </div>
          )}

          <div style={{padding: "32px"}}>
            {/* Description */}
            <p style={{
              color: "#374151", fontSize: "16px",
              lineHeight: 1.8, marginBottom: "24px",
            }}>
              {issue.description}
            </p>

            {/* Tags */}
            {issue.tags?.length > 0 && (
              <div style={{display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "28px"}}>
                {issue.tags.map((tag) => (
                  <span key={tag} style={{
                    background: "#f1f5f9", color: "#64748b",
                    padding: "5px 14px", borderRadius: "99px",
                    fontSize: "12px", fontWeight: 600, border: "1px solid #e2e8f0",
                  }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Engagement Stats */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px", marginBottom: "24px",
            }}>
              {[
                { emoji: "👍", value: issue.voteCount, label: "Community Votes", color: "#3b82f6", bg: "#eff6ff" },
                { emoji: "✊", value: issue.supportCount, label: "Supporters", color: "#22c55e", bg: "#f0fdf4" },
                { emoji: "💬", value: issue.commentCount, label: "Comments", color: "#8b5cf6", bg: "#f5f3ff" },
              ].map((stat) => (
                <div key={stat.label} style={{
                  background: stat.bg, borderRadius: "16px",
                  padding: "20px", textAlign: "center",
                  border: `1px solid ${stat.bg}`,
                }}>
                  <div style={{fontSize: "28px", marginBottom: "4px"}}>{stat.emoji}</div>
                  <div style={{fontSize: "28px", fontWeight: 800, color: stat.color, lineHeight: 1}}>{stat.value}</div>
                  <div style={{fontSize: "12px", color: "#94a3b8", marginTop: "4px", fontWeight: 500}}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{
              display: "flex", gap: "10px", flexWrap: "wrap",
              paddingTop: "20px", borderTop: "1px solid #f1f5f9",
            }}>
              {/* Upvote */}
              <button onClick={() => handleVote("up")} style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "13px 24px", borderRadius: "12px", border: "none",
                cursor: "pointer", fontWeight: 700, fontSize: "14px",
                transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif",
                ...(userVote === "up"
                  ? { background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "white", boxShadow: "0 4px 16px rgba(59,130,246,0.4)" }
                  : { background: "#eff6ff", color: "#3b82f6" })
              }}>
                👍 Upvote {userVote === "up" && "· Active"}
              </button>

              {/* Downvote */}
              <button onClick={() => handleVote("down")} style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "13px 20px", borderRadius: "12px", border: "none",
                cursor: "pointer", fontWeight: 700, fontSize: "14px",
                transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif",
                ...(userVote === "down"
                  ? { background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "white", boxShadow: "0 4px 16px rgba(239,68,68,0.4)" }
                  : { background: "#fef2f2", color: "#ef4444" })
              }}>
                👎 Downvote
              </button>

              {/* Support Petition */}
              <button onClick={handleSupport} style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "13px 24px", borderRadius: "12px", border: "none",
                cursor: "pointer", fontWeight: 700, fontSize: "14px",
                transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif",
                ...(supported
                  ? { background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "white", boxShadow: "0 4px 16px rgba(34,197,94,0.4)" }
                  : { background: "#f0fdf4", color: "#22c55e" })
              }}>
                ✊ {supported ? "✓ Supported" : "Sign Petition"} · {issue.supportCount}
              </button>

              {/* Share */}
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }} style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "13px 20px", borderRadius: "12px",
                border: "2px solid #e2e8f0",
                background: "white", color: "#64748b",
                cursor: "pointer", fontWeight: 700, fontSize: "14px",
                transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif",
                marginLeft: "auto",
              }}>
                🔗 Share
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div style={{
          background: "white", borderRadius: "24px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}>
          {/* Comments Header */}
          <div style={{
            padding: "24px 32px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "22px", fontWeight: 800, color: "#0f172a",
            }}>
              💬 Discussion ({comments.length})
            </h2>
            <span style={{
              background: "#f1f5f9", color: "#64748b",
              padding: "4px 12px", borderRadius: "99px",
              fontSize: "12px", fontWeight: 600,
            }}>
              {comments.length} {comments.length === 1 ? "comment" : "comments"}
            </span>
          </div>

          <div style={{padding: "28px 32px"}}>

            {/* Add Comment Box */}
            {user ? (
              <div style={{
                background: "#f8fafc", borderRadius: "16px",
                padding: "20px", marginBottom: "28px",
                border: "1px solid #e2e8f0",
              }}>
                <div style={{display: "flex", gap: "12px", alignItems: "flex-start"}}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0,
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, color: "white", fontSize: "16px",
                  }}>
                    {user.name?.charAt(0)}
                  </div>
                  <div style={{flex: 1}}>
                    <p style={{fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "8px"}}>
                      {user.name}
                    </p>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts, experiences, or suggestions about this issue..."
                      rows={3}
                      style={{
                        width: "100%", padding: "12px 16px",
                        borderRadius: "12px", border: "2px solid #e2e8f0",
                        fontSize: "14px", resize: "none", outline: "none",
                        fontFamily: "'DM Sans', sans-serif",
                        lineHeight: 1.6, background: "white",
                        transition: "border 0.2s", color: "#0f172a",
                      }}
                      onFocus={e => e.target.style.border = "2px solid #6366f1"}
                      onBlur={e => e.target.style.border = "2px solid #e2e8f0"}
                    />
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px"}}>
                      <span style={{fontSize: "11px", color: "#94a3b8"}}>
                        {newComment.length}/500 characters
                      </span>
                      <button
                        type="button"
                        onClick={handleComment}
                        disabled={commentLoading || !newComment.trim()}
                        style={{
                          padding: "10px 24px", borderRadius: "10px", border: "none",
                          background: commentLoading || !newComment.trim()
                            ? "#e2e8f0"
                            : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                          color: commentLoading || !newComment.trim() ? "#94a3b8" : "white",
                          fontWeight: 700, fontSize: "13px",
                          cursor: commentLoading || !newComment.trim() ? "not-allowed" : "pointer",
                          transition: "all 0.2s",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {commentLoading ? "Posting..." : "Post Comment →"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
                borderRadius: "16px", padding: "28px",
                textAlign: "center", marginBottom: "28px",
                border: "2px dashed #e2e8f0",
              }}>
                <div style={{fontSize: "32px", marginBottom: "8px"}}>💬</div>
                <p style={{color: "#374151", fontWeight: 600, marginBottom: "4px"}}>
                  Join the discussion
                </p>
                <p style={{color: "#94a3b8", fontSize: "13px", marginBottom: "16px"}}>
                  Sign in to share your thoughts on this issue
                </p>
                <Link to="/login" style={{
                  display: "inline-block", padding: "10px 28px",
                  borderRadius: "10px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "white", fontWeight: 700, fontSize: "13px",
                  textDecoration: "none", boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                }}>
                  Sign In →
                </Link>
              </div>
            )}

            {/* Comments List */}
            {comments.length === 0 ? (
              <div style={{textAlign: "center", padding: "48px 20px"}}>
                <div style={{fontSize: "56px", marginBottom: "12px"}}>💭</div>
                <h3 style={{fontFamily: "'Playfair Display', serif", fontSize: "20px", color: "#0f172a", marginBottom: "6px"}}>
                  No comments yet
                </h3>
                <p style={{color: "#94a3b8", fontSize: "14px"}}>
                  Be the first to share your thoughts!
                </p>
              </div>
            ) : (
              <div style={{display: "flex", flexDirection: "column", gap: "0"}}>
                {comments.map((comment, i) => (
                  <div key={comment._id} style={{
                    padding: "20px 0",
                    borderBottom: i < comments.length - 1 ? "1px solid #f8fafc" : "none",
                  }}>
                    <div style={{display: "flex", gap: "12px"}}>
                      <div style={{
                        width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0,
                        background: "linear-gradient(135deg, #e0e7ff, #c7d2fe)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, color: "#6366f1", fontSize: "15px",
                      }}>
                        {comment.author?.name?.charAt(0)}
                      </div>
                      <div style={{flex: 1}}>
                        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px"}}>
                          <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
                            <span style={{fontWeight: 700, color: "#0f172a", fontSize: "14px"}}>
                              {comment.author?.name}
                            </span>
                            <span style={{
                              fontSize: "11px", color: "#94a3b8",
                              background: "#f8fafc", padding: "2px 8px",
                              borderRadius: "99px", border: "1px solid #e2e8f0",
                            }}>
                              {formatTime(comment.createdAt)}
                            </span>
                          </div>
                          {(user?._id === comment.author?._id || isAdmin) && (
                            <button onClick={() => handleDeleteComment(comment._id)} style={{
                              background: "none", border: "none",
                              color: "#fca5a5", fontSize: "12px",
                              cursor: "pointer", fontWeight: 600, padding: "4px 8px",
                              borderRadius: "6px", transition: "all 0.2s",
                            }}
                            onMouseEnter={e => e.target.style.background = "#fee2e2"}
                            onMouseLeave={e => e.target.style.background = "transparent"}
                            >
                              🗑️ Delete
                            </button>
                          )}
                        </div>
                        <p style={{color: "#374151", fontSize: "14px", lineHeight: 1.7}}>
                          {comment.content}
                        </p>

                        {/* Replies */}
                        {comment.replies?.length > 0 && (
                          <div style={{
                            marginTop: "12px", paddingLeft: "16px",
                            borderLeft: "3px solid #e0e7ff",
                          }}>
                            {comment.replies.map((reply) => (
                              <div key={reply._id} style={{
                                background: "#f8fafc", borderRadius: "12px",
                                padding: "12px 16px", marginBottom: "8px",
                              }}>
                                <div style={{display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px"}}>
                                  <div style={{
                                    width: "24px", height: "24px", borderRadius: "6px",
                                    background: "#e0e7ff", display: "flex",
                                    alignItems: "center", justifyContent: "center",
                                    fontWeight: 700, color: "#6366f1", fontSize: "11px",
                                  }}>
                                    {reply.author?.name?.charAt(0)}
                                  </div>
                                  <span style={{fontWeight: 700, color: "#374151", fontSize: "13px"}}>
                                    {reply.author?.name}
                                  </span>
                                  <span style={{fontSize: "11px", color: "#94a3b8"}}>
                                    {formatTime(reply.createdAt)}
                                  </span>
                                </div>
                                <p style={{color: "#64748b", fontSize: "13px", lineHeight: 1.6}}>
                                  {reply.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailPage;