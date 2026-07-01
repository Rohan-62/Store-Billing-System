import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", adminOnly: true, icon: "📊" },
    { name: "Billing", path: "/billing", adminOnly: false, icon: "🧾" },
    { name: "Products", path: "/products", adminOnly: false, icon: "📦" },
    { name: "Bill History", path: "/history", adminOnly: false, icon: "📜" },
    { name: "Customers", path: "/customers", adminOnly: false, icon: "👥" },
    { name: "Coupons", path: "/coupons", adminOnly: true, icon: "🏷️" },
    { name: "AI Assistant", path: "/ai", adminOnly: true, icon: "🤖" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <h3>Store Billing</h3>
        <p>{user?.role?.toUpperCase()}</p>
      </div>
      <ul className="sidebar-menu">
        {menuItems.map((item) => {
          if (item.adminOnly && !isAdmin) return null;
          const isActive = location.pathname === item.path;
          return (
            <li key={item.path} className={isActive ? "active" : ""}>
              <Link to={item.path}>
                <span className="icon">{item.icon}</span>
                <span className="text">{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="sidebar-footer">
        <div className="user-info">
          <span>{user?.username}</span>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
