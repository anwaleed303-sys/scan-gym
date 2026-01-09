import { Button } from "../ui/button";
import { QrCode, MapPin, Zap, ChevronRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-dark" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6 animate-fade-in">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">
                Pakistan's #1 Gym Access Platform
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 leading-tight animate-slide-up">
              One Subscription.
              <br />
              <span className="text-gradient">Unlimited Gyms.</span>
            </h1>

            <p
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              Access any registered gym across Pakistan with a single QR scan.
              No more multiple memberships. Just scan and train.
            </p>

            <div
              className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="hero" size="xl" className="group">
                  Download App
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div
              className="flex items-center gap-8 mt-12 justify-center lg:justify-start animate-slide-up"
              style={{ animationDelay: "0.3s" }}
            >
              {[
                { value: "500+", label: "Partner Gyms" },
                { value: "50K+", label: "Active Users" },
                { value: "20+", label: "Cities" },
              ].map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <p className="font-display text-2xl md:text-3xl font-bold text-gradient">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div
            className="flex-1 relative animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="relative w-72 h-72 md:w-96 md:h-96 mx-auto">
              {/* Phone Mockup */}
              <div className="absolute inset-0 bg-gradient-card rounded-[3rem] border border-border shadow-card overflow-hidden">
                <div className="absolute inset-4 bg-background rounded-[2rem] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 md:w-40 md:h-40 mx-auto bg-foreground rounded-2xl p-4 shadow-glow animate-pulse-glow">
                      <QrCode className="w-full h-full text-background" />
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">
                      Scan to enter
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 bg-card border border-border rounded-2xl p-4 shadow-card animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-xl">✅</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Access Granted
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Iron Fitness Lahore
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="absolute -bottom-4 -left-4 bg-card border border-border rounded-2xl p-4 shadow-card animate-float"
                style={{ animationDelay: "1s" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-lg text-primary-foreground font-bold">
                      15
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Days Left
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Monthly Plan
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
