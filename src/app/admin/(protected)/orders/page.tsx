import { getAllOrders } from "@/lib/actions";
import { AdminOrdersTable } from "@/components/admin/orders-table";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Package, Clock, CheckCircle, Truck, XCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const initialOrders = await getAllOrders();

  const stats = [
    { label: 'Total orders', value: initialOrders.length, icon: ShoppingCart, color: 'text-muted-foreground' },
    { label: 'Pending', value: initialOrders.filter(o => o.orderStatus === 'pending').length, icon: Clock, color: 'text-yellow-600' },
    { label: 'Processing', value: initialOrders.filter(o => o.orderStatus === 'processing').length, icon: Package, color: 'text-blue-600' },
    { label: 'Shipped', value: initialOrders.filter(o => o.orderStatus === 'shipped').length, icon: Truck, color: 'text-indigo-600' },
    { label: 'Delivered', value: initialOrders.filter(o => o.orderStatus === 'delivered').length, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Cancelled', value: initialOrders.filter(o => o.orderStatus === 'cancelled').length, icon: XCircle, color: 'text-red-600' },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold font-headline tracking-tight">Order management</h1>
        <p className="text-muted-foreground text-xs">Monitor, track, and manage customer orders across your shop.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="rounded-[16px] border-border">
            <CardContent className=" flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold tracking-normal text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-black tracking-tight">{stat.value}</p>
              </div>
              <stat.icon className={`h-6 w-6 ${stat.color} opacity-40`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <AdminOrdersTable initialOrders={initialOrders} />
    </div>
  );
}
