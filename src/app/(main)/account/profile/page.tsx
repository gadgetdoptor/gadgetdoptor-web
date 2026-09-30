"use client";

import { useAuth } from "@/context/auth-context";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Mail, MapPin, Phone, ShieldCheck, User as UserIcon } from "lucide-react";
import { updateUserProfile } from "@/lib/actions";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountNav } from "@/components/account/account-nav";
import { LogoutButton } from "@/components/account/logout-button";
import { DistrictSelect } from "@/components/district-select";

export default function ProfilePage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    district: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phoneNumber: profile.phoneNumber || "",
        address: profile.address || "",
        district: profile.district || "",
      });
    }
  }, [user, profile, authLoading, router]);

  const initials = useMemo(() => {
    const f = formData.firstName?.trim()?.[0] || "";
    const l = formData.lastName?.trim()?.[0] || "";
    const combined = `${f}${l}`.toUpperCase();
    return combined || user?.email?.[0]?.toUpperCase() || "?";
  }, [formData.firstName, formData.lastName, user]);

  const fullName = useMemo(() => {
    const name = `${formData.firstName} ${formData.lastName}`.trim();
    return name || "Unnamed Customer";
  }, [formData.firstName, formData.lastName]);

  const completion = useMemo(() => {
    const fields = [
      formData.firstName,
      formData.lastName,
      formData.phoneNumber,
      formData.address,
      formData.district,
    ];
    const filled = fields.filter((f) => f && f.trim().length > 0).length;
    return Math.round((filled / fields.length) * 100);
  }, [formData]);

  const memberSince = useMemo(() => {
    const t = user?.metadata?.creationTime;
    if (!t) return null;
    return new Date(t).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [user]);

  if (authLoading) {
    return (
      <div className="container mx-auto pt-4 pb-20 px-4">
        <div className="mb-6">
          <Skeleton className="h-4 w-32 mb-4 rounded-lg" />
          <Skeleton className="h-8 w-48 rounded-lg" />
        </div>
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-[360px] w-full rounded-lg" />
        </div>
      </div>
    );
  }
  if (!user) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const result = await updateUserProfile(user.uid, formData);
      if (result.success) {
        await refreshProfile();
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container mx-auto pt-4 pb-20 px-4">
      <div className="mb-6">
        <Breadcrumb
          items={[
            { name: "Home", href: "/" },
            { name: "Account", href: "/account" },
            { name: "Profile", href: "/account/profile" },
          ]}
        />
      </div>

      <div className="space-y-4">
        <AccountNav />

        <div className="space-y-4">
          {/* Identity summary card */}
          <div className="rounded-lg border border-border bg-card p-4 md:p-5 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="h-14 w-14 shrink-0 rounded-lg bg-black flex items-center justify-center">
                <span className="text-white font-black text-lg italic">
                  {initials}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-black font-headline tracking-tight truncate">
                  {fullName}
                </h2>
                <p className="text-xs text-muted-foreground font-medium truncate mt-0.5">
                  {user.email}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                  {memberSince && (
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      Member since {memberSince}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified account
                  </span>
                </div>
              </div>

              <div className="sm:text-right shrink-0">
                <p className="text-[11px] font-semibold text-muted-foreground mb-1">
                  Profile completion
                </p>
                <div className="flex items-center gap-2 sm:justify-end">
                  <div className="h-1.5 w-28 rounded-lg bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-lg bg-orange-600 transition-all"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                  <span className="text-xs font-black">{completion}%</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Personal Information */}
              <div className="rounded-lg border border-border bg-card p-4 md:p-6 shadow-sm">
                <div className="mb-4 pb-3 border-b border-border flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg border border-border flex items-center justify-center shrink-0">
                    <UserIcon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black font-headline">
                      Personal information
                    </h2>
                    <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                      Your name as it appears on orders
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="text-xs font-bold text-muted-foreground"
                    >
                      First name
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="h-10 rounded-lg border-border focus-visible:ring-ring font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="lastName"
                      className="text-xs font-bold text-muted-foreground"
                    >
                      Last name
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="h-10 rounded-lg border-border focus-visible:ring-ring font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="rounded-lg border border-border bg-card p-4 md:p-6 shadow-sm">
                <div className="mb-4 pb-3 border-b border-border flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg border border-border flex items-center justify-center shrink-0">
                    <Phone className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black font-headline">
                      Contact details
                    </h2>
                    <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                      How we reach you about your orders
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-xs font-bold text-muted-foreground flex items-center gap-1.5"
                    >
                      <Mail className="h-3 w-3" />
                      Email address
                    </Label>
                    <Input
                      id="email"
                      value={user.email || ""}
                      disabled
                      className="h-10 rounded-lg border-border bg-muted text-muted-foreground cursor-not-allowed font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="phoneNumber"
                      className="text-xs font-bold text-muted-foreground flex items-center gap-1.5"
                    >
                      <Phone className="h-3 w-3" />
                      Phone number
                    </Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, phoneNumber: e.target.value })
                      }
                      placeholder="017********"
                      className="h-10 rounded-lg border-border focus-visible:ring-ring font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="rounded-lg border border-border bg-card p-4 md:p-6 shadow-sm">
              <div className="mb-4 pb-3 border-b border-border flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg border border-border flex items-center justify-center shrink-0">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h2 className="text-sm font-black font-headline">
                    Delivery address
                  </h2>
                  <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                    Used as your default shipping destination
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="district"
                    className="text-xs font-bold text-muted-foreground"
                  >
                    District
                  </Label>
                  <DistrictSelect
                    value={formData.district}
                    onChange={(value) =>
                      setFormData({ ...formData, district: value })
                    }
                    placeholder="Select district"
                    className="h-10 rounded-lg"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label
                    htmlFor="address"
                    className="text-xs font-bold text-muted-foreground"
                  >
                    Full shipping address
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="House #, Road #, Area..."
                    className="h-10 rounded-lg border-border focus-visible:ring-ring font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                disabled={isUpdating}
                className="h-11 px-8 rounded-lg bg-primary hover:bg-primary/90 font-bold text-xs text-primary-foreground transition-all w-full sm:w-auto"
              >
                {isUpdating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>

          {/* Account / Session */}
          <div className="rounded-lg border border-border bg-card p-4 md:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-sm font-black font-headline">
                  Account session
                </h2>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                  Sign out of your account on this device
                </p>
              </div>
              <LogoutButton className="w-auto justify-center rounded-lg px-6 h-10 text-xs" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
