import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateStudyPlan } from '@/lib/ai/study-plan-generator';

export async function POST(req: Request) {
    try {
        const { subjectId, subjectName, goal, experienceLevel } = await req.json();
        const supabase = await createServerClient();

        // 1. Check authentication
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Check subscription — study plans require basic+
        const { checkAIUsage } = await import('@/lib/ai/usage-limits');
        const usageCheck = await checkAIUsage(user.id, 'study_plan');
        if (!usageCheck.allowed) {
            return NextResponse.json(
                { error: 'Study plans require a Basic or Premium subscription', plan: usageCheck.plan },
                { status: 403 }
            );
        }

        // 2. Generate the study plan with AI
        const plan = await generateStudyPlan(subjectName, goal, experienceLevel);

        // 3. Persist to database
        const { data: savedPlan, error } = await supabase
            .from('study_plans')
            .insert({
                user_id: user.id,
                subject_id: subjectId,
                title: plan.title,
                plan: plan,
                duration_weeks: plan.durationWeeks,
                status: 'active'
            })
            .select()
            .single();

        if (error) {
            console.error('Failed to save study plan:', error);
            return new NextResponse('Database Error', { status: 500 });
        }

        return NextResponse.json(savedPlan);
    } catch (error) {
        console.error('Study Plan Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
