import { Helmet } from "react-helmet-async";
import Navbar from "../Components/layout/Navbar";
import Footer from "../Components/layout/Footer";
import HeroSection from "../Components/home/HeroSection";
import HowItWorksSection from "../Components/home/HowItWorksSection";
import FeaturesSection from "../Components/home/FeaturesSelection";
import FitnessRulesSection from "../Components/home/FitnessRulesSection";
import DownloadSection from "../Components/home/DownloadSection";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>ScanGym - One Subscription, Unlimited Gyms | Pakistan</title>
        <meta
          name="description"
          content="Access any registered gym across Pakistan with a single QR scan. One subscription, 500+ gyms, 20+ cities. Join ScanGym today!"
        />
        <meta
          name="keywords"
          content="gym Pakistan, fitness subscription, gym access, QR gym entry, ScanGym"
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <HeroSection />
          <HowItWorksSection />
          <FeaturesSection />
          <FitnessRulesSection />
          <DownloadSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
