import { Helmet } from "react-helmet-async";
import Navbar from "../Components/layout/Navbar";
import Footer from "../Components/layout/Footer";
import { Check, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, you can cancel your subscription at any time. Your access will remain active until the end of your billing period.",
  },
  {
    question: "Are all gyms included in the subscription?",
    answer:
      "Yes! Your ScanGym subscription gives you access to all 500+ verified partner gyms across Pakistan.",
  },
  {
    question: "How many times can I visit a gym per day?",
    answer:
      "You can visit any number of gyms per day. There's no limit on daily visits with any subscription plan.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept JazzCash, EasyPaisa, and all major debit/credit cards for secure payments.",
  },
  {
    question: "Is there a trial period?",
    answer:
      "We offer a 7-day money-back guarantee. If you're not satisfied, contact us for a full refund.",
  },
  {
    question: "Can I pause my subscription?",
    answer:
      "Yes, 6-month and yearly subscribers can pause their subscription for up to 30 days per year.",
  },
];

const Pricing = () => {
  return (
    <>
      <Helmet>
        <title>
          Pricing - ScanGym Pakistan | Flexible Gym Subscription Plans
        </title>
        <meta
          name="description"
          content="Choose from flexible ScanGym subscription plans. Monthly, 6 months, or yearly. Access 500+ gyms across Pakistan with one membership."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-24">
          {/* Hero */}
          <section className="py-12 md:py-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />

            <div className="container mx-auto px-4 relative z-10">
              <span className="inline-block text-primary text-sm font-semibold tracking-wider uppercase mb-4">
                Pricing
              </span>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Invest in Your <span className="text-gradient">Fitness</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Simple pricing, no hidden fees. Choose the plan that fits your
                fitness goals.
              </p>
            </div>
          </section>

          {/* All Plans Include */}
          <section className="py-16 bg-card">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-10">
                All Plans Include
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {[
                  "Access to 500+ gyms",
                  "Unlimited QR scans",
                  "Workout tracking",
                  "Mobile app access",
                  "Scan history",
                  "24/7 support",
                  "Secure payments",
                  "Instant activation",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section className="py-16 md:py-24">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-muted-foreground">
                  Got questions? We've got answers.
                </p>
              </div>

              <div className="max-w-3xl mx-auto space-y-4">
                {faqs.map((faq) => (
                  <div
                    key={faq.question}
                    className="bg-card border border-border rounded-xl p-6"
                  >
                    <div className="flex items-start gap-4">
                      <HelpCircle className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-display font-semibold text-foreground mb-2">
                          {faq.question}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Pricing;
