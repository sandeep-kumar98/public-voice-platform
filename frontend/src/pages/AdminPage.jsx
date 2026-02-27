import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";

const COLORS = ["#6366f1", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#ec4899", "#64748b"];

const AdminPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchAnalytics(); fetchUsers(); }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axiosInstance.get("/admin/analytics");
      setAnalytics(res.data.data);
    } catch { toast.error("Failed to load analytics"); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get(`/admin/users?search=${search}`);
      setUsers(res.data.data.users);
    } catch { toast.error("Failed to load users"); }
  };

  const handleBanUser = async (userId, isBanned) => {
    try {
      await axiosInstance.put(`/admin/users/${userId}/ban`);
      toast.success(isBanned ? "User unbanned!" : "User banned!");
      fetchUsers();
    } catch { toast.error("Action failed!"); }
  };

  // Only flag — no delete/resolve from dashboard
  const handleFlagIssue = async (issueId, isFlagged) => {
    try {
      await axiosInstance.put(`/admin/issues/${issueId}/flag`);
      toast.success(isFlagged ? "Issue unflagged!" : "Issue flagged for review!");
      fetchAnalytics();
    } catch { toast.error("Action failed!"); }
  };

  if (loading) return (
    <div style={{minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center"}}>
      <div style={{textAlign: "center"}}>
        <div style={{width: "48px", height: "48px", border: "3px solid #e2e8f0", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px"}} />
        <p style={{color: "#94a3b8"}}>Loading dashboard...</p>
      </div>
    </div>
  );

  const categoryData = analytics?.categoryBreakdown?.map(c => ({ name: c._id, value: c.count })) || [];
  const statusData = [
    { name: "Open", value: analytics?.issues?.open || 0, color: "#3b82f6" },
    { name: "Resolved", value: analytics?.issues?.resolved || 0, color: "#22c55e" },
    { name: "Flagged", value: analytics?.issues?.flagged || 0, color: "#ef4444" },
  ];
  const weekData = [
    { name: "Last Week", users: Math.max(0, (analytics?.overview?.totalUsers || 0) - (analytics?.thisWeek?.newUsers || 0)), issues: Math.max(0, (analytics?.overview?.totalIssues || 0) - (analytics?.thisWeek?.newIssues || 0)) },
    { name: "This Week", users: analytics?.thisWeek?.newUsers || 0, issues: analytics?.thisWeek?.newIssues || 0 },
  ];

  const TABS = [
    { id: "overview", label: "📊 Overview" },
    { id: "analytics", label: "📈 Analytics" },
    { id: "users", label: "👥 Users" },
    { id: "issues", label: "📢 Issues" },
  ];

  return (
    <div style={{minHeight: "100vh", background: "#f8fafc"}}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
        padding: "40px 40px 80px", position: "relative", overflow: "hidden",
      }}>
        <div style={{position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)"}} />
        <div style={{maxWidth: "1400px", margin: "0 auto", position: "relative"}}>
          <div style={{display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "99px", padding: "6px 14px", marginBottom: "16px"}}>
            <span style={{color: "#a5b4fc", fontSize: "12px", fontWeight: 700, letterSpacing: "1px"}}>⚡ ADMIN PANEL</span>
          </div>
          <h1 style={{fontFamily: "'Playfair Display', serif", fontSize: "40px", fontWeight: 900, color: "white", marginBottom: "8px"}}>
            Dashboard
          </h1>
          <p style={{color: "#94a3b8", fontSize: "15px"}}>
            Monitor platform health, manage users, and review flagged content.
          </p>
        </div>
      </div>

      <div style={{maxWidth: "1400px", margin: "-48px auto 0", padding: "0 40px 60px", position: "relative"}}>

        {/* Quick Stats Row */}
        <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px"}}>
          {[
            { label: "Total Users", value: analytics?.overview?.totalUsers, emoji: "👥", color: "#6366f1", bg: "#ede9fe", trend: `+${analytics?.thisWeek?.newUsers} this week` },
            { label: "Total Issues", value: analytics?.overview?.totalIssues, emoji: "📢", color: "#3b82f6", bg: "#dbeafe", trend: `+${analytics?.thisWeek?.newIssues} this week` },
            { label: "Total Votes", value: analytics?.overview?.totalVotes, emoji: "👍", color: "#22c55e", bg: "#dcfce7", trend: "All time" },
            { label: "Banned Users", value: analytics?.overview?.bannedUsers, emoji: "🚫", color: "#ef4444", bg: "#fee2e2", trend: "Requires attention" },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: "white", borderRadius: "20px",
              padding: "24px", border: "1px solid #e2e8f0",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            }}>
              <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px"}}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "12px",
                  background: stat.bg, display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: "22px",
                }}>
                  {stat.emoji}
                </div>
                <span style={{fontSize: "11px", color: "#94a3b8", fontWeight: 500}}>{stat.trend}</span>
              </div>
              <div style={{fontSize: "32px", fontWeight: 800, color: stat.color, lineHeight: 1}}>{stat.value}</div>
              <div style={{fontSize: "13px", color: "#64748b", fontWeight: 500, marginTop: "4px"}}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display: "flex", gap: "4px", background: "white", padding: "6px", borderRadius: "16px", border: "1px solid #e2e8f0", marginBottom: "24px", width: "fit-content"}}>
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: "10px 24px", borderRadius: "12px", border: "none",
              fontSize: "13px", fontWeight: 700, cursor: "pointer",
              transition: "all 0.2s",
              ...(activeTab === tab.id
                ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }
                : { background: "transparent", color: "#64748b" })
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px"}}>

            {/* Issue Status Pie Chart */}
            <div style={{background: "white", borderRadius: "20px", padding: "28px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.06)"}}>
              <h3 style={{fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 700, color: "#0f172a", marginBottom: "8px"}}>
                Issue Status Distribution
              </h3>
              <p style={{color: "#94a3b8", fontSize: "13px", marginBottom: "24px"}}>Breakdown of all platform issues</p>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Weekly Growth Bar Chart */}
            <div style={{background: "white", borderRadius: "20px", padding: "28px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.06)"}}>
              <h3 style={{fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 700, color: "#0f172a", marginBottom: "8px"}}>
                Weekly Growth
              </h3>
              <p style={{color: "#94a3b8", fontSize: "13px", marginBottom: "24px"}}>New users and issues this week</p>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weekData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{fontSize: 12, fill: "#94a3b8"}} />
                  <YAxis tick={{fontSize: 12, fill: "#94a3b8"}} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users" name="Users" fill="#6366f1" radius={[6,6,0,0]} />
                  <Bar dataKey="issues" name="Issues" fill="#3b82f6" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Bar Chart */}
            <div style={{background: "white", borderRadius: "20px", padding: "28px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", gridColumn: "1 / -1"}}>
              <h3 style={{fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 700, color: "#0f172a", marginBottom: "8px"}}>
                Issues by Category
              </h3>
              <p style={{color: "#94a3b8", fontSize: "13px", marginBottom: "24px"}}>Distribution of issues across all categories</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryData} barSize={48}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{fontSize: 12, fill: "#94a3b8"}} />
                  <YAxis tick={{fontSize: 12, fill: "#94a3b8"}} />
                  <Tooltip />
                  <Bar dataKey="value" name="Issues" radius={[8,8,0,0]}>
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {activeTab === "analytics" && (
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px"}}>
            {[
              { label: "Open Issues", value: analytics?.issues?.open, color: "#3b82f6", bg: "#dbeafe", emoji: "🔵" },
              { label: "Resolved Issues", value: analytics?.issues?.resolved, color: "#22c55e", bg: "#dcfce7", emoji: "✅" },
              { label: "Flagged Issues", value: analytics?.issues?.flagged, color: "#ef4444", bg: "#fee2e2", emoji: "🚩" },
              { label: "New Users (Week)", value: analytics?.thisWeek?.newUsers, color: "#6366f1", bg: "#ede9fe", emoji: "👥" },
              { label: "New Issues (Week)", value: analytics?.thisWeek?.newIssues, color: "#f59e0b", bg: "#fef3c7", emoji: "📢" },
              { label: "Total Comments", value: analytics?.overview?.totalComments, color: "#8b5cf6", bg: "#f5f3ff", emoji: "💬" },
              { label: "Total Supporters", value: analytics?.overview?.totalPetitions, color: "#14b8a6", bg: "#ccfbf1", emoji: "✊" },
              { label: "Total Votes", value: analytics?.overview?.totalVotes, color: "#22c55e", bg: "#dcfce7", emoji: "👍" },
              { label: "Banned Users", value: analytics?.overview?.bannedUsers, color: "#ef4444", bg: "#fee2e2", emoji: "🚫" },
            ].map((s) => (
              <div key={s.label} style={{
                background: "white", borderRadius: "20px", padding: "24px",
                border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                display: "flex", alignItems: "center", gap: "16px",
              }}>
                <div style={{
                  width: "56px", height: "56px", borderRadius: "16px",
                  background: s.bg, display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: "28px", flexShrink: 0,
                }}>
                  {s.emoji}
                </div>
                <div>
                  <div style={{fontSize: "28px", fontWeight: 800, color: s.color, lineHeight: 1}}>{s.value}</div>
                  <div style={{fontSize: "13px", color: "#64748b", marginTop: "4px", fontWeight: 500}}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === "users" && (
          <div style={{background: "white", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", overflow: "hidden"}}>
            <div style={{padding: "24px 28px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between"}}>
              <h3 style={{fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700, color: "#0f172a"}}>
                User Management
              </h3>
              <div style={{display: "flex", gap: "10px"}}>
                <input
                  type="text" placeholder="Search users..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    padding: "10px 16px", borderRadius: "10px",
                    border: "2px solid #e2e8f0", fontSize: "13px",
                    outline: "none", width: "220px",
                  }}
                  onFocus={e => e.target.style.border = "2px solid #6366f1"}
                  onBlur={e => e.target.style.border = "2px solid #e2e8f0"}
                />
                <button onClick={fetchUsers} style={{
                  padding: "10px 20px", borderRadius: "10px", border: "none",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "white", fontWeight: 700, fontSize: "13px", cursor: "pointer",
                }}>
                  Search
                </button>
              </div>
            </div>

            <div>
              {users.map((u, i) => (
                <div key={u._id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "16px 28px",
                  borderBottom: i < users.length - 1 ? "1px solid #f8fafc" : "none",
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{display: "flex", alignItems: "center", gap: "14px"}}>
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "12px", flexShrink: 0,
                      background: u.role === "admin" ? "linear-gradient(135deg, #8b5cf6, #6366f1)" : "linear-gradient(135deg, #3b82f6, #6366f1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, color: "white", fontSize: "18px",
                    }}>
                      {u.name?.charAt(0)}
                    </div>
                    <div>
                      <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
                        <span style={{fontWeight: 700, color: "#0f172a", fontSize: "14px"}}>{u.name}</span>
                        <span style={{
                          fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "99px",
                          ...(u.role === "admin" ? { background: "#ede9fe", color: "#7c3aed" } : { background: "#dbeafe", color: "#2563eb" })
                        }}>
                          {u.role === "admin" ? "👑 Admin" : "👤 User"}
                        </span>
                        {u.isBanned && (
                          <span style={{fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "99px", background: "#fee2e2", color: "#dc2626"}}>
                            🚫 Banned
                          </span>
                        )}
                      </div>
                      <div style={{fontSize: "12px", color: "#94a3b8", marginTop: "2px"}}>
                        {u.email} · {u.issueCount} issues · 📍 {u.location?.city}
                      </div>
                    </div>
                  </div>

                  {u.role !== "admin" && (
                    <button onClick={() => handleBanUser(u._id, u.isBanned)} style={{
                      padding: "8px 18px", borderRadius: "10px", border: "none",
                      cursor: "pointer", fontWeight: 700, fontSize: "12px",
                      transition: "all 0.2s",
                      ...(u.isBanned
                        ? { background: "#dcfce7", color: "#16a34a" }
                        : { background: "#fee2e2", color: "#dc2626" })
                    }}>
                      {u.isBanned ? "✅ Unban User" : "🚫 Ban User"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ISSUES TAB ── */}
        {activeTab === "issues" && (
          <div style={{background: "white", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", overflow: "hidden"}}>
            <div style={{padding: "24px 28px", borderBottom: "1px solid #f1f5f9"}}>
              <h3 style={{fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700, color: "#0f172a"}}>
                Content Moderation
              </h3>
              <p style={{color: "#94a3b8", fontSize: "13px", marginTop: "4px"}}>
                Review and flag suspicious issues. Deletion and resolution is handled by issue owners.
              </p>
            </div>

            <div>
              {analytics?.trendingIssues?.map((issue, i) => (
                <div key={issue._id} style={{
                  display: "flex", alignItems: "center", gap: "16px",
                  padding: "16px 28px",
                  borderBottom: i < analytics.trendingIssues.length - 1 ? "1px solid #f8fafc" : "none",
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{
                    width: "32px", height: "32px", borderRadius: "8px",
                    background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, color: "#94a3b8", fontSize: "13px", flexShrink: 0,
                  }}>
                    #{i + 1}
                  </span>

                  <div style={{flex: 1, minWidth: 0}}>
                    <p style={{fontWeight: 700, color: "#0f172a", fontSize: "14px", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                      {issue.title}
                    </p>
                    <p style={{fontSize: "12px", color: "#94a3b8"}}>
                      📍 {issue.location?.city} · {issue.category}
                    </p>
                  </div>

                  <div style={{display: "flex", gap: "12px", fontSize: "12px", color: "#64748b"}}>
                    <span>👍 {issue.voteCount}</span>
                    <span>✊ {issue.supportCount}</span>
                    <span>💬 {issue.commentCount}</span>
                  </div>

                  <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
                    <span style={{
                      fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "99px",
                      ...(issue.status === "resolved" ? { background: "#dcfce7", color: "#16a34a" } :
                          issue.status === "flagged" ? { background: "#fee2e2", color: "#dc2626" } :
                          { background: "#dbeafe", color: "#2563eb" })
                    }}>
                      {issue.status === "resolved" ? "✅ Resolved" : issue.status === "flagged" ? "🚩 Flagged" : "🔵 Open"}
                    </span>

                    {/* Only flag option for admin - no delete/resolve */}
                    <button onClick={() => handleFlagIssue(issue._id, issue.isFlagged)} style={{
                      padding: "6px 14px", borderRadius: "8px", border: "none",
                      cursor: "pointer", fontWeight: 700, fontSize: "11px",
                      background: issue.isFlagged ? "#fef3c7" : "#fee2e2",
                      color: issue.isFlagged ? "#d97706" : "#dc2626",
                      transition: "all 0.2s",
                    }}>
                      {issue.isFlagged ? "🏳️ Unflag" : "🚩 Flag"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;