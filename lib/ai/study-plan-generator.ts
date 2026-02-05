import { generateObject } from 'ai';
import { z } from 'zod';
import { aiModel } from './openai';

export const StudyPlanSchema = z.object({
    title: z.string(),
    description: z.string(),
    durationWeeks: z.number(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    modules: z.array(z.object({
        week: z.number(),
        title: z.string(),
        topics: z.array(z.string()),
        learningObjectives: z.array(z.string()),
        estimatedHours: z.number(),
        resources: z.array(z.object({
            type: z.enum(['reading', 'video', 'practice', 'quiz']),
            description: z.string()
        }))
    }))
});

export type StudyPlan = z.infer<typeof StudyPlanSchema>;

/**
 * Generates an adaptive study plan for a subject using AI.
 */
export async function generateStudyPlan(
    subjectName: string,
    userGoal: string,
    experienceLevel: string = 'beginner'
): Promise<StudyPlan> {
    const { object } = await generateObject({
        model: aiModel,
        schema: StudyPlanSchema,
        system: `You are an expert curriculum designer. Generate a highly structured and effective study plan for the following subject. 
    Tailor it to the user's specific goal and current experience level. 
    Ensure the progression is logical and results-oriented.`,
        prompt: `Subject: ${subjectName}
    User Goal: ${userGoal}
    Current Level: ${experienceLevel}`,
    });

    return object;
}
