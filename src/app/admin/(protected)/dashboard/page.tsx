import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users, TrendingUp, ArrowUpRight } from "lucide-react";
import { getDashboardStats } from "@/lib/actions";
import { Overview } from "@/components/admin/overview";
import { RecentSales } from "@/components/admin/recent-sales";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const { stats, recentOrders, salesData } = await getDashboardStats();

    const statCards = [
        { title: "Total revenue", value: `৳${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, description: "Total earnings from paid orders", color: "text-green-600" },
        { title: "Transactions", value: stats.totalSales, icon: ShoppingCart, description: "Total orders placed", color: "text-blue-600" },
        { title: "Products", value: stats.totalProducts, icon: Package, description: "Total catalog items", color: "text-orange-600" },
        { title: "Customers", value: stats.totalCustomers, icon: Users, description: "Registered user base", color: "text-muted-foreground" },
    ];

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-xl font-bold font-headline tracking-tight">Dashboard <span className="">overview</span></h1>
                <p className="text-muted-foreground text-xs">Real-time performance metrics and shop activity.</p>
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

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4 rounded-[16px] border-border overflow-hidden min-w-0">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold tracking-normal">Sales overview</CardTitle>
                        <CardDescription className="text-xs font-medium tracking-normal text-muted-foreground">Revenue generated in the last 7 days</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2 pr-4">
                        <div className="h-[350px] w-full min-w-0">
                            <Overview data={salesData} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3 rounded-[16px] border-border overflow-hidden min-w-0">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-bold tracking-normal">Recent sales</CardTitle>
                            <CardDescription className="text-xs font-medium tracking-normal text-muted-foreground">Latest 5 customer transactions</CardDescription>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <RecentSales orders={recentOrders} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
