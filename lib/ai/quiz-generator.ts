import { generateObject } from 'ai';
import { aiModel } from '@/lib/ai/provider';
import { z } from 'zod';

const quizSchema = z.object({
    title: z.string(),
    questions: z.array(z.object({
        id: z.string(),
        question: z.string(),
        options: z.array(z.string()),
        correctAnswer: z.string(),
        explanation: z.string(),
        difficulty: z.enum(['easy', 'medium', 'hard']),
        topic: z.string(),
    })).min(3).max(10),
});

export type Quiz = z.infer<typeof quizSchema>;

export async function generateQuiz(subjectName: string, recentTopics: string[], difficulty: string = 'adaptive') {
    try {
        const { object } = await generateObject({
            model: aiModel,
            schema: quizSchema,
            system: `You are an expert ${subjectName} tutor. Generate a high-quality educational quiz based on the following topics: ${recentTopics.join(', ')}. 
      - The questions should be challenging but fair.
      - Each question must have exactly one correct answer and 3 distractor options.
      - Provide a clear explanation for the correct answer.
      - Target difficulty level: ${difficulty}.`,
            prompt: `Generate a ${difficulty} difficulty quiz for ${subjectName} students focusing on ${recentTopics.join(' and ')}.`,
        });

        return object;
    } catch (error) {
        console.error('Quiz Generation Error:', error);
        throw error;
    }
}
