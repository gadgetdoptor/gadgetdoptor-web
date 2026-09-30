import { Skeleton } from "@/components/ui/skeleton";

export function OrdersSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-4 border-b border-border gap-4">
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-24 rounded-lg" />
                            <Skeleton className="h-6 w-32 rounded-lg" />
                        </div>
                        <div className="text-left sm:text-right space-y-2">
                            <Skeleton className="h-3 w-20 ml-auto rounded-lg" />
                            <Skeleton className="h-4 w-24 ml-auto rounded-lg" />
                        </div>
                        <div className="text-left sm:text-right space-y-2">
                            <Skeleton className="h-3 w-20 ml-auto rounded-lg" />
                            <Skeleton className="h-6 w-28 ml-auto rounded-lg" />
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-20 rounded-lg" />
                            <Skeleton className="h-3 w-16 rounded-lg" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
