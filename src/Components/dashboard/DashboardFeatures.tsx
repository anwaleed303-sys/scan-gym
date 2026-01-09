import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dumbbell,
  Salad,
  Brain,
  Star,
  Calendar,
  MapPin,
  Clock,
  ChevronRight,
  Award,
  CreditCard,
  X,
  Check,
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../Contexts/AuthContext";
import { supabase } from "../../Integrations/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface Trainer {
  id: string;
  name: string;
  specialty: string;
  price: number;
  image: string | null;
  is_available: boolean | null;
}

interface DietPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_days: number | null;
  calories_per_day: number | null;
  meal_count: number | null;
  features: string[] | null;
  is_active: boolean | null;
}

const gymVisits = [
  { gym: "FitZone Gulberg", date: "2024-01-15", rating: null },
  { gym: "PowerHouse DHA", date: "2024-01-12", rating: 4 },
  { gym: "Iron Paradise", date: "2024-01-10", rating: 5 },
];

interface SelectedTrainer {
  id: string;
  name: string;
  specialty: string;
  price: number;
}

interface Gym {
  id: string;
  name: string;
}

const DashboardFeatures = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeFeature, setActiveFeature] = useState<string>("trainers");
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTrainer, setSelectedTrainer] =
    useState<SelectedTrainer | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("safepay");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    name: "",
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [selectedGymId, setSelectedGymId] = useState<string>("");
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true);
      const [gymsRes, trainersRes, dietPlansRes] = await Promise.all([
        supabase.from("gyms").select("id, name"),
        supabase
          .from("trainers")
          .select("*")
          .eq("is_available", true)
          .order("name"),
        supabase
          .from("diet_plans")
          .select("*")
          .eq("is_active", true)
          .order("name"),
      ]);

      if (gymsRes.data) setGyms(gymsRes.data);
      if (trainersRes.data) setTrainers(trainersRes.data);
      if (dietPlansRes.data) setDietPlans(dietPlansRes.data);
      setDataLoading(false);
    };
    fetchData();
  }, []);

  const features = [
    { id: "trainers", name: "Trainer Booking", icon: Dumbbell },
    { id: "diet", name: "Diet Plans", icon: Salad },
    { id: "ai", name: "AI Fitness", icon: Brain },
    { id: "ratings", name: "Gym Ratings", icon: Star },
  ];

  const handleBookTrainer = (trainer: SelectedTrainer) => {
    setSelectedTrainer(trainer);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Not Logged In",
        description: "Please login to book a trainer.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedGymId) {
      toast({
        title: "No Gym Selected",
        description: "Please select a gym for your training session.",
        variant: "destructive",
      });
      return;
    }

    // If Safepay is selected, redirect to Safepay checkout
    if (selectedPaymentMethod === "safepay") {
      setBookingLoading(true);
      try {
        const sessionDate = new Date();
        sessionDate.setDate(sessionDate.getDate() + 7);

        const successUrl = `${window.location.origin}/payment-success?order_id={ORDER_ID}`;
        const cancelUrl = `${window.location.origin}/dashboard`;

        const response = await supabase.functions.invoke("safepay-checkout", {
          body: {
            amount: selectedTrainer?.price || 0,
            payment_type: "trainer_booking",
            metadata: {
              trainer_id: selectedTrainer?.id,
              trainer_name: selectedTrainer?.name,
              trainer_specialty: selectedTrainer?.specialty,
              gym_id: selectedGymId,
              session_date: sessionDate.toISOString().split("T")[0],
              session_time: "10:00 AM",
            },
            success_url: successUrl,
            cancel_url: cancelUrl,
          },
        });

        setBookingLoading(false);

        if (response.error) {
          console.error("Safepay error:", response.error);
          toast({
            title: "Payment Error",
            description: "Failed to initiate payment. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (response.data?.checkout_url) {
          window.location.href = response.data.checkout_url;
          return;
        }
      } catch (error) {
        setBookingLoading(false);
        console.error("Payment error:", error);
        toast({
          title: "Payment Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    // Only validate card details if card payment is selected
    if (selectedPaymentMethod === "card") {
      if (
        !cardDetails.cardNumber ||
        !cardDetails.expiry ||
        !cardDetails.cvv ||
        !cardDetails.name
      ) {
        toast({
          title: "Missing Details",
          description: "Please fill in all card details.",
          variant: "destructive",
        });
        return;
      }
    }

    setBookingLoading(true);

    // Save booking to database for non-Safepay payments (demo flow)
    const sessionDate = new Date();
    sessionDate.setDate(sessionDate.getDate() + 7);

    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      trainer_name: selectedTrainer?.name || "",
      trainer_specialty: selectedTrainer?.specialty || "",
      session_date: sessionDate.toISOString().split("T")[0],
      session_time: "10:00 AM",
      price: selectedTrainer?.price || 0,
      payment_method: selectedPaymentMethod,
      status: "confirmed",
      gym_id: selectedGymId,
    });

    setBookingLoading(false);

    if (error) {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Payment Successful!",
      description: `Trainer ${selectedTrainer?.name} booked. They will contact you within 24 hours.`,
    });
    setShowPaymentModal(false);
    setSelectedTrainer(null);
    setSelectedGymId("");
    setSelectedPaymentMethod("safepay");
    setCardDetails({ cardNumber: "", expiry: "", cvv: "", name: "" });
  };

  const handleBuyDietPlan = (planId: string) => {
    toast({
      title: "Diet Plan Added!",
      description: "Check your email for the detailed plan.",
    });
  };

  const handleSubmitRating = (gymName: string) => {
    toast({
      title: "Rating Submitted!",
      description: `Thank you for rating ${gymName}!`,
    });
    setSelectedRating(0);
  };

  return (
    <div className="space-y-6">
      {/* Payment Modal */}
      {showPaymentModal && selectedTrainer && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-foreground">
                Complete Payment
              </h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Trainer Summary */}
            <div className="bg-muted rounded-xl p-4 mb-6">
              <p className="text-muted-foreground text-sm">
                Booking session with
              </p>
              <p className="font-display font-bold text-foreground">
                {selectedTrainer.name}
              </p>
              <p className="font-display text-2xl font-bold text-primary mt-2">
                PKR {selectedTrainer.price.toLocaleString()}
              </p>
            </div>

            {/* Gym Selection */}
            <div className="mb-6">
              <Label className="text-foreground">Select Gym for Training</Label>
              <Select value={selectedGymId} onValueChange={setSelectedGymId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a gym" />
                </SelectTrigger>
                <SelectContent>
                  {gyms.map((gym) => (
                    <SelectItem key={gym.id} value={gym.id}>
                      {gym.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <Label className="text-foreground mb-3 block">
                Select Payment Method
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "safepay", name: "Safepay" },
                  { id: "jazzcash", name: "JazzCash" },
                  { id: "easypaisa", name: "EasyPaisa" },
                  { id: "card", name: "Card" },
                ].map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                      selectedPaymentMethod === method.id
                        ? "bg-primary/20 border-2 border-primary"
                        : "bg-muted border-2 border-transparent hover:border-primary/30"
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-primary" />
                    <span className="text-foreground text-sm font-medium">
                      {method.name}
                    </span>
                    {selectedPaymentMethod === method.id && (
                      <Check className="w-4 h-4 text-primary ml-auto" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Card Payment Form - only show for card payment */}
            {selectedPaymentMethod === "card" && (
              <div className="space-y-4 mb-4">
                <div>
                  <Label htmlFor="cardName" className="text-foreground">
                    Cardholder Name
                  </Label>
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    value={cardDetails.name}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, name: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cardNumber" className="text-foreground">
                    Card Number
                  </Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.cardNumber}
                    onChange={(e) =>
                      setCardDetails({
                        ...cardDetails,
                        cardNumber: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry" className="text-foreground">
                      Expiry Date
                    </Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={(e) =>
                        setCardDetails({
                          ...cardDetails,
                          expiry: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv" className="text-foreground">
                      CVV
                    </Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      type="password"
                      value={cardDetails.cvv}
                      onChange={(e) =>
                        setCardDetails({ ...cardDetails, cvv: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            <Button
              variant="hero"
              className="w-full mt-6"
              onClick={handlePayment}
              disabled={bookingLoading}
            >
              {bookingLoading
                ? "Processing..."
                : `Pay PKR ${selectedTrainer.price.toLocaleString()}`}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              🔒 Your payment information is secure and encrypted
            </p>
          </div>
        </div>
      )}

      {/* Feature Tabs */}
      <div className="flex flex-wrap gap-2">
        {features.map((feature) => {
          const IconComponent = feature.icon;
          return (
            <Button
              key={feature.id}
              variant={activeFeature === feature.id ? "hero" : "outline"}
              onClick={() => setActiveFeature(feature.id)}
              className="flex items-center gap-2"
            >
              <IconComponent className="w-4 h-4" />
              {feature.name}
            </Button>
          );
        })}
      </div>

      {/* Trainer Booking */}
      {activeFeature === "trainers" && (
        <div className="space-y-4">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Book a Personal Trainer
            </h2>
            <p className="text-muted-foreground">
              Get personalized training from certified professionals
            </p>
            <p className="text-sm text-primary mt-2">
              ✨ Optional paid service - Book only if interested
            </p>
          </div>

          {dataLoading ? (
            <p className="text-muted-foreground text-center py-8">
              Loading trainers...
            </p>
          ) : trainers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No trainers available at the moment.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {trainers.map((trainer) => (
                <div
                  key={trainer.id}
                  className="bg-card rounded-xl p-5 border border-border"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center text-3xl">
                      {trainer.image || "💪"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-bold text-foreground">
                          {trainer.name}
                        </h3>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          Available
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm mb-2">
                        {trainer.specialty}
                      </p>
                      <span className="text-foreground font-medium text-sm">
                        PKR {trainer.price.toLocaleString()}/session
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() =>
                      handleBookTrainer({
                        id: trainer.id,
                        name: trainer.name,
                        specialty: trainer.specialty,
                        price: trainer.price,
                      })
                    }
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Session
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Diet Plans */}
      {activeFeature === "diet" && (
        <div className="space-y-4">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Diet Plans
            </h2>
            <p className="text-muted-foreground">
              Customized nutrition plans for your fitness goals
            </p>
            <p className="text-sm text-primary mt-2">
              🎁 Free with your subscription
            </p>
          </div>

          {dataLoading ? (
            <p className="text-muted-foreground text-center py-8">
              Loading diet plans...
            </p>
          ) : dietPlans.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No diet plans available at the moment.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {dietPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-card rounded-xl p-5 border border-border"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-2xl">
                      🥗
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-foreground">
                        {plan.name}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {plan.duration_days
                          ? `${plan.duration_days} days`
                          : "Ongoing"}
                      </p>
                    </div>
                  </div>

                  {plan.description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {plan.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-4 text-sm">
                    {plan.calories_per_day && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Calories:</span>
                        <span className="text-foreground">
                          {plan.calories_per_day}/day
                        </span>
                      </div>
                    )}
                    {plan.meal_count && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Meals per day:</span>
                        <span className="text-foreground">
                          {plan.meal_count}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="font-display text-xl font-bold text-primary">
                      {plan.price === 0
                        ? "FREE"
                        : `PKR ${plan.price.toLocaleString()}`}
                    </span>
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={() => handleBuyDietPlan(plan.id)}
                    >
                      Get Plan
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Fitness Tracking */}
      {activeFeature === "ai" && (
        <div className="space-y-6">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              AI Fitness Tracking
            </h2>
            <p className="text-muted-foreground">
              Smart insights powered by artificial intelligence
            </p>
            <p className="text-sm text-primary mt-2">
              🎁 Free with your subscription
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-card rounded-xl p-5 border border-border text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display font-bold text-foreground mb-2">
                Weekly Score
              </h3>
              <span className="font-display text-4xl font-bold text-gradient">
                85
              </span>
              <p className="text-muted-foreground text-sm mt-2">
                Great progress!
              </p>
            </div>

            <div className="bg-card rounded-xl p-5 border border-border text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display font-bold text-foreground mb-2">
                Gym Visits
              </h3>
              <span className="font-display text-4xl font-bold text-gradient">
                12
              </span>
              <p className="text-muted-foreground text-sm mt-2">This month</p>
            </div>

            <div className="bg-card rounded-xl p-5 border border-border text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display font-bold text-foreground mb-2">
                Calories Burned
              </h3>
              <span className="font-display text-4xl font-bold text-gradient">
                8.5k
              </span>
              <p className="text-muted-foreground text-sm mt-2">This week</p>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-primary/20">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">
              🤖 AI Recommendations
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Brain className="w-5 h-5 text-primary mt-0.5" />
                <p className="text-muted-foreground text-sm">
                  Based on your workout pattern, consider adding more leg
                  exercises to balance your routine.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Brain className="w-5 h-5 text-primary mt-0.5" />
                <p className="text-muted-foreground text-sm">
                  You're most active on weekends. Try adding a Wednesday session
                  for consistent progress.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Brain className="w-5 h-5 text-primary mt-0.5" />
                <p className="text-muted-foreground text-sm">
                  Great job! You've increased your gym visits by 25% compared to
                  last month.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gym Ratings */}
      {activeFeature === "ratings" && (
        <div className="space-y-6">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Rate Your Gym Visits
            </h2>
            <p className="text-muted-foreground">
              Help improve gym quality by sharing your experience
            </p>
          </div>

          <div className="space-y-4">
            {gymVisits.map((visit, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-5 border border-border"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-foreground">
                        {visit.gym}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Visited on {new Date(visit.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {visit.rating ? (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= visit.rating
                              ? "fill-primary text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setSelectedRating(star)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                star <= selectedRating
                                  ? "fill-primary text-primary"
                                  : "text-muted-foreground hover:text-primary"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      {selectedRating > 0 && (
                        <Button
                          variant="hero"
                          size="sm"
                          onClick={() => handleSubmitRating(visit.gym)}
                        >
                          Submit
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFeatures;
