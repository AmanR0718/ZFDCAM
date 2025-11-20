// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleRoute } from "@/components/RoleRoute";
import AppShell from "@/components/AppShell";

// Pages
import Login from "@/pages/Login";
import AdminDashboard from "@/pages/AdminDashboard";
import OperatorDashboard from "@/pages/OperatorDashboard";
import FarmerRegistration from "@/pages/FarmerRegistration";
import FarmersList from "@/pages/FarmersList";
import EditFarmer from "@/pages/EditFarmer";
import OperatorManagement from "@/pages/OperatorManagement";
import FarmerDetails from "@/pages/FarmerDetails";
import CreateOperator from "@/pages/CreateOperator";
import Dashboard from "./pages/Dashboard";

function App() {
  const { token, user } = useAuthStore();

  const getDashboardRoute = () => {
    if (!user) return "/login";
    const role = user.roles?.[0]?.toLowerCase();
    if (role === "admin") return "/admin-dashboard";
    if (role === "operator") return "/operator-dashboard";
    return "/dashboard";
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppShell>
                <Routes>
                  {/* Admin Routes */}
                  <Route
                    path="admin-dashboard"
                    element={
                      <RoleRoute requiredRole="admin">
                        <AdminDashboard />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="operators/manage"
                    element={
                      <RoleRoute requiredRole="admin">
                        <OperatorManagement />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="operators/create"
                    element={
                      <RoleRoute requiredRole="admin">
                        <CreateOperator />
                      </RoleRoute>
                    }
                  />

                  {/* Operator Routes */}
                  <Route
                    path="operator-dashboard"
                    element={
                      <RoleRoute requiredRole="operator">
                        <OperatorDashboard />
                      </RoleRoute>
                    }
                  />
                  
                  <Route
                    path="dashboard"
                    element={
                      <RoleRoute requiredRole={["admin", "operator"]}>
                        <Dashboard />
                      </RoleRoute>
                    }
                  />

                  {/* Shared Admin + Operator Routes */}
                  <Route
                    path="farmers"
                    element={
                      <RoleRoute requiredRole={["admin", "operator"]}>
                        <FarmersList />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="farmers/create"
                    element={
                      <RoleRoute requiredRole={["admin", "operator"]}>
                        <FarmerRegistration />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="farmers/edit/:farmerId"
                    element={
                      <RoleRoute requiredRole={["admin", "operator"]}>
                        <EditFarmer />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="farmers/:farmerId"
                    element={
                      <RoleRoute requiredRole={["admin", "operator"]}>
                        <FarmerDetails />
                      </RoleRoute>
                    }
                  />
                  
                  {/* Default route inside AppShell */}
                  <Route
                    path="/"
                    element={<Navigate to={getDashboardRoute()} replace />}
                  />
                  
                  {/* Fallback for any other route inside AppShell */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppShell>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
