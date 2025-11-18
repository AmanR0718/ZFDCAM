// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { token, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, show children (protected page)
  return <>{children}</>;
};
