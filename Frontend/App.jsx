import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import { RestaurantProvider } from "./context/RestaurantContext";
import Login from "./components/common/Login";
import Dashboard from "./components/user/Dashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import Home from "./components/HomePage/Home";
import Footer from "./components/user/Footer";
import Navbar from "./components/user/Navbar";

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check admin role from backend
  // For now, we'll check it in the component itself
  return children;
};

const App = () => {
  return (
    <RestaurantProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Footer />
        </div>
      </Router>
    </RestaurantProvider>
  );
};

export default App;
