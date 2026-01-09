import { Helmet } from "react-helmet-async";
import Navbar from "../Components/layout/Footer";
import Footer from "../Components/layout/Footer";

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - ScanGym Pakistan</title>
        <meta
          name="description"
          content="ScanGym privacy policy. Learn how we collect, use, and protect your personal information."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
              Privacy Policy
            </h1>

            <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
              <p className="text-lg">Last updated: January 2025</p>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">
                  1. Information We Collect
                </h2>
                <p>
                  We collect information you provide directly to us, such as
                  when you create an account, make a purchase, or contact us for
                  support. This includes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name, email address, and phone number</li>
                  <li>
                    Payment information (processed securely through our payment
                    providers)
                  </li>
                  <li>
                    Location data (with your permission) for finding nearby gyms
                  </li>
                  <li>Gym check-in history and usage patterns</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">
                  2. How We Use Your Information
                </h2>
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send you technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Show you nearby partner gyms based on your location</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">
                  3. Information Sharing
                </h2>
                <p>
                  We do not sell or rent your personal information to third
                  parties. We may share your information only in the following
                  circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    With partner gyms to verify your membership when you check
                    in
                  </li>
                  <li>With service providers who assist in our operations</li>
                  <li>When required by law or to protect our rights</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">
                  4. Data Security
                </h2>
                <p>
                  We implement appropriate security measures to protect your
                  personal information against unauthorized access, alteration,
                  disclosure, or destruction. All payment information is
                  encrypted and processed through secure payment gateways.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">
                  5. Your Rights
                </h2>
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access and update your personal information</li>
                  <li>Request deletion of your account and data</li>
                  <li>Opt out of marketing communications</li>
                  <li>Disable location services at any time</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">
                  6. Contact Us
                </h2>
                <p>
                  If you have any questions about this Privacy Policy, please
                  contact us at:
                </p>
                <p className="text-primary">support@scangym.pk</p>
              </section>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Privacy;
