import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import { supabase } from "../Integrations/client";

interface ProtectedPartnerRouteProps {
  children: React.ReactNode;
}

const ProtectedPartnerRoute = ({ children }: ProtectedPartnerRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const [isPartner, setIsPartner] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkPartnerStatus = async () => {
      if (!authLoading) {
        if (!user) {
          setIsPartner(false);
          setChecking(false);
          return;
        }

        try {
          const { data, error } = await supabase
            .from("gym_partners")
            .select("id")
            .eq("user_id", user.id)
            .single();

          if (error && error.code !== "PGRST116") {
            console.error("Error checking partner status:", error);
            setIsPartner(false);
          } else {
            setIsPartner(!!data);
          }
        } catch (err) {
          console.error("Error in partner check:", err);
          setIsPartner(false);
        } finally {
          setChecking(false);
        }
      }
    };

    checkPartnerStatus();
  }, [user, authLoading]);

  // Show loading spinner while checking auth and partner status
  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect to partner login if not authenticated or not a partner
  if (!user || !isPartner) {
    return <Navigate to="/partner-login" replace />;
  }

  // User is authenticated and is a partner
  return <>{children}</>;
};

export default ProtectedPartnerRoute;
