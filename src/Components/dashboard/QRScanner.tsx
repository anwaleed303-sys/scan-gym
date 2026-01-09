import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "../ui/button";
import {
  QrCode,
  Camera,
  X,
  CheckCircle2,
  MapPin,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../Contexts/AuthContext";
import { supabase } from "../../Integrations/client";

interface Gym {
  id: string;
  name: string;
  city: string;
  address: string | null;
}

const QRScanner = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedGym, setScannedGym] = useState<Gym | null>(null);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentCheckIns, setRecentCheckIns] = useState<any[]>([]);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRecentCheckIns();
    return () => {
      stopScanner();
    };
  }, []);

  const fetchRecentCheckIns = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("check_ins")
      .select(
        `
        id,
        checked_in_at,
        gyms (
          name,
          city
        )
      `
      )
      .eq("user_id", user.id)
      .order("checked_in_at", { ascending: false })
      .limit(5);

    if (!error && data) {
      setRecentCheckIns(data);
    }
  };

  const startScanner = async () => {
    try {
      setIsScanning(true);
      setScannedGym(null);
      setCheckInSuccess(false);

      // Wait for DOM to update
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (!containerRef.current) return;

      scannerRef.current = new Html5Qrcode("qr-reader");

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        () => {} // Ignore scan errors
      );
    } catch (err) {
      console.error("Failed to start scanner:", err);
      toast({
        title: "Camera Error",
        description:
          "Could not access camera. Please grant camera permissions.",
        variant: "destructive",
      });
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setIsScanning(false);
  };

  const onScanSuccess = async (decodedText: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    // Stop scanner immediately
    await stopScanner();

    // Look up the gym by QR code
    const { data: gym, error } = await supabase
      .from("gyms")
      .select("*")
      .eq("qr_code", decodedText)
      .maybeSingle();

    if (error || !gym) {
      toast({
        title: "Invalid QR Code",
        description:
          "This QR code is not recognized. Please scan a valid gym QR code.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    setScannedGym(gym);

    // Record the check-in
    if (user) {
      // Check if user already checked in to this gym today
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      ).toISOString();
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1
      ).toISOString();

      const { data: existingCheckIn } = await supabase
        .from("check_ins")
        .select("id")
        .eq("user_id", user.id)
        .eq("gym_id", gym.id)
        .gte("checked_in_at", startOfDay)
        .lt("checked_in_at", endOfDay)
        .maybeSingle();

      if (existingCheckIn) {
        toast({
          title: "Already Checked In",
          description: `You have already checked in to ${gym.name} today. One check-in per day is allowed.`,
          variant: "destructive",
        });
        setScannedGym(null);
        setIsProcessing(false);
        return;
      }

      const { error: checkInError } = await supabase.from("check_ins").insert({
        user_id: user.id,
        gym_id: gym.id,
      });

      if (checkInError) {
        toast({
          title: "Check-in Failed",
          description: checkInError.message,
          variant: "destructive",
        });
      } else {
        setCheckInSuccess(true);
        toast({
          title: "Check-in Successful! 🎉",
          description: `Welcome to ${gym.name}. Enjoy your workout!`,
        });
        fetchRecentCheckIns();
      }
    }

    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          QR Scanner
        </h2>
        <p className="text-muted-foreground">
          Scan the QR code at any partner gym to check in
        </p>
      </div>

      {/* Scanner Area */}
      <div className="bg-card rounded-xl p-6 border border-border">
        {!isScanning && !scannedGym && (
          <div className="text-center py-8">
            <div className="w-24 h-24 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <QrCode className="w-12 h-12 text-primary" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              Ready to Check In?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Point your camera at the gym's QR code to check in and start your
              workout.
            </p>
            <Button variant="hero" onClick={startScanner}>
              <Camera className="w-5 h-5 mr-2" />
              Open Scanner
            </Button>
          </div>
        )}

        {isScanning && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-foreground">
                Scanning...
              </h3>
              <Button variant="ghost" size="sm" onClick={stopScanner}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div
              ref={containerRef}
              id="qr-reader"
              className="rounded-xl overflow-hidden"
              style={{ width: "100%" }}
            />
            <p className="text-center text-muted-foreground text-sm">
              Position the QR code within the frame
            </p>
          </div>
        )}

        {scannedGym && (
          <div className="text-center py-6">
            {checkInSuccess ? (
              <>
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  You're Checked In!
                </h3>
                <div className="bg-muted rounded-xl p-4 mb-6 max-w-sm mx-auto">
                  <p className="font-display font-bold text-foreground text-lg">
                    {scannedGym.name}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mt-1">
                    <MapPin className="w-4 h-4" />
                    {scannedGym.city}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mt-1">
                    <Clock className="w-4 h-4" />
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setScannedGym(null);
                    setCheckInSuccess(false);
                  }}
                >
                  Done
                </Button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-destructive" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  Check-in Failed
                </h3>
                <Button variant="outline" onClick={() => setScannedGym(null)}>
                  Try Again
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Recent Check-ins */}
      {recentCheckIns.length > 0 && (
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="font-display text-lg font-bold text-foreground mb-4">
            Recent Check-ins
          </h3>
          <div className="space-y-3">
            {recentCheckIns.map((checkIn) => (
              <div
                key={checkIn.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {checkIn.gyms?.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {checkIn.gyms?.city}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-foreground text-sm">
                    {new Date(checkIn.checked_in_at).toLocaleDateString()}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(checkIn.checked_in_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-muted rounded-xl p-6">
        <h3 className="font-display font-bold text-foreground mb-3">
          How to Check In
        </h3>
        <ol className="space-y-2 text-muted-foreground text-sm">
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold shrink-0">
              1
            </span>
            Visit any ScanGym partner gym
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold shrink-0">
              2
            </span>
            Find the QR code at the entrance
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold shrink-0">
              3
            </span>
            Open the scanner and point at the code
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold shrink-0">
              4
            </span>
            Show confirmation to gym staff and enjoy your workout!
          </li>
        </ol>
      </div>
    </div>
  );
};

export default QRScanner;
