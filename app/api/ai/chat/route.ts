import { streamText } from 'ai';
import { aiModel, SYSTEM_PROMPTS } from '@/lib/ai/openai';
import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { findRelevantContent } from '@/lib/ai/vector-search';
import { captureError } from '@/lib/monitoring/sentry';

export async function POST(req: Request) {
    try {
        const { messages, subjectId, mode = 'chat' } = await req.json();
        const supabase = await createServerClient();

        // Check authentication
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Check AI usage limits
        const { checkAIUsage, incrementAIUsage } = await import('@/lib/ai/usage-limits');
        const usageCheck = await checkAIUsage(user.id, 'message');
        if (!usageCheck.allowed) {
            return NextResponse.json(
                { error: 'Daily AI message limit reached', remaining: 0, limit: usageCheck.limit, plan: usageCheck.plan },
                { status: 429 }
            );
        }

        // Get subject name if subjectId is provided for context
        let subjectContext = '';
        if (subjectId) {
            const { data: subject } = await supabase
                .from('subjects')
                .select('name')
                .eq('id', subjectId)
                .single();
            if (subject) {
                subjectContext = `The current subject is ${subject.name}. `;
            }
        }

        // 2. Find relevant context via vector search (RAG)
        let knowledgeContext = "";
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            // Only search if the message has content/text
            const query = typeof lastMessage === 'string' ? lastMessage : lastMessage.content;
            if (query) {
                knowledgeContext = await findRelevantContent(query, subjectId);
            }
        }

        const systemPrompt = `${SYSTEM_PROMPTS[mode as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.chat}\n${subjectContext}\n${knowledgeContext ? `Use the following context to provide accurate answers:\n${knowledgeContext}` : ''}`;

        const result = streamText({
            model: aiModel,
            system: systemPrompt,
            messages,
            onFinish: async () => {
                try {
                    const { incrementAIUsage } = await import('@/lib/ai/usage-limits');
                    await incrementAIUsage(user.id, 'message');
                } catch (e) {
                    console.error('Failed to increment AI usage:', e);
                }
            }
        });

        return result.toUIMessageStreamResponse();
    } catch (error) {
        captureError(error, { route: 'POST /api/ai/chat' });
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
