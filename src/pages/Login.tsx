import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import { QrCode, Mail, Lock, ArrowRight } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../Contexts/AuthContext";

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Try to login first
    const { error: signInError } = await signIn(
      formData.email,
      formData.password
    );

    if (signInError) {
      // If login fails with "Invalid login credentials", try to signup
      if (
        signInError.message.includes("Invalid login credentials") ||
        signInError.message.includes("Email not confirmed")
      ) {
        // Extract name from email (before @)
        const name = formData.email.split("@")[0];

        // Try to create new account
        const { error: signUpError } = await signUp(
          formData.email,
          formData.password,
          name
        );

        if (signUpError) {
          // If signup also fails, check if it's because user exists
          if (signUpError.message.includes("already registered")) {
            toast({
              title: "Login Failed",
              description: "Invalid email or password.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: signUpError.message,
              variant: "destructive",
            });
          }
          setLoading(false);
          return;
        }

        // Signup successful, auto-login
        toast({
          title: "Welcome!",
          description: "Account created successfully. Logging you in...",
        });

        setTimeout(() => {
          navigate("/shop");
        }, 1000);
      } else {
        // Other login errors
        toast({
          title: "Login Failed",
          description: signInError.message,
          variant: "destructive",
        });
        setLoading(false);
      }
    } else {
      // Login successful
      toast({
        title: "Welcome Back!",
        description: "Redirecting to shop...",
      });
      setLoading(false);
      navigate("/shop");
    }
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
        <title>Login - ScanGym Pakistan</title>
        <meta
          name="description"
          content="Login to your ScanGym account and access gyms across Pakistan."
        />
      </Helmet>

      <div className="min-h-screen bg-background flex">
        {/* Left Side - Form */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                <QrCode className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">
                Scan<span className="text-gradient">Gym</span>
              </span>
            </Link>

            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Welcome
            </h1>
            <p className="text-muted-foreground mb-8">
              New user? Just enter your email & password to create an account
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
                    placeholder="scangym@example.com"
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
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="••••••••"
                    className="pl-12 h-12 bg-card"
                  />
                </div>
                {/* <p className="text-xs text-muted-foreground mt-1">
                  New user? Just enter your details to create an account
                </p> */}
              </div>

              {/* <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-border" />
                  <span className="text-sm text-muted-foreground">
                    Remember me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div> */}

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Please wait..." : "Continue"}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>

        {/* Right Side - Visual */}
        <div className="hidden lg:flex flex-1 bg-card items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-dark opacity-50" />
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />

          <div className="relative z-10 text-center max-w-md">
            <div className="w-40 h-40 mx-auto bg-foreground rounded-2xl p-6 shadow-glow-lg mb-8">
              <QrCode className="w-full h-full text-background" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Scan. Enter. Train.
            </h2>
            <p className="text-muted-foreground">
              Access 500+ gyms across Pakistan with a single QR scan.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
