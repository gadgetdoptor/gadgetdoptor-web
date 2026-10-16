"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException } from "@zxing/library";

interface BarcodeScannerProps {
  onScan: (value: string) => void;
  active: boolean;
}

// Live camera barcode/QR scanner. Mount only while `active` is true (e.g.
// inside an open dialog) so the camera stream is released when not in use.
export function BarcodeScanner({ onScan, active }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!active || !videoRef.current) return;

    const reader = new BrowserMultiFormatReader();
    let stopped = false;
    let controls: { stop: () => void } | undefined;

    reader
      .decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
        if (stopped) return;
        if (result) {
          onScan(result.getText());
        } else if (err && !(err instanceof NotFoundException)) {
          console.error("Barcode scan error:", err);
        }
      })
      .then((c) => { controls = c; })
      .catch((err) => {
        console.error("Camera init error:", err);
        setError("Could not access camera. Check browser permissions.");
      });

    return () => {
      stopped = true;
      controls?.stop();
    };
  }, [active, onScan]);

  if (error) {
    return <p className="text-sm text-red-600 text-center py-8">{error}</p>;
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[10px] bg-black">
      <video ref={videoRef} className="h-full w-full object-cover" muted />
      <div className="pointer-events-none absolute inset-6 border-2 border-white/70 rounded-md" />
    </div>
  );
}
