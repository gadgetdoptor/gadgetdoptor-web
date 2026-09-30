"use client";

import { useAuth } from "@/context/auth-context";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Package, ArrowRight } from "lucide-react";
import { getUserOrders } from "@/lib/actions";
import useSWR from "swr";
import { OrdersSkeleton } from "@/components/account/orders-skeleton";
import { AccountNav } from "@/components/account/account-nav";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function OrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    // Use SWR for caching and automatic revalidation
    const {
        data: orders = [],
        isLoading: isLoadingOrders
    } = useSWR(
        user ? [`orders`, user.uid] : null,
        ([, uid]) => getUserOrders(uid),
        {
            revalidateOnFocus: true,
            dedupingInterval: 5000,
        }
    );

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    if (authLoading) return <OrdersSkeleton />;
    if (!user) return null;

    return (
        <div className="container mx-auto pt-4 pb-20 px-4">
            <div className="mb-6">
                <Breadcrumb
                    items={[
                        { name: "Home", href: "/" },
                        { name: "Account", href: "/account" },
                        { name: "Orders", href: "/account/orders" }
                    ]}
                />
            </div>

            <div className="space-y-4">
                <AccountNav />

                <div className="space-y-4">
                    {isLoadingOrders && orders.length === 0 ? (
                        <OrdersSkeleton />
                    ) : orders.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-border p-20 text-center bg-muted">
                            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                            <h2 className="text-lg font-bold font-headline">No orders yet</h2>
                            <p className="text-muted-foreground text-sm mb-8 mt-2">When you place an order, it will appear here.</p>
                            <Link href="/shop" className="rounded-lg px-8 py-4 bg-primary text-primary-foreground font-bold text-xs inline-flex items-center gap-2">
                                Start Shopping <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {orders.map((order: any) => (
                                <Link
                                    key={order.id}
                                    href={`/account/orders/${order.orderNumber}`}
                                    className="rounded-lg p-4 md:p-6 border border-border bg-card hover:border-foreground transition-all group block shadow-sm"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <p className="font-mono font-black text-lg group-hover:text-orange-600 transition-colors tracking-tighter">#{order.orderNumber}</p>
                                                <div className={cn(
                                                    "rounded-lg px-3 py-1 text-[10px] font-black capitalize",
                                                    order.orderStatus === 'delivered' ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground"
                                                )}>
                                                    {order.orderStatus}
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground font-medium">
                                                Placed on {format(new Date(order.createdAt), "MMMM d, yyyy")}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between md:text-right gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-muted-foreground">Total Amount</p>
                                                <p className="font-black text-lg tracking-tight">Tk {order.totalAmount}</p>
                                            </div>
                                            <div className="rounded-lg h-10 w-10 flex items-center justify-center border border-border group-hover:bg-primary group-hover:text-primary-foreground transition-colors ml-4">
                                                <ArrowRight className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
                                        {order.items.slice(0, 3).map((item: any, idx: number) => (
                                            <div key={idx} className="rounded-lg h-10 w-10 border border-border bg-muted p-1 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                                                {item.productId ? '📦' : ''}
                                            </div>
                                        ))}
                                        {order.items.length > 3 && (
                                            <div className="rounded-lg h-10 px-3 border border-border bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                                +{order.items.length - 3} More items
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
