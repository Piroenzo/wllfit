import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import api from "./api";

export default function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = api.getToken();
    setIsAuth(!!token);
    setLoading(false);
  }, []);

  const handleLoginSuccess = (token) => {
    localStorage.setItem("token", token);
    setIsAuth(true);
  };

  const handleLogout = () => {
    api.logout();
    setIsAuth(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-gray-300">
        Loading session...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {!isAuth ? (
          <Route
            path="*"
            element={<Login onLoginSuccess={handleLoginSuccess} />}
          />
        ) : (
          <>
            <Route path="/" element={<Dashboard onLogout={handleLogout} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}
