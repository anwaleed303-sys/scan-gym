import { Cat, Dumbbell, Sparkles } from "lucide-react";

const PricingSection = () => {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <span className="inline-block text-primary text-sm font-semibold tracking-wider uppercase mb-4">
            Pricing
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent <span className="text-gradient">Pricing</span>
          </h2>
        </div>

        {/* Funny Cat Section */}
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-gradient-card border border-border rounded-3xl p-8 md:p-12 text-center overflow-hidden">
            {/* Floating Elements */}
            <div className="absolute top-4 right-4 animate-bounce">
              <Dumbbell className="w-8 h-8 text-primary/40" />
            </div>
            <div className="absolute bottom-4 left-4 animate-pulse">
              <Sparkles className="w-6 h-6 text-primary/40" />
            </div>

            {/* Cat Animation */}
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                <Cat
                  className="w-20 h-20 md:w-24 md:h-24 text-primary animate-bounce"
                  strokeWidth={1.5}
                />
              </div>
              {/* Cat's thought bubble */}
              <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                Meow!
              </div>
            </div>

            <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Even This Cat is Waiting... 🐱
            </h3>

            <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
              Our pricing plans are doing their warm-up exercises. They'll be
              ready to flex soon!
            </p>

            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-full font-semibold">
              <Sparkles className="w-5 h-5" />
              Coming Soon
              <Sparkles className="w-5 h-5" />
            </div>

            <p className="text-muted-foreground text-sm mt-6">
              Meanwhile, this cat is getting swole 💪
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
