import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "../Components/ui/button";
import { supabase } from "../Integrations/client";
import Navbar from "../Components/layout/Navbar";
import Footer from "../Components/layout/Footer";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading"
  );
  const [message, setMessage] = useState("");

  const tracker = searchParams.get("tracker");
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!tracker && !orderId) {
        setStatus("failed");
        setMessage("Invalid payment reference");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke(
          "safepay-verify",
          {
            body: { tracker, order_id: orderId },
          }
        );

        if (error) {
          console.error("Verification error:", error);
          setStatus("failed");
          setMessage("Failed to verify payment");
          return;
        }

        if (data.success || data.status === "completed") {
          setStatus("success");
          setMessage("Your payment was successful!");
        } else if (data.status === "pending") {
          setStatus("loading");
          setMessage("Payment is being processed...");
          // Retry after 3 seconds
          setTimeout(verifyPayment, 3000);
        } else {
          setStatus("failed");
          setMessage("Payment was not completed");
        }
      } catch (error) {
        console.error("Error:", error);
        setStatus("failed");
        setMessage("An error occurred while verifying payment");
      }
    };

    verifyPayment();
  }, [tracker, orderId]);

  return (
    <>
      <Helmet>
        <title>Payment Status - ScanGym</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center">
              <div className="bg-card rounded-2xl p-8 border border-border">
                {status === "loading" && (
                  <>
                    <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
                    <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                      Verifying Payment
                    </h1>
                    <p className="text-muted-foreground">
                      {message || "Please wait..."}
                    </p>
                  </>
                )}

                {status === "success" && (
                  <>
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                      Payment Successful!
                    </h1>
                    <p className="text-muted-foreground mb-6">{message}</p>
                    <Button
                      onClick={() => navigate("/dashboard")}
                      variant="hero"
                    >
                      Go to Dashboard
                    </Button>
                  </>
                )}

                {status === "failed" && (
                  <>
                    <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                    <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                      Payment Failed
                    </h1>
                    <p className="text-muted-foreground mb-6">{message}</p>
                    <div className="space-y-2">
                      <Button
                        onClick={() => navigate("/dashboard")}
                        variant="hero"
                        className="w-full"
                      >
                        Try Again
                      </Button>
                      <Button
                        onClick={() => navigate("/")}
                        variant="outline"
                        className="w-full"
                      >
                        Go Home
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default PaymentSuccess;
