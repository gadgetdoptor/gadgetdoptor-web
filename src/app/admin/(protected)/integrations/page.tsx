import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function IntegrationsPage() {
  return (
    <div className="flex flex-col gap-6">
        <h1 className="text-xl font-bold tracking-tight">Integrations</h1>
        <Card className="rounded-[16px]">
            <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">This page is under construction. Connect with third-party services.</p>
            </CardContent>
        </Card>
    </div>
  )
}
