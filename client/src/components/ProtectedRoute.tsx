import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { hasAccess } from "../../../shared/rbac";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  requiredRole?: string;
  path?: string;
}

export default function ProtectedRoute({
  component: Component,
  requiredRole,
  ...rest
}: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "authorized" | "unauthorized">("loading");

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        setStatus("unauthorized");
        return;
      }

      let user: { role: string };

      try {
        user = JSON.parse(userStr);
      } catch {
        localStorage.clear();
        setStatus("unauthorized");
        return;
      }

      if (requiredRole && !hasAccess(user.role, requiredRole)) {
        setStatus("unauthorized");
        return;
      }

      try {
        const res = await fetch("/api/auth/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          localStorage.clear();
          setStatus("unauthorized");
          return;
        }
      } catch {
      }

      setStatus("authorized");
    };

    checkAuth();
  }, [requiredRole]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "unauthorized") {
    setLocation("/login");
    return null;
  }

  return <Component {...rest} />;
}
