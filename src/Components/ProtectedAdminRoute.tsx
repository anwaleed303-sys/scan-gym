import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import { supabase } from "../Integrations/client";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!authLoading) {
        if (!user) {
          setIsAdmin(false);
          setChecking(false);
          return;
        }

        try {
          // Check if user has admin role in your users table or admin table
          const { data, error } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .single();

          if (error && error.code !== "PGRST116") {
            console.error("Error checking admin status:", error);
            setIsAdmin(false);
          } else {
            setIsAdmin(data?.role === "admin");
          }
        } catch (err) {
          console.error("Error in admin check:", err);
          setIsAdmin(false);
        } finally {
          setChecking(false);
        }
      }
    };

    checkAdminStatus();
  }, [user, authLoading]);

  // Show loading spinner while checking auth and admin status
  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect to admin login if not authenticated or not an admin
  if (!user || !isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  // User is authenticated and is an admin
  return <>{children}</>;
};

export default ProtectedAdminRoute;
