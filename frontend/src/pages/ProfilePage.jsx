import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import IssueCard from "../components/issues/IssueCard";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [activeTab, setActiveTab] = useState("issues");

  useEffect(() => { fetchProfile(); }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get(`/users/${id}`);
      setProfile(res.data.data.user);
      setIssues(res.data.data.issues);
      setEditData({
        name: res.data.data.user.name,
        bio: res.data.data.user.bio || "",
        city: res.data.data.user.location?.city || "",
        state: res.data.data.user.location?.state || "",
      });
    } catch { toast.error("Profile not found"); }
    finally { setLoading(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.put("/users/profile", editData);
      setProfile(res.data.data.user);
      setEditing(false);
      toast.success("Profile updated!");
    } catch { toast.error("Update failed!"); }
  };

  if (loading) return (
    <div style={{minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center"}}>
      <div style={{width: "48px", height: "48px", border: "3px solid #e2e8f0", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite"}} />
    </div>
  );

  if (!profile) return null;
  const isOwnProfile = currentUser?._id === id;

  const inputStyle = {
    width: "100%", padding: "12px 16px",
    borderRadius: "10px", border: "2px solid #e2e8f0",
    fontSize: "14px", outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    transition: "border 0.2s", color: "#0f172a",
  };

  return (
    <div style={{minHeight: "100vh", background: "#f8fafc"}}>

      {/* Hero Banner */}
      <div style={{
        height: "200px",
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{position: "absolute", top: "-80px", right: "-80px", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)"}} />
        <div style={{position: "absolute", bottom: "-40px", left: "10%", width: "200px", height: "200px", background: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)"}} />
      </div>

      <div style={{maxWidth: "1000px", margin: "0 auto", padding: "0 32px 60px"}}>

        {/* Profile Card */}
        <div style={{
          background: "white", borderRadius: "24px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
          padding: "32px", marginTop: "-60px",
          position: "relative", marginBottom: "28px",
        }}>
          {editing ? (
            <form onSubmit={handleUpdate}>
              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px"}}>
                <div>
                  <label style={{fontSize: "12px", fontWeight: 700, color: "#374151", letterSpacing: "0.5px", display: "block", marginBottom: "6px"}}>FULL NAME</label>
                  <input style={inputStyle} value={editData.name}
                    onChange={e => setEditData({...editData, name: e.target.value})}
                    onFocus={e => e.target.style.border = "2px solid #6366f1"}
                    onBlur={e => e.target.style.border = "2px solid #e2e8f0"}
                  />
                </div>
                <div>
                  <label style={{fontSize: "12px", fontWeight: 700, color: "#374151", letterSpacing: "0.5px", display: "block", marginBottom: "6px"}}>BIO</label>
                  <input style={inputStyle} value={editData.bio} placeholder="Tell us about yourself..."
                    onChange={e => setEditData({...editData, bio: e.target.value})}
                    onFocus={e => e.target.style.border = "2px solid #6366f1"}
                    onBlur={e => e.target.style.border = "2px solid #e2e8f0"}
                  />
                </div>
                <div>
                  <label style={{fontSize: "12px", fontWeight: 700, color: "#374151", letterSpacing: "0.5px", display: "block", marginBottom: "6px"}}>CITY</label>
                  <input style={inputStyle} value={editData.city}
                    onChange={e => setEditData({...editData, city: e.target.value})}
                    onFocus={e => e.target.style.border = "2px solid #6366f1"}
                    onBlur={e => e.target.style.border = "2px solid #e2e8f0"}
                  />
                </div>
                <div>
                  <label style={{fontSize: "12px", fontWeight: 700, color: "#374151", letterSpacing: "0.5px", display: "block", marginBottom: "6px"}}>STATE</label>
                  <input style={inputStyle} value={editData.state}
                    onChange={e => setEditData({...editData, state: e.target.value})}
                    onFocus={e => e.target.style.border = "2px solid #6366f1"}
                    onBlur={e => e.target.style.border = "2px solid #e2e8f0"}
                  />
                </div>
              </div>
              <div style={{display: "flex", gap: "12px"}}>
                <button type="submit" style={{
                  padding: "12px 28px", borderRadius: "10px", border: "none",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "white", fontWeight: 700, fontSize: "14px", cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                }}>
                  Save Changes →
                </button>
                <button type="button" onClick={() => setEditing(false)} style={{
                  padding: "12px 24px", borderRadius: "10px",
                  border: "2px solid #e2e8f0", background: "white",
                  fontWeight: 700, fontSize: "14px", cursor: "pointer", color: "#64748b",
                }}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div style={{display: "flex", alignItems: "flex-start", gap: "24px"}}>

              {/* Avatar */}
              <div style={{
                width: "96px", height: "96px", borderRadius: "24px", flexShrink: 0,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Playfair Display', serif",
                fontSize: "40px", fontWeight: 900, color: "white",
                boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
                border: "4px solid white",
                marginTop: "-16px",
              }}>
                {profile.name?.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div style={{flex: 1}}>
                <div style={{display: "flex", alignItems: "flex-start", justifyContent: "space-between"}}>
                  <div>
                    <h1 style={{fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 900, color: "#0f172a", marginBottom: "4px"}}>
                      {profile.name}
                    </h1>
                    <p style={{color: "#64748b", fontSize: "14px", marginBottom: "8px"}}>
                      {profile.bio || "No bio yet — add one to tell your story!"}
                    </p>
                    <div style={{display: "flex", alignItems: "center", gap: "16px"}}>
                      <span style={{color: "#94a3b8", fontSize: "13px"}}>
                        📍 {profile.location?.city}, {profile.location?.state}
                      </span>
                      <span style={{
                        background: profile.role === "admin" ? "#ede9fe" : "#dbeafe",
                        color: profile.role === "admin" ? "#7c3aed" : "#2563eb",
                        padding: "3px 10px", borderRadius: "99px",
                        fontSize: "11px", fontWeight: 700,
                      }}>
                        {profile.role === "admin" ? "👑 Admin" : "👤 User"}
                      </span>
                    </div>
                  </div>

                  {isOwnProfile && (
                    <button onClick={() => setEditing(true)} style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      padding: "10px 20px", borderRadius: "10px",
                      border: "2px solid #e2e8f0", background: "white",
                      fontWeight: 700, fontSize: "13px", cursor: "pointer",
                      color: "#374151", transition: "all 0.2s",
                    }}>
                      ✏️ Edit Profile
                    </button>
                  )}
                </div>

                {/* Stats */}
                <div style={{display: "flex", gap: "20px", marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #f1f5f9"}}>
                  {[
                    { value: profile.issueCount || 0, label: "Issues Posted", color: "#6366f1" },
                    { value: issues.reduce((a, b) => a + (b.voteCount || 0), 0), label: "Total Votes", color: "#22c55e" },
                    { value: issues.reduce((a, b) => a + (b.supportCount || 0), 0), label: "Total Supporters", color: "#f59e0b" },
                    { value: issues.filter(i => i.status === "resolved").length, label: "Resolved", color: "#14b8a6" },
                  ].map((s) => (
                    <div key={s.label} style={{textAlign: "center"}}>
                      <div style={{fontSize: "22px", fontWeight: 800, color: s.color}}>{s.value}</div>
                      <div style={{fontSize: "11px", color: "#94a3b8", fontWeight: 500}}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{display: "flex", gap: "4px", background: "white", padding: "6px", borderRadius: "16px", border: "1px solid #e2e8f0", marginBottom: "24px", width: "fit-content"}}>
          {[
            { id: "issues", label: `📢 Issues (${issues.length})` },
            { id: "activity", label: "📊 Activity" },
          ].map((tab) => (
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

        {/* Issues Tab */}
        {activeTab === "issues" && (
          <>
            {issues.length === 0 ? (
              <div style={{textAlign: "center", padding: "60px", background: "white", borderRadius: "24px", border: "1px solid #e2e8f0"}}>
                <div style={{fontSize: "64px", marginBottom: "16px"}}>📭</div>
                <h3 style={{fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, color: "#0f172a", marginBottom: "8px"}}>
                  No Issues Yet
                </h3>
                <p style={{color: "#94a3b8", fontSize: "14px"}}>
                  {isOwnProfile ? "You haven't posted any issues yet." : `${profile.name} hasn't posted any issues yet.`}
                </p>
              </div>
            ) : (
              <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px"}}>
                {issues.map((issue) => (
                  <IssueCard key={issue._id} issue={issue} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <div style={{background: "white", borderRadius: "24px", border: "1px solid #e2e8f0", padding: "32px"}}>
            <h3 style={{fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700, color: "#0f172a", marginBottom: "24px"}}>
              📊 Activity Overview
            </h3>
            <div style={{display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px"}}>
              {[
                { emoji: "📢", label: "Issues Posted", value: profile.issueCount || 0, color: "#6366f1", bg: "#ede9fe" },
                { emoji: "👍", label: "Votes Received", value: issues.reduce((a, b) => a + (b.voteCount || 0), 0), color: "#3b82f6", bg: "#dbeafe" },
                { emoji: "✊", label: "Supporters Gained", value: issues.reduce((a, b) => a + (b.supportCount || 0), 0), color: "#22c55e", bg: "#dcfce7" },
                { emoji: "✅", label: "Issues Resolved", value: issues.filter(i => i.status === "resolved").length, color: "#14b8a6", bg: "#ccfbf1" },
              ].map((s) => (
                <div key={s.label} style={{
                  background: s.bg, borderRadius: "16px", padding: "24px",
                  display: "flex", alignItems: "center", gap: "16px",
                }}>
                  <div style={{fontSize: "32px"}}>{s.emoji}</div>
                  <div>
                    <div style={{fontSize: "28px", fontWeight: 800, color: s.color}}>{s.value}</div>
                    <div style={{fontSize: "13px", color: "#64748b", fontWeight: 500}}>{s.label}</div>
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

export default ProfilePage;