import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Navbar from "../Components/layout/Navbar";
import Footer from "../Components/layout/Footer";
import { Button } from "../Components/ui/button";
import {
  Building2,
  TrendingUp,
  Users,
  Shield,
  MessageCircle,
  LogIn,
} from "lucide-react";

const benefits = [
  {
    icon: Users,
    title: "Increased Footfall",
    description:
      "Get access to 50,000+ ScanGym members actively looking for gyms.",
  },
  {
    icon: TrendingUp,
    title: "Additional Revenue",
    description:
      "Earn revenue for every ScanGym member visit. No upfront costs.",
  },
  {
    icon: Shield,
    title: "Verified Badge",
    description:
      "Get featured as a verified gym, building trust with potential members.",
  },
  {
    icon: Building2,
    title: "Partner Dashboard",
    description:
      "Track visits, view analytics, and manage your gym profile easily.",
  },
];

const steps = [
  "Contact us on WhatsApp with your gym details",
  "Our team verifies your gym facilities",
  "Get approved and receive your unique QR code",
  "Start receiving ScanGym members",
];

const Partner = () => {
  return (
    <>
      <Helmet>
        <title>
          Partner With Us - ScanGym Pakistan | Grow Your Gym Business
        </title>
        <meta
          name="description"
          content="Join Pakistan's largest gym network. Partner with ScanGym to get more members, increase revenue, and grow your gym business."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-24 pb-20">
          {/* Hero */}
          <section className="py-16 md:py-24 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />

            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-3xl mx-auto text-center">
                <span className="inline-block text-primary text-sm font-semibold tracking-wider uppercase mb-4">
                  Gym Partners
                </span>
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                  Grow Your Gym With
                  <br />
                  <span className="text-gradient">ScanGym</span>
                </h1>
                <p className="text-muted-foreground text-lg mb-8">
                  Join Pakistan's largest gym network and unlock new revenue
                  streams. Get more members, zero upfront costs.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="https://wa.me/923001234567?text=Hi%2C%20I%27m%20interested%20in%20partnering%20my%20gym%20with%20ScanGym"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-xl text-lg"
                  >
                    <MessageCircle className="w-6 h-6" />
                    Contact us on WhatsApp
                  </a>

                  <Link to="/partner-login">
                    <Button
                      variant="outline"
                      size="lg"
                      className="rounded-full px-8 py-4 h-auto text-lg"
                    >
                      <LogIn className="w-6 h-6 mr-2" />
                      Partner Login
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section className="py-16 bg-card">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
                Why Partner With Us?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {benefits.map((benefit) => (
                  <div
                    key={benefit.title}
                    className="bg-background border border-border rounded-2xl p-6 hover:border-primary/30 transition-all"
                  >
                    <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
                      <benefit.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {benefit.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
                How to Get Started
              </h2>

              <div className="max-w-2xl mx-auto">
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div key={step} className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold shadow-glow">
                        {index + 1}
                      </div>
                      <p className="text-foreground">{step}</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center mt-10">
                  <a
                    href="https://wa.me/923001234567?text=Hi%2C%20I%27m%20interested%20in%20partnering%20my%20gym%20with%20ScanGym"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-xl text-lg"
                  >
                    <MessageCircle className="w-6 h-6" />
                    Get Started on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Partner;
