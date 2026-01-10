import { Toaster } from "../src/Components/ui/toaster";
import { Toaster as Sonner } from "../src/Components/ui/sonner";
import { TooltipProvider } from "../src/Components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import ProtectedRoute from "../src/Components/ProtectedRoute";
import ProtectedPartnerRoute from "../src/Components/ProtectedPartnerRoute";
import ProtectedAdminRoute from "../src/Components/ProtectedAdminRoute";
import Index from "./pages/Index";
import HowItWorks from "../src/pages/HowItWorks";
// import FindGyms from "./pages/FindGyms";
import Pricing from "./pages/Pricing";
import Partner from "./pages/Partner";
import PartnerLogin from "./pages/PartnerLogin";
import PartnerDashboard from "./pages/PartnerDashboard";
import AdminLogin from "../src/pages/AdminbLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BlogAdmin from "./pages/BlogAdmin";
import Shop from "./pages/Shop";
import ShopAdmin from "./pages/ShopAdmin";
import Orders from "./pages/Orders";
import PaymentSuccess from "./pages/PaymentSuccess";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/Privacy";
import TermsConditions from "./pages/Terms";
import RefundPolicy from "./pages/Refund";

const App = () => (
  <HelmetProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          {/* <Route path="/find-gyms" element={<FindGyms />} /> */}
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/partner" element={<Partner />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/refund" element={<RefundPolicy />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/partner-login" element={<PartnerLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Protected User Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />

          {/* Protected Partner Routes */}
          <Route
            path="/partner-dashboard"
            element={
              <ProtectedPartnerRoute>
                <PartnerDashboard />
              </ProtectedPartnerRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/blog-admin"
            element={
              <ProtectedAdminRoute>
                <BlogAdmin />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/shop-admin"
            element={
              <ProtectedAdminRoute>
                <ShopAdmin />
              </ProtectedAdminRoute>
            }
          />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </HelmetProvider>
);

export default App;
