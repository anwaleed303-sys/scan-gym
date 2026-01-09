import { Helmet } from "react-helmet-async";
import Navbar from "../Components/layout/Navbar";
import Footer from "../Components/layout/Footer";

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service - ScanGym Pakistan</title>
        <meta
          name="description"
          content="ScanGym terms of service. Read our terms and conditions for using the ScanGym platform."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
              Terms of Service
            </h1>

            <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
              <p className="text-lg">Last updated: January 2025</p>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">
                  1. Acceptance of Terms
                </h2>
                <p>
                  By accessing or using ScanGym's services, you agree to be
                  bound by these Terms of Service. If you do not agree to these
                  terms, please do not use our services.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">
                  2. Service Description
                </h2>
                <p>
                  ScanGym provides a subscription-based gym access service that
                  allows users to check in at partner gyms across Pakistan using
                  QR code scanning. Our service includes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Access to partner gyms based on your subscription tier
                  </li>
                  <li>QR code check-in system</li>
                  <li>Trainer booking services</li>
                  <li>Fitness products shop</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">
                  3. User Accounts
                </h2>
                <p>To use our services, you must:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Be at least 18 years old or have parental consent</li>
                  <li>
                    Provide accurate and complete registration information
                  </li>
                  <li>Keep your account credentials secure</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">
                  4. Subscription Terms
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Subscriptions are billed monthly in advance</li>
                  <li>You may cancel your subscription at any time</li>
                  <li>
                    Cancellation takes effect at the end of the current billing
                    period
                  </li>
                  <li>
                    No partial refunds for unused days in the current period
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">
                  5. Gym Usage Rules
                </h2>
                <p>When using partner gyms, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Follow all gym rules and regulations</li>
                  <li>Treat gym staff and other members with respect</li>
                  <li>Use equipment properly and safely</li>
                  <li>Not share your membership or QR code with others</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">
                  6. Liability Limitations
                </h2>
                <p>
                  ScanGym is not liable for any injuries, accidents, or loss of
                  personal belongings that occur at partner gyms. Users exercise
                  at their own risk. We recommend consulting a physician before
                  starting any fitness program.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">
                  7. Termination
                </h2>
                <p>
                  We reserve the right to suspend or terminate your account if
                  you violate these terms, engage in fraudulent activity, or
                  misuse our services.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">
                  8. Contact
                </h2>
                <p>
                  For questions about these Terms of Service, contact us at:
                </p>
                <p className="text-primary">legal@scangym.pk</p>
              </section>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Terms;
