import {
  Shield,
  Clock,
  MapPin,
  Smartphone,
  CreditCard,
  Users,
} from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Nationwide Access",
    description:
      "Access 500+ gyms in 20+ cities across Pakistan with a single subscription.",
  },
  {
    icon: Smartphone,
    title: "Instant QR Entry",
    description:
      "No waiting, no paperwork. Just scan and start your workout instantly.",
  },
  {
    icon: Shield,
    title: "Verified Gyms Only",
    description:
      "Every partner gym is verified for quality, safety, and equipment standards.",
  },
  {
    icon: Clock,
    title: "Flexible Timing",
    description:
      "Train anytime during gym operating hours. Your schedule, your choice.",
  },
  {
    icon: CreditCard,
    title: "Easy Payments",
    description:
      "Pay with JazzCash, EasyPaisa, or debit/credit cards. Secure and hassle-free.",
  },
  {
    icon: Users,
    title: "Track Your Progress",
    description:
      "View your scan history, visited gyms, and workout patterns in one place.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 md:py-32 bg-card relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block text-primary text-sm font-semibold tracking-wider uppercase mb-4">
            Features
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Why Choose <span className="text-gradient">ScanGym?</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We're revolutionizing how Pakistanis access fitness facilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-background border border-border rounded-2xl p-6 hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-5 group-hover:shadow-glow transition-shadow">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>

              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
