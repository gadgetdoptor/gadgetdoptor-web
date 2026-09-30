import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Terminal, Activity, ShieldCheck } from "lucide-react";
import { getSystemLogs, getLogStats } from "@/lib/actions";

export const dynamic = 'force-dynamic';

function formatTimestamp(date: Date) {
  return new Date(date).toLocaleString('en-GB', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).replace(',', '');
}

const STATUS_STYLES: Record<string, string> = {
  success: 'bg-green-50 text-green-700 border-green-200',
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
};

export default async function LogsPage() {
  const [logs, stats] = await Promise.all([getSystemLogs(150), getLogStats()]);

  const threatLevel = stats.failedToday > 5 ? 'ELEVATED' : stats.failedToday > 0 ? 'CAUTION' : 'NOMINAL';

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold font-headline tracking-tight">System logs</h1>
        <p className="text-muted-foreground text-xs font-bold tracking-tight">Live activity and audit trail for admin actions.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-card border border-border rounded-[16px]">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-orange-600" />
            <h3 className="text-xs font-bold tracking-normal text-muted-foreground">Events today</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-black tracking-tight">{stats.today.toLocaleString()}</p>
          <p className="text-[11px] font-medium text-green-600 mt-1">Recorded since midnight</p>
        </div>
        <div className="p-6 bg-card border border-border rounded-[16px]">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="h-4 w-4 text-blue-600" />
            <h3 className="text-xs font-bold tracking-normal text-muted-foreground">Total entries</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-black tracking-tight">{stats.total.toLocaleString()}</p>
          <p className="text-[11px] font-medium text-muted-foreground mt-1">All-time log entries</p>
        </div>
        <div className="p-6 bg-card border border-border rounded-[16px] sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="h-4 w-4 text-foreground" />
            <h3 className="text-xs font-bold tracking-normal text-muted-foreground">Threat level</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-black tracking-tight">{threatLevel}</p>
          <p className="text-[11px] font-medium text-muted-foreground mt-1">{stats.failedToday} failed event{stats.failedToday === 1 ? '' : 's'} today</p>
        </div>
      </div>

      <div className="border border-border bg-card overflow-x-auto rounded-[16px]">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Event</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Actor</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Timestamp</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground text-xs font-bold uppercase">
                    <ClipboardList className="h-5 w-5 mx-auto mb-2" />
                    No activity recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted font-mono">
                    <TableCell className="text-[10px] font-black text-blue-600">{log.event}</TableCell>
                    <TableCell className="text-[10px] font-bold text-muted-foreground uppercase">{log.actor}</TableCell>
                    <TableCell>
                      <Badge className={`rounded-full uppercase text-[8px] font-black tracking-widest ${STATUS_STYLES[log.status] || STATUS_STYLES.success}`}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[9px] text-muted-foreground whitespace-nowrap">{formatTimestamp(log.createdAt)}</TableCell>
                    <TableCell className="text-[10px] text-muted-foreground italic">&ldquo;{log.message}&rdquo;</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
