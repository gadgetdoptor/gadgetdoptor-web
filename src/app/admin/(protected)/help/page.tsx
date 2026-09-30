import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HelpPage() {
  return (
    <div className="flex flex-col gap-6">
        <h1 className="text-xl font-bold tracking-tight">Help</h1>
        <Card className="rounded-[16px]">
            <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">This page is under construction. Find help and support here.</p>
            </CardContent>
        </Card>
    </div>
  )
}
