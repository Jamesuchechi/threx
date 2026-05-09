import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  // This would be called by a Cron job (e.g. Vercel Cron or GitHub Actions)
  // Check for Secret to prevent unauthorized triggers
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.CRON_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = await createClient();

  // 1. Fetch users who want a digest
  const { data: users, error } = await supabase
    .from('notification_preferences')
    .select('user_id, email_digest_frequency')
    .neq('email_digest_frequency', 'off');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 2. For each user, fetch unread notifications from the last day/week
  for (const user of users) {
    const period = user.email_digest_frequency === 'daily' ? '1 day' : '7 days';
    
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*, actor:profiles(username)')
      .eq('recipient_id', user.user_id)
      .eq('is_read', false)
      .filter('created_at', 'gte', `now() - interval '${period}'`);

    if (notifications && notifications.length > 0) {
      // 3. Logic to send email (e.g. via Resend or SendGrid)
      console.log(`Sending ${user.email_digest_frequency} digest to user ${user.user_id} with ${notifications.length} updates.`);
      // await resend.emails.send({ ... });
    }
  }

  return NextResponse.json({ success: true, processed: users.length });
}
