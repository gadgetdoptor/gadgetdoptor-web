"use client";

import { useAuth } from "@/context/auth-context";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import useSWR from "swr";
import { getUserOrders } from "@/lib/actions";
import {
    Package,
    User,
    Wallet,
    Clock,
    CheckCircle2,
    ArrowRight,
    MapPin,
    Headset,
    ShoppingBag,
    Sparkles,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountNav } from "@/components/account/account-nav";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function AccountPage() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    const { data: orders = [], isLoading: ordersLoading } = useSWR(
        user ? [`orders`, user.uid] : null,
        ([, uid]) => getUserOrders(uid),
        {
            revalidateOnFocus: true,
            dedupingInterval: 5000,
        }
    );

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    const stats = useMemo(() => {
        const totalOrders = orders.length;
        const activeOrders = orders.filter((o: any) =>
            ["pending", "processing", "shipped"].includes(o.orderStatus)
        ).length;
        const deliveredOrders = orders.filter(
            (o: any) => o.orderStatus === "delivered"
        ).length;
        const totalSpent = orders
            .filter((o: any) => o.orderStatus !== "cancelled")
            .reduce((sum: number, o: any) => sum + Number(o.totalAmount || 0), 0);
        return { totalOrders, activeOrders, deliveredOrders, totalSpent };
    }, [orders]);

    const profileCompletion = useMemo(() => {
        if (!profile) return 0;
        const fields = [
            profile.firstName,
            profile.lastName,
            profile.phoneNumber,
            profile.address,
            profile.district,
        ];
        const filled = fields.filter((f) => f && String(f).trim().length > 0).length;
        return Math.round((filled / fields.length) * 100);
    }, [profile]);

    const recentOrders = orders.slice(0, 3);

    if (loading) {
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
                <div className="space-y-6">
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-24 w-full rounded-lg" />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Skeleton className="h-72 w-full rounded-lg lg:col-span-2" />
                        <Skeleton className="h-72 w-full rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const statCards = [
        {
            label: "Total Orders",
            value: stats.totalOrders,
            icon: ShoppingBag,
            color: "text-blue-600",
        },
        {
            label: "In Progress",
            value: stats.activeOrders,
            icon: Clock,
            color: "text-orange-600",
        },
        {
            label: "Delivered",
            value: stats.deliveredOrders,
            icon: CheckCircle2,
            color: "text-green-600",
        },
        {
            label: "Total Spent",
            value: `Tk ${stats.totalSpent.toLocaleString()}`,
            icon: Wallet,
            color: "text-purple-600",
        },
    ];

    const quickActions = [
        { name: "Track an order", href: "/track-order", icon: MapPin },
        { name: "Browse products", href: "/product", icon: Package },
        { name: "Update profile", href: "/account/profile", icon: User },
        { name: "Contact support", href: "/contact", icon: Headset },
    ];

    return (
        <div className="container mx-auto pt-4 pb-20 px-4">
            <div className="mb-6">
                <Breadcrumb
                    items={[
                        { name: "Home", href: "/" },
                        { name: "Account", href: "/account" },
                    ]}
                />
            </div>

            <div className="space-y-6">
                <AccountNav />

                {/* Welcome banner */}
                <div className="rounded-lg border border-border p-6 md:p-8 bg-muted relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <User className="h-32 w-32 -mr-10 -mt-10" />
                    </div>
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold font-headline mb-2">
                                Welcome back
                                {profile?.firstName ? `, ${profile.firstName}` : ""}!
                            </h2>
                            <p className="text-sm text-muted-foreground max-w-2xl">
                                Here&apos;s a quick look at your{" "}
                                <Link
                                    href="/account/orders"
                                    className="text-orange-600 font-bold underline underline-offset-4 decoration-2"
                                >
                                    recent orders
                                </Link>
                                , account activity, and{" "}
                                <Link
                                    href="/account/profile"
                                    className="text-orange-600 font-bold underline underline-offset-4 decoration-2"
                                >
                                    shipping details
                                </Link>
                                .
                            </p>
                        </div>
                        <Link
                            href="/product"
                            className="w-full sm:w-auto lg:shrink-0 inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-bold text-xs px-6 py-3 hover:bg-primary/90 transition-colors"
                        >
                            Shop now <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-lg border border-border bg-card p-5"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-muted-foreground">
                                    {stat.label}
                                </span>
                                <stat.icon className={cn("h-4 w-4", stat.color)} />
                            </div>
                            {ordersLoading ? (
                                <Skeleton className="h-7 w-16 rounded-lg" />
                            ) : (
                                <p className="text-2xl font-black tracking-tight">
                                    {stat.value}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Profile completion nudge */}
                {profileCompletion < 100 && (
                    <Link
                        href="/account/profile"
                        className="rounded-lg border border-dashed border-orange-300 bg-orange-50 dark:bg-orange-950/20 p-4 flex items-center justify-between gap-4 hover:border-orange-400 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center shrink-0">
                                <Sparkles className="h-4 w-4 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold">
                                    Your profile is {profileCompletion}% complete
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Add your delivery details for faster checkout next time
                                </p>
                            </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-orange-600 shrink-0 group-hover:translate-x-1 transition-transform" />
                    </Link>
                )}

                {/* Recent orders + quick actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 rounded-lg border border-border bg-card p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold text-sm">Recent Orders</h3>
                            <Link
                                href="/account/orders"
                                className="text-xs font-bold text-orange-600 inline-flex items-center gap-1 hover:gap-1.5 transition-all"
                            >
                                View all <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>

                        {ordersLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                                ))}
                            </div>
                        ) : recentOrders.length === 0 ? (
                            <div className="text-center py-10">
                                <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                                <p className="text-sm font-medium text-muted-foreground">
                                    You haven&apos;t placed any orders yet.
                                </p>
                                <Link
                                    href="/product"
                                    className="inline-flex items-center gap-2 mt-4 text-xs font-bold text-orange-600"
                                >
                                    Start shopping <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentOrders.map((order: any) => (
                                    <Link
                                        key={order.id}
                                        href={`/account/orders/${order.orderNumber}`}
                                        className="flex items-center justify-between gap-4 rounded-lg border border-border p-4 hover:border-foreground transition-all group"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-mono font-black text-sm truncate">
                                                    #{order.orderNumber}
                                                </p>
                                                <span
                                                    className={cn(
                                                        "rounded-lg px-2 py-0.5 text-[10px] font-black capitalize shrink-0",
                                                        order.orderStatus === "delivered"
                                                            ? "bg-green-50 text-green-700"
                                                            : order.orderStatus === "cancelled"
                                                                ? "bg-red-50 text-red-700"
                                                                : "bg-muted text-muted-foreground"
                                                    )}
                                                >
                                                    {order.orderStatus}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground font-medium mt-1">
                                                {format(new Date(order.createdAt), "MMMM d, yyyy")}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0 flex items-center gap-3">
                                            <p className="font-black text-sm tracking-tight">
                                                Tk {order.totalAmount}
                                            </p>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-lg border border-border bg-card p-6">
                        <h3 className="font-bold text-sm mb-5">Quick Actions</h3>
                        <div className="space-y-2">
                            {quickActions.map((action) => (
                                <Link
                                    key={action.href}
                                    href={action.href}
                                    className="flex items-center gap-3 rounded-lg border border-border p-3 hover:border-foreground hover:bg-muted/50 transition-all group"
                                >
                                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-background transition-colors">
                                        <action.icon className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-bold flex-1">
                                        {action.name}
                                    </span>
                                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
