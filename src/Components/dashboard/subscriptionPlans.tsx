import { useState } from "react";
import { Button } from "../ui/button";
import {
  Check,
  Crown,
  Zap,
  Star,
  ChevronRight,
  CreditCard,
  RotateCcw,
} from "lucide-react";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

const subscriptionPlans = [
  {
    id: "basic",
    name: "Basic",
    price: 1999,
    duration: "1 Month",
    gyms: 60,
    features: ["Access to 60 gyms", "QR scan entry", "Basic support"],
    popular: false,
    icon: Zap,
  },
  {
    id: "standard",
    name: "Standard",
    price: 3499,
    duration: "1 Month",
    gyms: 120,
    features: [
      "Access to 120 gyms",
      "QR scan entry",
      "Priority support",
      "Diet plans access",
    ],
    popular: true,
    icon: Crown,
  },
  {
    id: "premium",
    name: "Premium",
    price: 4999,
    duration: "1 Month",
    gyms: "Unlimited",
    features: [
      "Unlimited gym access",
      "QR scan entry",
      "VIP support",
      "All features included",
      "Free guest passes",
    ],
    popular: false,
    icon: Star,
  },
];

interface SubscriptionPlansProps {
  onSubscribe: (
    planId: string,
    planName: string,
    price: number,
    paymentMethod: string
  ) => void;
}

const SubscriptionPlans = ({ onSubscribe }: SubscriptionPlansProps) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [autoRenew, setAutoRenew] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const handleSubscribe = () => {
    if (selectedPlan && selectedPayment) {
      const plan = subscriptionPlans.find((p) => p.id === selectedPlan);
      if (plan) {
        onSubscribe(selectedPlan, plan.name, plan.price, selectedPayment);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Subscription Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {subscriptionPlans.map((plan) => {
          const IconComponent = plan.icon;
          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative bg-card rounded-2xl p-6 border-2 transition-all cursor-pointer ${
                selectedPlan === plan.id
                  ? "border-primary shadow-glow"
                  : plan.popular
                  ? "border-primary/50"
                  : "border-border hover:border-primary/30"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                <IconComponent className="w-6 h-6 text-primary" />
                <h3 className="font-display text-xl font-bold text-foreground">
                  {plan.name}
                </h3>
                {selectedPlan === plan.id && (
                  <Check className="w-5 h-5 text-primary ml-auto" />
                )}
              </div>

              <div className="mb-2">
                <span className="text-primary font-semibold text-lg">
                  {typeof plan.gyms === "number"
                    ? `${plan.gyms} Gyms`
                    : plan.gyms}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl font-bold text-foreground">
                    PKR {plan.price.toLocaleString()}
                  </span>
                </div>
                <span className="text-muted-foreground text-sm">
                  per {plan.duration.toLowerCase()}
                </span>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Auto-Renew Option */}
      <div className="bg-card rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RotateCcw className="w-5 h-5 text-primary" />
            <div>
              <Label
                htmlFor="auto-renew"
                className="text-foreground font-medium"
              >
                Auto-Renew Subscription
              </Label>
              <p className="text-muted-foreground text-sm">
                Automatically renew when your plan expires
              </p>
            </div>
          </div>
          <Switch
            id="auto-renew"
            checked={autoRenew}
            onCheckedChange={setAutoRenew}
          />
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-card rounded-xl p-6">
        <h3 className="font-display text-lg font-bold text-foreground mb-4">
          Select Payment Method
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { id: "safepay", name: "Safepay (Cards, Wallets)" },
            { id: "card", name: "Debit/Credit Card" },
          ].map((method) => (
            <div
              key={method.id}
              onClick={() => setSelectedPayment(method.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
                selectedPayment === method.id
                  ? "bg-primary/20 border-2 border-primary"
                  : "bg-muted border-2 border-transparent hover:border-primary/30"
              }`}
            >
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <span className="text-foreground font-medium">{method.name}</span>
              {selectedPayment === method.id && (
                <Check className="w-5 h-5 text-primary ml-auto" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Corporate Plans Teaser */}
      <div className="bg-gradient-card rounded-xl p-6 border border-primary/20">
        <div className="flex items-center gap-3 mb-2">
          <Crown className="w-6 h-6 text-primary" />
          <h3 className="font-display text-lg font-bold text-foreground">
            Corporate Plans
          </h3>
          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
            Coming Soon
          </span>
        </div>
        <p className="text-muted-foreground">
          Bulk subscriptions for companies. Give your employees fitness
          benefits.
        </p>
      </div>

      {/* Subscribe Button */}
      <Button
        variant="hero"
        size="xl"
        className="w-full"
        disabled={!selectedPlan || !selectedPayment}
        onClick={handleSubscribe}
      >
        {selectedPlan && selectedPayment
          ? "Proceed to Payment"
          : "Select a Plan & Payment Method"}
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default SubscriptionPlans;
