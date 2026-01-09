// import { useState, useEffect } from "react";
// import { Helmet } from "react-helmet-async";
// import { Link, useNavigate } from "react-router-dom";
// import { Button } from "../Components/ui/button";
// import { Input } from "../Components/ui/input";
// import { Building2, Mail, Lock, ArrowRight, EyeOff, Eye } from "lucide-react";
// import { useToast } from "../hooks/use-toast";
// import { useAuth } from "../Contexts/AuthContext";
// import { supabase } from "../Integrations/client";

// const PartnerLogin = () => {
//   const { toast } = useToast();
//   const navigate = useNavigate();
//   const { signIn, user, loading: authLoading } = useAuth();
//   const [showPassword, setShowPassword] = useState(false);
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const checkPartnerStatus = async () => {
//       if (!authLoading && user) {
//         // Check if user is a partner
//         const { data: partnerData } = await supabase
//           .from("gym_partners")
//           .select("id")
//           .eq("user_id", user.id)
//           .limit(1);

//         if (partnerData && partnerData.length > 0) {
//           navigate("/partner-dashboard");
//         } else {
//           toast({
//             title: "Access Denied",
//             description: "You are not registered as a gym partner.",
//             variant: "destructive",
//           });
//         }
//       }
//     };

//     checkPartnerStatus();
//   }, [user, authLoading, navigate, toast]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     const { error } = await signIn(formData.email, formData.password);

//     if (error) {
//       toast({
//         title: "Login Failed",
//         description: error.message,
//         variant: "destructive",
//       });
//       setLoading(false);
//       return;
//     }

//     setLoading(false);
//   };

//   if (authLoading) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <>
//       <Helmet>
//         <title>Partner Login - ScanGym Pakistan</title>
//         <meta
//           name="description"
//           content="Login to your ScanGym Partner dashboard to view gym check-ins."
//         />
//       </Helmet>

//       <div className="min-h-screen bg-background flex">
//         {/* Left Side - Form */}
//         <div className="flex-1 flex items-center justify-center p-6 md:p-12">
//           <div className="w-full max-w-md">
//             {/* Logo */}
//             <Link to="/" className="flex items-center gap-2 mb-8">
//               <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
//                 <Building2 className="w-6 h-6 text-primary-foreground" />
//               </div>
//               <span className="font-display text-xl font-bold text-foreground">
//                 Scan<span className="text-gradient">Gym</span>
//                 <span className="text-muted-foreground text-sm ml-2">
//                   Partner
//                 </span>
//               </span>
//             </Link>

//             <h1 className="font-display text-3xl font-bold text-foreground mb-2">
//               Partner Login
//             </h1>
//             <p className="text-muted-foreground mb-8">
//               Login to view check-ins at your gym
//             </p>

//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-foreground mb-2">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
//                   <Input
//                     type="email"
//                     required
//                     value={formData.email}
//                     onChange={(e) =>
//                       setFormData({ ...formData, email: e.target.value })
//                     }
//                     placeholder="partner@example.com"
//                     className="pl-12 h-12 bg-card"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-foreground mb-2">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
//                   <Input
//                     type={showPassword ? "text" : "password"}
//                     required
//                     value={formData.password}
//                     onChange={(e) =>
//                       setFormData({ ...formData, password: e.target.value })
//                     }
//                     placeholder="••••••••"
//                     className="pl-12 pr-12 h-12 bg-card"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors bg-transparent"
//                   >
//                     {showPassword ? (
//                       <EyeOff className="w-5 h-5" />
//                     ) : (
//                       <Eye className="w-5 h-5" />
//                     )}
//                   </button>
//                 </div>
//               </div>

//               <Button
//                 type="submit"
//                 variant="hero"
//                 size="lg"
//                 className="w-full"
//                 disabled={loading}
//               >
//                 {loading ? "Logging in..." : "Login as Partner"}
//                 <ArrowRight className="w-5 h-5" />
//               </Button>
//             </form>

//             <p className="text-center text-muted-foreground mt-6">
//               Not a partner?{" "}
//               <Link
//                 to="/partner"
//                 className="text-primary hover:underline font-medium"
//               >
//                 Become a Partner
//               </Link>
//             </p>

//             {/* <p className="text-center text-muted-foreground mt-2">
//               Regular user?{" "}
//               <Link
//                 to="/login"
//                 className="text-primary hover:underline font-medium"
//               >
//                 User Login
//               </Link>
//             </p> */}
//           </div>
//         </div>

//         {/* Right Side - Visual */}
//         <div className="hidden lg:flex flex-1 bg-card items-center justify-center p-12 relative overflow-hidden">
//           <div className="absolute inset-0 bg-gradient-dark opacity-50" />
//           <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />

//           <div className="relative z-10 text-center max-w-md">
//             <div className="w-40 h-40 mx-auto bg-foreground rounded-2xl p-6 shadow-glow-lg mb-8">
//               <Building2 className="w-full h-full text-background" />
//             </div>
//             <h2 className="font-display text-2xl font-bold text-foreground mb-4">
//               Track Your Gym's Performance
//             </h2>
//             <p className="text-muted-foreground">
//               Monitor check-ins, analyze trends, and grow your gym with ScanGym.
//             </p>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default PartnerLogin;

import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import { Building2, Mail, Lock, ArrowRight, EyeOff, Eye } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../Contexts/AuthContext";
import { supabase } from "../Integrations/client";

const PartnerLogin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, user, loading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkPartnerStatus = async () => {
      if (!authLoading && user) {
        const { data } = await supabase
          .from("gym_partners")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (data) {
          navigate("/partner-dashboard", { replace: true });
        } else {
          toast({
            title: "Access Denied",
            description: "You are not registered as a gym partner.",
            variant: "destructive",
          });
        }

        setLoading(false);
      }
    };

    checkPartnerStatus();
  }, [user, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(formData.email, formData.password);

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // ❌ DO NOT navigate here
    // AuthContext + useEffect will handle redirect
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Partner Login - ScanGym Pakistan</title>
        <meta
          name="description"
          content="Login to your ScanGym Partner dashboard to view gym check-ins."
        />
      </Helmet>

      <div className="min-h-screen bg-background flex">
        {/* Left Side - Form */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">
                Scan<span className="text-gradient">Gym</span>
                <span className="text-muted-foreground text-sm ml-2">
                  Partner
                </span>
              </span>
            </Link>

            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Partner Login
            </h1>
            <p className="text-muted-foreground mb-8">
              Login to view check-ins at your gym
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="partner@example.com"
                    className="pl-12 h-12 bg-card"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="••••••••"
                    className="pl-12 pr-12 h-12 bg-card"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors bg-transparent"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login as Partner"}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>

            <p className="text-center text-muted-foreground mt-6">
              Not a partner?{" "}
              <Link
                to="/partner"
                className="text-primary hover:underline font-medium"
              >
                Become a Partner
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side - Visual */}
        <div className="hidden lg:flex flex-1 bg-card items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-dark opacity-50" />
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />

          <div className="relative z-10 text-center max-w-md">
            <div className="w-40 h-40 mx-auto bg-foreground rounded-2xl p-6 shadow-glow-lg mb-8">
              <Building2 className="w-full h-full text-background" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Track Your Gym's Performance
            </h2>
            <p className="text-muted-foreground">
              Monitor check-ins, analyze trends, and grow your gym with ScanGym.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PartnerLogin;
