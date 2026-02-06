import { createServiceRoleClient } from '@/lib/supabase/server';

interface UsageCheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  plan: string;
}

const PLAN_LIMITS = {
  free: { messages: 5, quizzes: 1, study_plans: 0 },
  basic: { messages: Infinity, quizzes: Infinity, study_plans: Infinity },
  premium: { messages: Infinity, quizzes: Infinity, study_plans: Infinity },
};

export async function checkAIUsage(
  userId: string,
  type: 'message' | 'quiz' | 'study_plan'
): Promise<UsageCheckResult> {
  const supabase = createServiceRoleClient();

  // Get user subscription
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', userId)
    .single();

  const plan = (sub?.status === 'active' ? sub?.plan : 'free') || 'free';
  const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;

  // Study plans require basic+
  if (type === 'study_plan') {
    const allowed = plan !== 'free';
    return { allowed, remaining: allowed ? Infinity : 0, limit: limits.study_plans, plan };
  }

  // Get today's usage
  const today = new Date().toISOString().split('T')[0];
  const { data: usage } = await supabase
    .from('ai_usage')
    .select('message_count, quiz_count')
    .eq('user_id', userId)
    .eq('usage_date', today)
    .single();

  const currentCount = type === 'message'
    ? (usage?.message_count || 0)
    : (usage?.quiz_count || 0);

  const limit = type === 'message' ? limits.messages : limits.quizzes;
  const remaining = Math.max(0, limit - currentCount);
  const allowed = limit === Infinity || currentCount < limit;

  return { allowed, remaining: limit === Infinity ? Infinity : remaining, limit, plan };
}

export async function incrementAIUsage(userId: string, type: 'message' | 'quiz') {
  const supabase = createServiceRoleClient();
  const today = new Date().toISOString().split('T')[0];

  // Upsert usage record
  const column = type === 'message' ? 'message_count' : 'quiz_count';

  const { data: existing } = await supabase
    .from('ai_usage')
    .select('id, message_count, quiz_count')
    .eq('user_id', userId)
    .eq('usage_date', today)
    .single();

  if (existing) {
    await supabase
      .from('ai_usage')
      .update({ [column]: (existing[column] || 0) + 1 })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('ai_usage')
      .insert({
        user_id: userId,
        usage_date: today,
        message_count: type === 'message' ? 1 : 0,
        quiz_count: type === 'quiz' ? 1 : 0,
      });
  }
}
