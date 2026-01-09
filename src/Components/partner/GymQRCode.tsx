import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Download, Printer, QrCode } from "lucide-react";

interface GymQRCodeProps {
  gymName: string;
  qrCode: string;
}

const GymQRCode = ({ gymName, qrCode }: GymQRCodeProps) => {
  const [open, setOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setPreviewUrl(null);
      return;
    }

    let cancelled = false;

    QRCode.toDataURL(qrCode, {
      width: 240,
      margin: 1,
      errorCorrectionLevel: "H",
    })
      .then((url) => {
        if (!cancelled) setPreviewUrl(url);
      })
      .catch(() => {
        if (!cancelled) setPreviewUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [open, qrCode]);

  const handleDownload = async () => {
    const url = await QRCode.toDataURL(qrCode, {
      width: 800,
      margin: 2,
      errorCorrectionLevel: "H",
    });

    const downloadLink = document.createElement("a");
    downloadLink.download = `${gymName.replace(/\s+/g, "-")}-QR.png`;
    downloadLink.href = url;
    downloadLink.click();
  };

  const handlePrint = async () => {
    const url = await QRCode.toDataURL(qrCode, {
      width: 600,
      margin: 2,
      errorCorrectionLevel: "H",
    });

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${gymName}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: system-ui, -apple-system, sans-serif;
              background: #fff;
              color: #111;
            }
            .container {
              text-align: center;
              padding: 40px;
            }
            h1 {
              font-size: 24px;
              margin: 0 0 8px;
            }
            p {
              color: #555;
              margin: 0 0 24px;
            }
            .qr {
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              padding: 20px;
              display: inline-block;
              background: #fff;
            }
            .code {
              margin-top: 16px;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
              font-size: 14px;
              color: #555;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${gymName}</h1>
            <p>Scan to check in</p>
            <div class="qr">
              <img src="${url}" alt="Gym QR code" width="320" height="320" />
            </div>
            <div class="code">${qrCode}</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <QrCode className="w-4 h-4" />
          View QR
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{gymName}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          <div className="rounded-xl border border-border bg-card p-6">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={`Gym QR code for ${gymName}`}
                width={240}
                height={240}
                className="h-60 w-60"
                loading="lazy"
              />
            ) : (
              <div className="h-60 w-60 rounded-lg bg-muted animate-pulse" />
            )}
          </div>

          <p className="text-sm text-muted-foreground font-mono">{qrCode}</p>

          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleDownload}
              disabled={!open}
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button
              variant="default"
              className="flex-1 gap-2"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GymQRCode;
