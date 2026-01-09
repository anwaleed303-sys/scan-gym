import { Helmet } from "react-helmet-async";
import Navbar from "../Components/layout/Navbar";
import Footer from "../Components/layout/Footer";

const Refund = () => {
  return (
    <>
      <Helmet>
        <title>Refund Policy - ScanGym Pakistan</title>
        <meta
          name="description"
          content="ScanGym refund policy. Learn about our refund and cancellation policies for subscriptions and purchases."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
              Refund Policy
            </h1>

            <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
              <p className="text-lg">Last updated: January 2025</p>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">
                  Subscription Refunds
                </h2>

                <h3 className="text-lg font-medium text-foreground">
                  Within 7 Days of Purchase
                </h3>
                <p>
                  If you are not satisfied with your subscription, you may
                  request a full refund within 7 days of your initial purchase,
                  provided you have not used the service (no gym check-ins).
                </p>

                <h3 className="text-lg font-medium text-foreground">
                  After 7 Days
                </h3>
                <p>
                  After the 7-day period or if you have used the service,
                  refunds are generally not available. However, we review
                  special circumstances on a case-by-case basis.
                </p>

                <h3 className="text-lg font-medium text-foreground">
                  Cancellation
                </h3>
                <p>
                  You may cancel your subscription at any time. Cancellation
                  will take effect at the end of your current billing period.
                  You will continue to have access until then.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">
                  Shop Product Refunds
                </h2>

                <h3 className="text-lg font-medium text-foreground">
                  Return Policy
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Products may be returned within 14 days of delivery</li>
                  <li>Items must be unused and in original packaging</li>
                  <li>
                    Supplements and consumables cannot be returned once opened
                  </li>
                  <li>
                    Shipping costs for returns are the responsibility of the
                    customer
                  </li>
                </ul>

                <h3 className="text-lg font-medium text-foreground">
                  Damaged or Defective Items
                </h3>
                <p>
                  If you receive a damaged or defective item, please contact us
                  within 48 hours of delivery with photos of the damage. We will
                  arrange a replacement or full refund at no extra cost.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">
                  Trainer Booking Refunds
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Cancellations made 24+ hours before the session: Full refund
                  </li>
                  <li>Cancellations made 12-24 hours before: 50% refund</li>
                  <li>
                    Cancellations made less than 12 hours before: No refund
                  </li>
                  <li>If trainer cancels: Full refund or free rescheduling</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">
                  How to Request a Refund
                </h2>
                <p>To request a refund, please:</p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>
                    Email us at refunds@scangym.pk with your order details
                  </li>
                  <li>Include your account email and reason for refund</li>
                  <li>For products, include photos if applicable</li>
                </ol>
                <p>
                  Refunds are typically processed within 5-7 business days. The
                  amount will be credited to your original payment method.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">
                  Contact Us
                </h2>
                <p>For refund inquiries, contact our support team:</p>
                <p className="text-primary">refunds@scangym.pk</p>
                <p>Response time: 24-48 hours</p>
              </section>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Refund;
