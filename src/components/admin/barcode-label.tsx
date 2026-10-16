"use client";

import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import type { Product } from "@/lib/types";
import { Printer } from "lucide-react";
import { useSiteSettings } from "@/context/settings-context";

function Barcode({ value }: { value: string }) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current) return;
        JsBarcode(svgRef.current, value, {
            format: value.length <= 12 ? "upc" : "ean13",
            width: 2,
            height: 50,
            fontSize: 14,
            margin: 0,
        });
    }, [value]);

    return <svg ref={svgRef} />;
}

export function BarcodeLabel({ product }: { product: Product }) {
    const settings = useSiteSettings();
    const [copies, setCopies] = useState(1);

    const handlePrint = () => window.print();

    if (!product.barcode) {
        return (
            <div className="p-20 text-center font-bold uppercase tracking-widest text-muted-foreground">
                This product has no barcode yet. Add one from the product edit page first.
            </div>
        );
    }

    return (
        <div className="bg-muted py-6 print:bg-white print:py-0 min-h-screen print:min-h-0">
            <style>
                {`
                    @media print {
                        @page { margin: 0.5cm; size: auto; }
                        html, body { margin: 0 !important; padding: 0 !important; }
                        header, footer, nav { display: none !important; }
                    }
                `}
            </style>

            {/* Control Panel (Hidden on Print) */}
            <div className="max-w-3xl mx-auto mb-6 flex justify-between items-center px-4 print:hidden">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => window.history.back()}
                        className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                        ← Back
                    </button>
                    <h1 className="text-xs font-black uppercase tracking-widest text-muted-foreground italic border-l border-border pl-4">
                        Barcode <span className="text-orange-600">Label</span>
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Copies
                    </label>
                    <input
                        type="number"
                        min={1}
                        max={100}
                        value={copies}
                        onChange={(e) => setCopies(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                        className="w-16 border border-border rounded-md px-2 py-1 text-sm font-bold"
                    />
                    <button
                        onClick={handlePrint}
                        className="bg-primary text-primary-foreground px-4 py-2 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg"
                    >
                        <Printer className="h-3 w-3" /> Print
                    </button>
                </div>
            </div>

            {/* Label Sheet */}
            <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-3 px-4 print:px-0 print:gap-2">
                {Array.from({ length: copies }).map((_, i) => (
                    <div
                        key={i}
                        className="flex flex-col items-center justify-center gap-1 border border-dashed border-border rounded-md bg-card p-3 print:border-solid"
                    >
                        <p className="text-[10px] font-black uppercase tracking-tight text-center leading-tight line-clamp-2">
                            {product.name}
                        </p>
                        <Barcode value={product.barcode!} />
                        <p className="text-sm font-black text-orange-600">
                            Tk {Number(product.price).toFixed(0)}
                        </p>
                        <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
                            {settings.siteName}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
