// src/pages/Dashboard.tsx
import useAuthStore from "@/store/authStore";
import AdminDashboard from "./AdminDashboard";
import OperatorDashboard from "./OperatorDashboard";

export default function Dashboard() {
  const { user } = useAuthStore();

  if (!user) {
    return null;
  }

  const role = user.roles?.[0]?.toLowerCase();

  if (role === "admin") {
    return <AdminDashboard />;
  }

  if (role === "operator") {
    return <OperatorDashboard />;
  }

  return <div>Dashboard</div>;
}