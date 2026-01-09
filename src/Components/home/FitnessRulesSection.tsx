import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Shield, Clock, Star, QrCode } from "lucide-react";

const FitnessRulesSection = () => {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Orange Background with Diagonal Stripes */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            repeating-linear-gradient(
              135deg,
              hsl(var(--primary)) 0px,
              hsl(var(--primary)) 2px,
              hsl(var(--primary) / 0.85) 2px,
              hsl(var(--primary) / 0.85) 20px
            )
          `,
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Content */}
          <div className="flex-1">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6 leading-tight italic">
              Your Fitness,
              <br />
              Your Rules
            </h2>

            <p className="text-lg md:text-xl text-black/80 mb-8 max-w-xl">
              Break free from rigid gym memberships. Travel? Busy schedule? Try
              different gyms? We've got you covered.
            </p>

            {/* Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-black/70" strokeWidth={1.5} />
                <span className="text-black font-medium">
                  Secure & verified partner gyms
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-black/70" strokeWidth={1.5} />
                <span className="text-black font-medium">
                  24/7 customer support
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-black/70" strokeWidth={1.5} />
                <span className="text-black font-medium">
                  Exclusive rewards program
                </span>
              </div>
            </div>

            <Link to="/pricing">
              <Button
                className="bg-black text-white hover:bg-black/90 rounded-full px-8 py-6 text-lg font-semibold"
                size="lg"
              >
                Start Your Journey
              </Button>
            </Link>
          </div>

          {/* QR Code Visual */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="relative w-72 h-72 md:w-80 md:h-80">
              {/* QR Code Card */}
              <div className="w-full h-full bg-[#1a1a1a] rounded-3xl border-4 border-black/20 shadow-2xl flex flex-col items-center justify-center p-8">
                <div className="w-40 h-40 md:w-48 md:h-48 flex items-center justify-center">
                  <QrCode
                    className="w-full h-full text-primary"
                    strokeWidth={1}
                  />
                </div>
                <p className="mt-4 text-primary/80 text-sm">Scan to download</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FitnessRulesSection;
