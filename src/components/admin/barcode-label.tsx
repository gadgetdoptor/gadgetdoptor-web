"use client";

import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import type { Product } from "@/lib/types";
import { Printer, Search, X, Package } from "lucide-react";
import { useSiteSettings } from "@/context/settings-context";
import { searchProducts } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";

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

interface SheetItem {
    product: Product;
    quantity: number;
}

export function BarcodeLabel({ product }: { product: Product }) {
    const settings = useSiteSettings();
    const [items, setItems] = useState<SheetItem[]>(
        product.barcode ? [{ product, quantity: 1 }] : []
    );
    const [showPrice, setShowPrice] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);

    const handlePrint = () => window.print();

    const handleSearch = async (val: string) => {
        setSearchTerm(val);
        if (val.length < 1) {
            setSearchResults([]);
            return;
        }
        const results = await searchProducts(val, 8, "all");
        setSearchResults(results);
    };

    const addProduct = (p: any) => {
        setSearchTerm("");
        setSearchResults([]);
        if (!p.barcode) {
            return;
        }
        setItems((prev) => {
            const existing = prev.find((i) => i.product.id === p.id);
            if (existing) {
                return prev.map((i) =>
                    i.product.id === p.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { product: p, quantity: 1 }];
        });
    };

    const updateQuantity = (id: string, quantity: number) => {
        setItems((prev) =>
            prev.map((i) => (i.product.id === id ? { ...i, quantity: Math.max(1, Math.min(200, quantity)) } : i))
        );
    };

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((i) => i.product.id !== id));
    };

    const totalLabels = items.reduce((sum, i) => sum + i.quantity, 0);

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
            <div className="max-w-3xl mx-auto mb-6 px-4 print:hidden space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => window.history.back()}
                            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        >
                            ← Back
                        </button>
                        <h1 className="text-xs font-black uppercase tracking-widest text-muted-foreground italic border-l border-border pl-4">
                            Barcode <span className="text-orange-600">Labels</span>
                        </h1>
                    </div>
                    <button
                        onClick={handlePrint}
                        disabled={totalLabels === 0}
                        className="bg-primary text-primary-foreground px-4 py-2 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg disabled:opacity-50"
                    >
                        <Printer className="h-3 w-3" /> Print {totalLabels > 0 && `(${totalLabels})`}
                    </button>
                </div>

                {/* Add product search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, SKU or barcode to add another product..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    {searchResults.length > 0 && (
                        <Card className="absolute top-full left-0 right-0 mt-1 rounded-[12px] border-border shadow-2xl max-h-[300px] overflow-y-auto bg-card py-1 z-[200]">
                            {searchResults.map((p) => (
                                <div
                                    key={p.id}
                                    className={`p-2 flex items-center justify-between gap-3 border-b border-border last:border-0 ${p.barcode ? "hover:bg-muted cursor-pointer" : "opacity-50"}`}
                                    onClick={() => addProduct(p)}
                                >
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-black uppercase tracking-tight truncate">{p.name}</p>
                                        <p className="text-[9px] text-muted-foreground">
                                            {p.barcode ? `Barcode: ${p.barcode}` : "No barcode set"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </Card>
                    )}
                </div>

                {/* Items list */}
                {items.length > 0 && (
                    <div className="space-y-2">
                        {items.map((item) => (
                            <div key={item.product.id} className="flex items-center gap-3 border border-border rounded-[10px] p-2 bg-card">
                                <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                                <p className="text-xs font-bold flex-1 truncate">{item.product.name}</p>
                                <Input
                                    type="number"
                                    min={1}
                                    max={200}
                                    value={item.quantity}
                                    onChange={(e) => updateQuantity(item.product.id, Number(e.target.value) || 1)}
                                    className="w-20 h-8 text-center"
                                />
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => removeItem(item.product.id)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <Switch checked={showPrice} onCheckedChange={setShowPrice} />
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Show price on labels
                    </label>
                </div>

                {items.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        No products added yet. Search above to add products with a barcode, or go back and set one first.
                    </p>
                )}
            </div>

            {/* Label Sheet */}
            <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-3 px-4 print:px-0 print:gap-2">
                {items.flatMap((item) =>
                    Array.from({ length: item.quantity }).map((_, i) => (
                        <div
                            key={`${item.product.id}-${i}`}
                            className="flex flex-col items-center justify-center gap-1 border border-dashed border-border rounded-md bg-card p-3 print:border-solid"
                        >
                            <p className="text-[10px] font-black uppercase tracking-tight text-center leading-tight line-clamp-2">
                                {item.product.name}
                            </p>
                            <Barcode value={item.product.barcode!} />
                            {showPrice && (
                                <p className="text-sm font-black text-orange-600">
                                    Tk {Number(item.product.price).toFixed(0)}
                                </p>
                            )}
                            <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
                                {settings.siteName}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
