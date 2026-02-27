import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

const CATEGORIES = [
  { value: "Road", emoji: "🛣️" },
  { value: "Water", emoji: "💧" },
  { value: "Electricity", emoji: "⚡" },
  { value: "Sanitation", emoji: "🧹" },
  { value: "Crime", emoji: "🚨" },
  { value: "Education", emoji: "📚" },
  { value: "Health", emoji: "🏥" },
  { value: "Environment", emoji: "🌿" },
  { value: "Other", emoji: "📌" },
];

const CreateIssuePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: "", description: "", category: "",
    city: "", state: "", tags: "",
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, v));
      if (image) data.append("image", image);
      const res = await axiosInstance.post("/issues", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Issue posted successfully!");
      navigate(`/issues/${res.data.data.issue._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post issue");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "14px 18px",
    borderRadius: "12px", border: "2px solid #e2e8f0",
    fontSize: "14px", outline: "none",
    background: "white", transition: "all 0.2s",
    color: "#0f172a", fontFamily: "'DM Sans', sans-serif",
  };

  const labelStyle = {
    display: "block", fontSize: "12px",
    fontWeight: 700, color: "#374151",
    marginBottom: "8px", letterSpacing: "0.5px",
  };

  return (
    <div style={{minHeight: "100vh", background: "#f8fafc", display: "grid", gridTemplateColumns: "1fr 1fr"}}>

      {/* Left Panel - Form */}
      <div style={{padding: "48px", overflowY: "auto"}}>
        <div style={{maxWidth: "520px"}}>

          {/* Header */}
          <div style={{marginBottom: "36px"}}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "#fef3c7", borderRadius: "99px",
              padding: "6px 14px", marginBottom: "16px",
            }}>
              <span style={{fontSize: "14px"}}>📢</span>
              <span style={{color: "#d97706", fontSize: "12px", fontWeight: 700, letterSpacing: "1px"}}>RAISE AN ISSUE</span>
            </div>
            <h1 style={{fontFamily: "'Playfair Display', serif", fontSize: "36px", fontWeight: 800, color: "#0f172a", lineHeight: 1.1, marginBottom: "8px"}}>
              Post a Civic Issue
            </h1>
            <p style={{color: "#64748b", fontSize: "14px", lineHeight: 1.6}}>
              Describe the problem clearly so your community can understand and support it.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Title */}
            <div style={{marginBottom: "20px"}}>
              <label style={labelStyle}>ISSUE TITLE *</label>
              <input
                type="text" name="title"
                value={formData.title} onChange={handleChange}
                placeholder="e.g. Dangerous pothole on Main Street..."
                required style={inputStyle}
                onFocus={e => { e.target.style.border = "2px solid #6366f1"; e.target.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.08)"; }}
                onBlur={e => { e.target.style.border = "2px solid #e2e8f0"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* Description */}
            <div style={{marginBottom: "20px"}}>
              <label style={labelStyle}>DESCRIPTION *</label>
              <textarea
                name="description"
                value={formData.description} onChange={handleChange}
                placeholder="Explain the issue in detail. Include when it started, how it affects people, and any relevant context..."
                required rows={5}
                style={{...inputStyle, resize: "none", lineHeight: 1.6}}
                onFocus={e => { e.target.style.border = "2px solid #6366f1"; e.target.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.08)"; }}
                onBlur={e => { e.target.style.border = "2px solid #e2e8f0"; e.target.style.boxShadow = "none"; }}
              />
              <div style={{textAlign: "right", fontSize: "11px", color: "#94a3b8", marginTop: "4px"}}>
                {formData.description.length}/2000
              </div>
            </div>

            {/* Category */}
            <div style={{marginBottom: "20px"}}>
              <label style={labelStyle}>CATEGORY *</label>
              <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px"}}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value} type="button"
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    style={{
                      padding: "10px 8px", borderRadius: "10px",
                      border: "2px solid",
                      borderColor: formData.category === cat.value ? "#6366f1" : "#e2e8f0",
                      background: formData.category === cat.value ? "#ede9fe" : "white",
                      cursor: "pointer", fontSize: "12px", fontWeight: 600,
                      color: formData.category === cat.value ? "#6366f1" : "#64748b",
                      transition: "all 0.2s",
                      display: "flex", alignItems: "center",
                      justifyContent: "center", gap: "4px",
                    }}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.value}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px"}}>
              <div>
                <label style={labelStyle}>CITY *</label>
                <input type="text" name="city"
                  value={formData.city} onChange={handleChange}
                  placeholder="Ludhiana" required
                  style={inputStyle}
                  onFocus={e => { e.target.style.border = "2px solid #6366f1"; e.target.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.08)"; }}
                  onBlur={e => { e.target.style.border = "2px solid #e2e8f0"; e.target.style.boxShadow = "none"; }}
                />
              </div>
              <div>
                <label style={labelStyle}>STATE *</label>
                <input type="text" name="state"
                  value={formData.state} onChange={handleChange}
                  placeholder="Punjab" required
                  style={inputStyle}
                  onFocus={e => { e.target.style.border = "2px solid #6366f1"; e.target.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.08)"; }}
                  onBlur={e => { e.target.style.border = "2px solid #e2e8f0"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            {/* Tags */}
            <div style={{marginBottom: "20px"}}>
              <label style={labelStyle}>TAGS (OPTIONAL)</label>
              <input type="text" name="tags"
                value={formData.tags} onChange={handleChange}
                placeholder="pothole, road, danger (comma separated)"
                style={inputStyle}
                onFocus={e => { e.target.style.border = "2px solid #6366f1"; e.target.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.08)"; }}
                onBlur={e => { e.target.style.border = "2px solid #e2e8f0"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* Image Upload */}
            <div style={{marginBottom: "28px"}}>
              <label style={labelStyle}>ATTACH PHOTO (OPTIONAL)</label>
              <label style={{
                display: "block", border: "2px dashed #e2e8f0",
                borderRadius: "12px", padding: "24px",
                textAlign: "center", cursor: "pointer",
                background: imagePreview ? "transparent" : "#f8fafc",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#6366f1"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}
              >
                <input type="file" accept="image/*" onChange={handleImage} style={{display: "none"}} />
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" style={{width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "8px"}} />
                ) : (
                  <div>
                    <div style={{fontSize: "32px", marginBottom: "8px"}}>📸</div>
                    <p style={{color: "#64748b", fontSize: "13px", fontWeight: 500}}>Click to upload photo</p>
                    <p style={{color: "#94a3b8", fontSize: "11px", marginTop: "4px"}}>JPG, PNG up to 5MB</p>
                  </div>
                )}
              </label>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "16px",
              borderRadius: "12px", border: "none",
              background: loading ? "#94a3b8" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white", fontSize: "16px", fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 4px 24px rgba(99,102,241,0.4)",
              transition: "all 0.2s",
              fontFamily: "'DM Sans', sans-serif",
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: "8px",
            }}>
              {loading ? "⏳ Posting issue..." : "📢 Post Issue →"}
            </button>
          </form>
        </div>
      </div>

      {/* Right Panel - Info */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)",
        padding: "60px 48px", display: "flex",
        flexDirection: "column", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)"}} />
        <div style={{position: "absolute", bottom: "-60px", left: "-60px", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)"}} />

        <div style={{position: "relative"}}>
          <h2 style={{fontFamily: "'Playfair Display', serif", fontSize: "36px", fontWeight: 900, color: "white", lineHeight: 1.1, marginBottom: "16px"}}>
            How it works
          </h2>
          <p style={{color: "#94a3b8", fontSize: "15px", lineHeight: 1.7, marginBottom: "40px"}}>
            Your issue will be analyzed by our AI system and shown to the community for support.
          </p>

          {/* Steps */}
          <div style={{display: "flex", flexDirection: "column", gap: "24px", marginBottom: "48px"}}>
            {[
              { num: "01", title: "Post Your Issue", desc: "Fill in the details and submit. Takes less than 2 minutes.", color: "#6366f1" },
              { num: "02", title: "AI Analysis", desc: "Our AI checks urgency and authenticity automatically.", color: "#8b5cf6" },
              { num: "03", title: "Community Support", desc: "Citizens vote and sign the petition to show support.", color: "#3b82f6" },
              { num: "04", title: "Real Action", desc: "High-priority issues get escalated to authorities.", color: "#22c55e" },
            ].map((s) => (
              <div key={s.num} style={{display: "flex", gap: "16px", alignItems: "flex-start"}}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "14px", flexShrink: 0,
                  background: `${s.color}22`, border: `1px solid ${s.color}44`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, color: s.color, fontSize: "13px",
                }}>
                  {s.num}
                </div>
                <div>
                  <div style={{color: "white", fontWeight: 700, fontSize: "15px", marginBottom: "4px"}}>{s.title}</div>
                  <div style={{color: "#64748b", fontSize: "13px", lineHeight: 1.5}}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tips Box */}
          <div style={{
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: "16px", padding: "20px",
          }}>
            <p style={{color: "#a5b4fc", fontWeight: 700, fontSize: "13px", marginBottom: "12px"}}>
              💡 TIPS FOR BETTER RESULTS
            </p>
            {[
              "Be specific about the location",
              "Add a photo if possible",
              "Explain how it affects people",
              "Use relevant tags",
            ].map((tip) => (
              <div key={tip} style={{display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px"}}>
                <span style={{color: "#6366f1", fontSize: "12px"}}>✓</span>
                <span style={{color: "#94a3b8", fontSize: "13px"}}>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateIssuePage;