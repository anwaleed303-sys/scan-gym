import { Button } from "../ui/button";
import { Smartphone, Download } from "lucide-react";

const DownloadSection = () => {
  return (
    <section className="py-20 md:py-32 bg-card relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-dark opacity-50" />
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Phone Icon */}
          <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-glow animate-pulse-glow">
            <Smartphone className="w-10 h-10 text-primary-foreground" />
          </div>

          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Get the
            <span className="text-gradient"> ScanGym App</span>
          </h2>

          <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
            Download our app and start your fitness journey today. Access 500+
            gyms across Pakistan with just one tap.
          </p>

          {/* Download Button */}
          <a
            href="https://play.google.com/store"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <Button variant="hero" size="xl" className="group gap-3">
              <Download className="w-5 h-5" />
              Download from Play Store
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default DownloadSection;
