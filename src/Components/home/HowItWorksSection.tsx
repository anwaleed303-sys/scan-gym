import { UserPlus, CreditCard, QrCode, Dumbbell } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Sign Up",
    description: "Create your account with phone or email in under 2 minutes.",
    step: "01",
  },
  {
    icon: CreditCard,
    title: "Subscribe",
    description:
      "Choose a plan that fits your lifestyle. Pay via JazzCash, EasyPaisa, or Card.",
    step: "02",
  },
  {
    icon: QrCode,
    title: "Scan & Enter",
    description: "Visit any partner gym and scan the QR code at the entrance.",
    step: "03",
  },
  {
    icon: Dumbbell,
    title: "Train Anywhere",
    description: "Enjoy unlimited access to 500+ gyms across Pakistan.",
    step: "04",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block text-primary text-sm font-semibold tracking-wider uppercase mb-4">
            How It Works
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Start Training in{" "}
            <span className="text-gradient">4 Easy Steps</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Getting access to gyms across Pakistan has never been simpler.
            Here's how ScanGym works.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="group relative bg-gradient-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-glow"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Step Number */}
              <span className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground shadow-glow">
                {step.step}
              </span>

              {/* Icon */}
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <step.icon className="w-7 h-7 text-primary" />
              </div>

              {/* Content */}
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>

              {/* Connector Line (hidden on last item and mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
