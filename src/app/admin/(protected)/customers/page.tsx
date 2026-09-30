import { getAllUsers } from "@/lib/actions";
import { AdminCustomersTable } from "@/components/admin/customers-table";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, UserPlus, MapPin } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const allUsers = await getAllUsers();

  const stats = [
    { label: 'Total customers', value: allUsers.length, icon: Users, color: 'text-muted-foreground' },
    { label: 'New this month', value: allUsers.filter(u => new Date(u.createdAt).getMonth() === new Date().getMonth()).length, icon: UserPlus, color: 'text-orange-600' },
    { label: 'With address', value: allUsers.filter(u => u.address).length, icon: MapPin, color: 'text-blue-600' },
    { label: 'Verified', value: allUsers.length, icon: UserCheck, color: 'text-green-600' }, // For now all are verified
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold font-headline tracking-tight">Customer database</h1>
        <p className="text-muted-foreground text-xs">View and manage your registered customer base and their details.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="rounded-[16px] border-border">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold tracking-normal text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-black tracking-tight">{stat.value}</p>
              </div>
              <stat.icon className={`h-6 w-6 ${stat.color} opacity-40`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <AdminCustomersTable initialCustomers={allUsers} />
    </div>
  );
}
