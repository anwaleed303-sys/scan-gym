import { Helmet } from "react-helmet-async";
import Navbar from "../Components/layout/Navbar";
import Footer from "../Components/layout/Footer";
import { Button } from "../Components/ui/button";
import { Link } from "react-router-dom";
import {
  UserPlus,
  CreditCard,
  QrCode,
  Dumbbell,
  ArrowRight,
  CheckCircle2,
  Smartphone,
  Download,
  Building2,
} from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create Your Account",
    description:
      "Sign up using your phone number with OTP verification or email with password. Complete your profile with basic information.",
    details: [
      "Phone + OTP or Email signup",
      "Profile completion with photo",
      "Secure account verification",
    ],
  },
  {
    icon: CreditCard,
    title: "Choose Your Plan",
    description:
      "Select from our flexible subscription plans - Monthly, 3 Months, 6 Months, or Yearly. Pay securely via JazzCash, EasyPaisa, or Card.",
    details: [
      "Multiple plan options",
      "Secure payment gateway",
      "Instant activation",
    ],
  },
  {
    icon: QrCode,
    title: "Scan & Enter",
    description:
      "Visit any registered ScanGym partner gym. Open the app, scan the QR code at the entrance, and you're in!",
    details: [
      "Instant QR verification",
      "Real-time access logging",
      "Subscription validation",
    ],
  },
  {
    icon: Dumbbell,
    title: "Train Anywhere",
    description:
      "Enjoy your workout at any of our 500+ partner gyms across Pakistan. No limits, no restrictions.",
    details: [
      "Unlimited gym visits",
      "Access across 20+ cities",
      "Full facility usage",
    ],
  },
];

const HowItWorks = () => {
  return (
    <>
      <Helmet>
        <title>How It Works - ScanGym Pakistan</title>
        <meta
          name="description"
          content="Learn how ScanGym works. Sign up, subscribe, scan QR codes, and access 500+ gyms across Pakistan with one membership."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-24 pb-20">
          {/* Hero */}
          <section className="py-16 md:py-24 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />

            <div className="container mx-auto px-4 text-center relative z-10">
              <span className="inline-block text-primary text-sm font-semibold tracking-wider uppercase mb-4">
                How It Works
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Your Fitness Journey
                <br />
                <span className="text-gradient">Made Simple</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                ScanGym eliminates the hassle of multiple gym memberships.
                Here's how you can start training at any gym in Pakistan.
              </p>
            </div>
          </section>

          {/* Steps */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="space-y-12 lg:space-y-20">
                {steps.map((step, index) => (
                  <div
                    key={step.title}
                    className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-16 ${
                      index % 2 === 1 ? "lg:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Visual */}
                    <div className="flex-1 w-full max-w-md lg:max-w-none">
                      <div className="relative bg-gradient-card border border-border rounded-3xl p-8 lg:p-12">
                        <span className="absolute top-4 right-4 text-7xl font-display font-bold text-primary/10">
                          0{index + 1}
                        </span>
                        <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow mb-6">
                          <step.icon className="w-10 h-10 text-primary-foreground" />
                        </div>
                        <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-4">
                          {step.title}
                        </h2>
                        <p className="text-muted-foreground mb-6">
                          {step.description}
                        </p>
                        <ul className="space-y-3">
                          {step.details.map((detail) => (
                            <li
                              key={detail}
                              className="flex items-center gap-3"
                            >
                              <CheckCircle2 className="w-5 h-5 text-primary" />
                              <span className="text-foreground text-sm">
                                {detail}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Connector */}
                    {index < steps.length - 1 && (
                      <div className="hidden lg:flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center">
                          <ArrowRight className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Download Section */}
          <section className="py-16 bg-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-dark opacity-50" />
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />

            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-2xl mx-auto text-center">
                <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-glow animate-pulse-glow">
                  <Smartphone className="w-10 h-10 text-primary-foreground" />
                </div>

                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Get the
                  <span className="text-gradient"> ScanGym App</span>
                </h2>

                <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
                  Download our app and start your fitness journey today. Access
                  500+ gyms across Pakistan with just one tap.
                </p>

                <a
                  href="https://play.google.com/store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button variant="hero" size="xl" className="group gap-3">
                    <Download className="w-5 h-5" />
                    Download from Play Store
                  </Button>
                </a>
              </div>
            </div>
          </section>

          {/* Partner Section */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-xl mx-auto">
                <div className="bg-background border border-border rounded-3xl p-8 lg:p-10 hover:border-primary/30 transition-all duration-300 text-center">
                  <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center mb-6 mx-auto">
                    <Building2 className="w-7 h-7 text-primary" />
                  </div>

                  <h3 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-4">
                    Own a Gym?
                    <br />
                    <span className="text-gradient">Partner With Us</span>
                  </h3>

                  <p className="text-muted-foreground mb-6">
                    Join Pakistan's largest gym network. Get more members,
                    increase revenue, and grow your business with ScanGym.
                  </p>

                  <Link to="/partner">
                    <Button variant="outline" size="lg" className="group">
                      Become a Partner
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
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

export default HowItWorks;
