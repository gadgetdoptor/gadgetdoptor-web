import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { activityLogs } from '@/lib/schema';

export type LogStatus = 'success' | 'pending' | 'failed';

export async function getCurrentActor(): Promise<string> {
  try {
    return (await cookies()).get('admin_username')?.value || 'system';
  } catch {
    return 'system';
  }
}

/**
 * Records an entry in the system activity log. Never throws — a logging
 * failure must not break the action it is describing.
 */
export async function logActivity(params: {
  event: string;
  message: string;
  status?: LogStatus;
  actor?: string;
}) {
  try {
    const actor = params.actor ?? (await getCurrentActor());
    await db.insert(activityLogs).values({
      event: params.event,
      actor,
      status: params.status ?? 'success',
      message: params.message,
    });
  } catch (error) {
    console.error('Failed to write activity log:', error);
  }
}
