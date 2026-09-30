import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DiscountsPage() {
  return (
    <div className="flex flex-col gap-6">
        <h1 className="text-xl font-bold tracking-tight">Discounts</h1>
        <Card className="rounded-[16px]">
            <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">This page is under construction. Create and manage discounts and promotions.</p>
            </CardContent>
        </Card>
    </div>
  )
}
