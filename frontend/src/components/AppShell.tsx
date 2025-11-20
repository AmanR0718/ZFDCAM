// src/components/AppShell.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import React, { useState, useEffect } from "react";

const navLinks = [
  {
    group: "Overview",
    links: [
      { to: "/dashboard", label: "Dashboard", roles: ["admin", "operator"] },
      { to: "/analytics", label: "Analytics & Trends", roles: ["admin"] },
    ],
  },
  {
    group: "Farmer Management",
    links: [
      { to: "/farmers", label: "Farmer Registry", roles: ["admin", "operator"] },
      { to: "/farmers/create", label: "New Registration", roles: ["admin", "operator"] },
      { to: "/groups", label: "Cooperatives", roles: ["admin"] },
    ],
  },
  {
    group: "Operations",
    links: [
      { to: "/requests", label: "Requests (FISP)", roles: ["admin", "operator"], badge: 4 },
      { to: "/visits", label: "Extension Visits", roles: ["operator"] },
    ],
  },
];

const adminNavLinks = [
    { to: "/operators/manage", label: "User Management", roles: ["admin"] },
    { to: "/reports", label: "System Reports", roles: ["admin"] },
]

const getPageTitle = (pathname: string) => {
    // Logic to determine page title from pathname
    if (pathname.includes("dashboard")) return "Executive Dashboard";
    if (pathname.includes("/farmers/create")) return "New Farmer Registration";
    if (pathname.includes("/farmers")) return "Farmer Registry";
    if (pathname.includes("/operators/manage")) return "Operator Management";
    // default title
    return "Dashboard";
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState("Dashboard");

  useEffect(() => {
    setPageTitle(getPageTitle(location.pathname));
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userRoles = user?.roles.map(r => r.toLowerCase()) || [];
  const userInitial = user?.name ? user.name.substring(0, 2).toUpperCase() : "AD";

  return (
    <div id="app-shell" className="flex h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-xl z-20 flex-shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 bg-green-800 shadow-lg">
          <span className="font-bold tracking-wide text-lg">
            ZIAMIS <span className="text-orange-400 text-xs">PRO</span>
          </span>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          {navLinks.map((group) => (
            <div key={group.group}>
              <div className="px-4 mt-6 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                {group.group}
              </div>
              {group.links.filter(l => l.roles.some(r => userRoles.includes(r))).map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center px-4 py-3 text-gray-300 hover:bg-green-900 hover:text-white transition-all cursor-pointer border-l-4 ${location.pathname === link.to ? "bg-green-900 text-white border-orange-500" : "border-transparent"}`}
                >
                  {link.label}
                  {link.badge && <span className="ml-auto bg-orange-600 text-xs rounded-full px-2 py-0.5">{link.badge}</span>}
                </Link>
              ))}
            </div>
          ))}

          {/* Admin Group (Hidden for Operators) */}
          {userRoles.includes("admin") && (
            <div id="admin-menu-group">
              <div className="px-4 mt-6 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Administration</div>
              {adminNavLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center px-4 py-3 text-gray-300 hover:bg-green-900 hover:text-white transition-all cursor-pointer border-l-4 ${location.pathname === link.to ? "bg-green-900 text-white border-orange-500" : "border-transparent"}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Footer */}
        <div className="p-4 bg-gray-800 border-t border-gray-700 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center font-bold text-xs">
              {userInitial}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.name || "Admin User"}</p>
              <p className="text-xs text-gray-400">{user?.roles[0] || "System Admin"}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-white">
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
        {/* Topbar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 z-10">
          <div className="flex items-center">
            <h2 id="page-title" className="text-xl font-bold text-gray-800">
              {pageTitle}
            </h2>
            <span
              id="location-crumb"
              className="hidden md:flex items-center ml-4 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full"
            >
              {userRoles.includes("admin") ? "Lusaka HQ" : "Camp Level"}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Global Search (NRC, Name)..."
                className="pl-8 pr-4 py-1.5 bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-green-500 rounded-full text-sm w-64 transition-all"
              />
            </div>
            <button className="relative p-2 text-gray-500 hover:text-green-700">
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Content Stage */}
        <div id="stage" className="flex-1 overflow-y-auto p-6 relative">
            <div className="fade-in">
                {children}
            </div>
        </div>
      </main>
    </div>
  );
}
