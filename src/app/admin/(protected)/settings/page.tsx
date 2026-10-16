"use client";

import { useState, useEffect, useTransition } from "react";
import { getSettings, updateSettings } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Store,
  Phone,
  Mail,
  MapPin,
  Globe,
  Share2,
  Search,
  Save,
  Loader2,
} from "lucide-react";
import { DeliveryLocationsManager } from "@/components/admin/delivery-locations-manager";
import { BrandImageUploader } from "@/components/admin/brand-image-uploader";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [localValues, setLocalValues] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      const data = await getSettings();
      setSettings(data);
      const values: Record<string, string> = {};
      data.forEach((s) => (values[s.key] = s.value));
      setLocalValues(values);
    }
    load();
  }, []);

  const handleChange = (key: string, value: string) => {
    setLocalValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const updateData = Object.entries(localValues).map(([key, value]) => ({
      key,
      value,
    }));
    startTransition(async () => {
      const result = await updateSettings(updateData);
      if (result.success) {
        toast.success("Settings synchronized successfully");
      } else {
        toast.error(result.message);
      }
    });
  };

  const renderField = (
    key: string,
    label: string,
    icon: any,
    placeholder: string,
    type: "input" | "textarea" = "input",
  ) => {
    const Icon = icon;
    return (
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
          {label}
        </label>
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          )}
          {type === "input" ? (
            <Input
              value={localValues[key] || ""}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={placeholder}
              className={`rounded-[10px] ${Icon ? "pl-10" : ""} h-12 border-border focus-visible:ring-ring font-medium`}
            />
          ) : (
            <Textarea
              value={localValues[key] || ""}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={placeholder}
              className="rounded-[10px] h-32 border-border focus-visible:ring-ring font-medium"
            />
          )}
        </div>
      </div>
    );
  };

  const SaveButton = (
    <div className="flex justify-end">
      <Button
        onClick={handleSave}
        disabled={isPending}
        className="w-full sm:w-auto rounded-[10px] bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-7 font-bold text-sm"
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Save changes
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold font-headline tracking-tight">
          Shop configuration
        </h1>
        <p className="text-muted-foreground text-xs font-bold tracking-tight">
          Central control for global branding & operations.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full gap-0">
        <TabsList
          variant="line"
          className="w-full flex justify-start gap-1 overflow-x-auto no-scrollbar border-b border-border bg-transparent p-0 group-data-[orientation=horizontal]/tabs:h-auto"
        >
          <TabsTrigger
            value="general"
            className="flex-none shrink-0 gap-2 rounded-none border-0 px-4 py-3.5 text-sm font-semibold text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-orange-600 data-[state=active]:shadow-none group-data-[orientation=horizontal]/tabs:after:h-[3px] after:rounded-full after:bg-orange-600 hover:text-foreground"
          >
            <Store className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger
            value="contact"
            className="flex-none shrink-0 gap-2 rounded-none border-0 px-4 py-3.5 text-sm font-semibold text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-orange-600 data-[state=active]:shadow-none group-data-[orientation=horizontal]/tabs:after:h-[3px] after:rounded-full after:bg-orange-600 hover:text-foreground"
          >
            <Search className="h-4 w-4" />
            Contact & SEO
          </TabsTrigger>
          <TabsTrigger
            value="social"
            className="flex-none shrink-0 gap-2 rounded-none border-0 px-4 py-3.5 text-sm font-semibold text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-orange-600 data-[state=active]:shadow-none group-data-[orientation=horizontal]/tabs:after:h-[3px] after:rounded-full after:bg-orange-600 hover:text-foreground"
          >
            <Share2 className="h-4 w-4" />
            Social Media
          </TabsTrigger>
          <TabsTrigger
            value="shipping"
            className="flex-none shrink-0 gap-2 rounded-none border-0 px-4 py-3.5 text-sm font-semibold text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-orange-600 data-[state=active]:shadow-none group-data-[orientation=horizontal]/tabs:after:h-[3px] after:rounded-full after:bg-orange-600 hover:text-foreground"
          >
            <MapPin className="h-4 w-4" />
            Shipping
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-6">
          <Card className="rounded-[16px] border-border shadow-none">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg font-bold tracking-tight">
                Site identity
              </CardTitle>
              <CardDescription className="text-xs font-medium tracking-normal">
                Primary branding settings visible to all users.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderField(
                "site_name",
                "Shop Name",
                Store,
                "e.g. Gadget Doptor",
              )}
              {renderField(
                "site_tagline",
                "Shop Tagline",
                Globe,
                "e.g. Best price in Bangladesh",
              )}
              <BrandImageUploader
                label="Logo"
                value={localValues.site_logo || ""}
                onChange={(url) => handleChange("site_logo", url)}
                hint="Shown in the header, footer, and login screens."
              />
              <BrandImageUploader
                label="Favicon"
                value={localValues.favicon || ""}
                onChange={(url) => handleChange("favicon", url)}
                hint="Shown in the browser tab. Square image recommended."
              />
            </CardContent>
          </Card>
          {SaveButton}
        </TabsContent>

        <TabsContent value="contact" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-[16px] border-border shadow-none">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-lg font-bold tracking-tight">
                  Contact information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {renderField(
                  "contact_phone",
                  "Phone Number",
                  Phone,
                  "+880 1XXX-XXXXXX",
                )}
                {renderField(
                  "contact_whatsapp",
                  "WhatsApp Number",
                  Share2,
                  "+880 1XXX-XXXXXX",
                )}
                {renderField(
                  "contact_email",
                  "Support Email",
                  Mail,
                  "support@gadgetdoptor.com",
                )}
                {renderField(
                  "contact_address",
                  "Physical Address",
                  MapPin,
                  "Dhaka, Bangladesh",
                  "textarea",
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[16px] border-border shadow-none">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-lg font-bold tracking-tight">
                  Global SEO
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {renderField(
                  "seo_meta_title",
                  "Home Meta Title",
                  Search,
                  "Gadget Doptor | Premium E-commerce",
                )}
                {renderField(
                  "seo_meta_description",
                  "Home Meta Description",
                  null,
                  "Gadget Doptor description...",
                  "textarea",
                )}
                {renderField(
                  "seo_keywords",
                  "Global Keywords",
                  null,
                  "ecommerce, gadgets, dhaka",
                  "textarea",
                )}
              </CardContent>
            </Card>
          </div>
          {SaveButton}
        </TabsContent>

        <TabsContent value="social" className="mt-6 space-y-6">
          <Card className="rounded-[16px] border-border shadow-none">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-lg font-bold tracking-tight">
                Social connectivity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderField(
                "social_facebook",
                "Facebook Page",
                Share2,
                "https://facebook.com/...",
              )}
              {renderField(
                "social_instagram",
                "Instagram Profile",
                Share2,
                "https://instagram.com/...",
              )}
              {renderField(
                "social_youtube",
                "YouTube Channel",
                Share2,
                "https://youtube.com/...",
              )}
              {renderField(
                "social_tiktok",
                "TikTok Profile",
                Share2,
                "https://tiktok.com/@...",
              )}
            </CardContent>
          </Card>
          {SaveButton}
        </TabsContent>

        <TabsContent value="shipping" className="mt-6 space-y-6">
          <Card className="rounded-[16px] border-border shadow-none">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-lg font-bold tracking-tight">
                Delivery locations & charges
              </CardTitle>
              <CardDescription className="text-xs font-medium tracking-normal">
                Manage the delivery locations and fees shown to customers at
                checkout.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <DeliveryLocationsManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
