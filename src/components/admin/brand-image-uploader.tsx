"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { uploadImage } from "@/lib/actions";

type BrandImageUploaderProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  disabled?: boolean;
};

export function BrandImageUploader({ label, value, onChange, hint, disabled }: BrandImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadImage(formData);
      if (result.success && result.url) {
        onChange(result.url);
        toast.success(`${label} uploaded`);
      } else {
        toast.error(result.message || `Failed to upload ${label.toLowerCase()}`);
      }
    } catch (error) {
      toast.error(`Failed to upload ${label.toLowerCase()}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{label}</label>
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 border border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden">
          {value ? (
            <Image src={value} alt={label} fill className="object-contain p-2" />
          ) : (
            <Upload className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-[10px] h-9 text-xs font-bold uppercase tracking-widest"
              disabled={disabled || isUploading}
              onClick={() => inputRef.current?.click()}
            >
              {isUploading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-2 h-3.5 w-3.5" />}
              {value ? "Replace" : "Upload"}
            </Button>
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-[10px] h-9 text-xs font-bold uppercase tracking-widest text-destructive hover:text-destructive"
                disabled={disabled || isUploading}
                onClick={() => onChange("")}
              >
                <X className="mr-1 h-3.5 w-3.5" />
                Remove
              </Button>
            )}
          </div>
          {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp, image/x-icon, image/svg+xml"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
        />
      </div>
    </div>
  );
}
