import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { generateQuiz } from '@/lib/ai/quiz-generator';

export async function POST(req: Request) {
    try {
        const { subjectId, topics, difficulty = 'adaptive' } = await req.json();
        const supabase = await createServerClient();

        // 1. Auth check
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        // 2. Get subject name
        const { data: subject } = await supabase
            .from('subjects')
            .select('name')
            .eq('id', subjectId)
            .single();

        if (!subject) return new NextResponse('Subject not found', { status: 404 });

        // 3. Generate the quiz
        const quizData = await generateQuiz(subject.name, topics || [subject.name], difficulty);

        // 4. Save to DB
        const { data: quizRecord, error: saveError } = await supabase
            .from('ai_quizzes')
            .insert({
                user_id: user.id,
                subject_id: subjectId,
                title: quizData.title,
                difficulty,
                questions: quizData.questions,
                question_count: quizData.questions.length,
            })
            .select()
            .single();

        if (saveError) {
            console.error('Save error:', saveError);
            throw saveError;
        }

        return NextResponse.json(quizRecord);
    } catch (error) {
        console.error('Quiz API Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
