import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DollarSign,
    ShoppingCart,
    Users,
    Receipt,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Package,
} from "lucide-react";
import { getReportsData } from "@/lib/actions";
import { RevenueTrendChart } from "@/components/admin/revenue-trend-chart";

export const dynamic = 'force-dynamic';

const STATUS_STYLES: Record<string, string> = {
    pending: "bg-yellow-500",
    processing: "bg-blue-500",
    shipped: "bg-indigo-500",
    delivered: "bg-green-500",
    cancelled: "bg-red-500",
};

const PAYMENT_LABELS: Record<string, string> = {
    cod: "Cash on Delivery",
    bkash: "bKash",
    nagad: "Nagad",
    card: "Card",
};

export default async function ReportsPage() {
    const { stats, revenueTrend, orderStatusBreakdown, paymentMethodBreakdown, topProducts, topCategories } = await getReportsData(30);

    const statCards = [
        {
            title: "Total revenue",
            value: `৳${stats.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            description: "From paid orders, all time",
            color: "text-green-600",
        },
        {
            title: "Paid orders",
            value: stats.totalOrders.toLocaleString(),
            icon: ShoppingCart,
            description: "Successfully paid transactions",
            color: "text-blue-600",
        },
        {
            title: "Avg. order value",
            value: `৳${stats.avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            icon: Receipt,
            description: "Revenue per paid order",
            color: "text-orange-600",
        },
        {
            title: "Customers",
            value: stats.totalCustomers.toLocaleString(),
            icon: Users,
            description: "Registered user base",
            color: "text-muted-foreground",
        },
    ];

    const maxStatusCount = Math.max(1, ...orderStatusBreakdown.map(s => s.count));
    const maxPaymentTotal = Math.max(1, ...paymentMethodBreakdown.map(p => p.total));
    const maxCategoryRevenue = Math.max(1, ...topCategories.map(c => c.revenue));

    const isGrowthPositive = stats.revenueGrowth >= 0;

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-xl font-bold font-headline tracking-tight">Reports</h1>
                <p className="text-muted-foreground text-xs">Sales performance, inventory health, and customer trends across your store.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <Card key={stat.title} className="rounded-[16px] border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-[11px] font-bold tracking-normal text-muted-foreground">{stat.title}</CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color} opacity-40`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black tracking-tight">{stat.value}</div>
                            <p className="text-[11px] text-muted-foreground mt-1 tracking-normal">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-7">
                <Card className="lg:col-span-5 rounded-[16px] border-border overflow-hidden min-w-0">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-bold tracking-normal">Revenue trend</CardTitle>
                            <CardDescription className="text-xs font-medium tracking-normal text-muted-foreground">Paid order revenue over the last 30 days</CardDescription>
                        </div>
                        <Badge
                            variant="outline"
                            className={`gap-1 rounded-full text-[10px] font-bold uppercase ${isGrowthPositive ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
                        >
                            {isGrowthPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {Math.abs(stats.revenueGrowth).toFixed(1)}% vs last month
                        </Badge>
                    </CardHeader>
                    <CardContent className="pl-2 pr-4">
                        <div className="h-[320px] w-full min-w-0">
                            {revenueTrend.length > 0 ? (
                                <RevenueTrendChart data={revenueTrend} />
                            ) : (
                                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                                    No paid orders in this period yet.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2 rounded-[16px] border-border overflow-hidden min-w-0">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold tracking-normal">Order status</CardTitle>
                        <CardDescription className="text-xs font-medium tracking-normal text-muted-foreground">Distribution across all orders</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        {orderStatusBreakdown.length > 0 ? orderStatusBreakdown.map((item) => (
                            <div key={item.status} className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold capitalize tracking-normal">{item.status}</span>
                                    <span className="text-muted-foreground font-semibold">{item.count}</span>
                                </div>
                                <Progress
                                    value={(item.count / maxStatusCount) * 100}
                                    className="h-1.5"
                                    indicatorClassName={STATUS_STYLES[item.status] || "bg-primary"}
                                />
                            </div>
                        )) : (
                            <p className="text-xs text-muted-foreground">No orders yet.</p>
                        )}

                        {stats.lowStockCount > 0 && (
                            <div className="mt-2 flex items-center gap-2 rounded-[12px] bg-orange-50 border border-orange-200 p-3">
                                <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0" />
                                <p className="text-[11px] font-semibold text-orange-700 leading-tight">
                                    {stats.lowStockCount} product{stats.lowStockCount > 1 ? "s" : ""} running low on stock (≤ 5 units)
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-7">
                <Card className="lg:col-span-4 rounded-[16px] border-border overflow-hidden min-w-0">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold tracking-normal">Top selling products</CardTitle>
                        <CardDescription className="text-xs font-medium tracking-normal text-muted-foreground">Ranked by revenue from paid orders</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {topProducts.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Product</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase text-muted-foreground text-right">Units sold</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase text-muted-foreground text-right">Revenue</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topProducts.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="flex items-center gap-3 py-3">
                                                {product.image ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={product.image} alt={product.name} className="h-9 w-9 rounded-[8px] object-cover border border-border shrink-0" />
                                                ) : (
                                                    <div className="h-9 w-9 rounded-[8px] bg-muted flex items-center justify-center shrink-0">
                                                        <Package className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <span className="font-semibold text-xs line-clamp-2">{product.name}</span>
                                            </TableCell>
                                            <TableCell className="text-right text-xs font-medium">{product.quantitySold}</TableCell>
                                            <TableCell className="text-right text-xs font-bold">৳{product.revenue.toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-xs text-muted-foreground py-4">No sales data yet.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 rounded-[16px] border-border overflow-hidden min-w-0">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold tracking-normal">Top categories</CardTitle>
                        <CardDescription className="text-xs font-medium tracking-normal text-muted-foreground">Revenue share by category</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        {topCategories.length > 0 ? topCategories.map((category) => (
                            <div key={category.id} className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold tracking-normal">{category.name}</span>
                                    <span className="text-muted-foreground font-semibold">৳{category.revenue.toLocaleString()}</span>
                                </div>
                                <Progress value={(category.revenue / maxCategoryRevenue) * 100} className="h-1.5" />
                                <span className="text-[10px] text-muted-foreground">{category.unitsSold} units sold</span>
                            </div>
                        )) : (
                            <p className="text-xs text-muted-foreground">No category sales yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-[16px] border-border overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-sm font-bold tracking-normal">Payment methods</CardTitle>
                    <CardDescription className="text-xs font-medium tracking-normal text-muted-foreground">Breakdown of paid orders by payment channel</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {paymentMethodBreakdown.length > 0 ? paymentMethodBreakdown.map((item) => (
                        <div key={item.method} className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold tracking-normal">{PAYMENT_LABELS[item.method] || item.method}</span>
                                <span className="text-muted-foreground font-semibold">{item.count}</span>
                            </div>
                            <Progress value={(item.total / maxPaymentTotal) * 100} className="h-1.5" />
                            <span className="text-[10px] text-muted-foreground">৳{item.total.toLocaleString()} total</span>
                        </div>
                    )) : (
                        <p className="text-xs text-muted-foreground">No payment data yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
