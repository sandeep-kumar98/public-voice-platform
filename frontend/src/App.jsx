import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import IssueDetailPage from "./pages/IssueDetailPage";
import CreateIssuePage from "./pages/CreateIssuePage";
import ProfilePage from "./pages/ProfilePage";
import TrendingPage from "./pages/TrendingPage";
import AdminPage from "./pages/AdminPage";
import Navbar from "./components/common/Navbar";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh"}}><div style={{width:"40px",height:"40px",border:"3px solid #e2e8f0",borderTopColor:"#6366f1",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/></div>;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user?.role === "admin" ? children : <Navigate to="/" />;
};

function App() {
  return (
    <div style={{minHeight: "100vh"}}>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/issues/:id" element={<IssueDetailPage />} />
        <Route path="/trending" element={<TrendingPage />} />
        <Route path="/create-issue" element={<ProtectedRoute><CreateIssuePage /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
      </Routes>
    </div>
  );
}

export default App;
