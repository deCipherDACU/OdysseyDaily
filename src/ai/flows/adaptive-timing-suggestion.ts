'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting an adaptive Pomodoro session duration.
 *
 * - adaptiveTimingSuggestion - The function that triggers the suggestion flow.
 * - AdaptiveTimingSuggestionInput - The input type for the flow.
 * - AdaptiveTimingSuggestionOutput - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AdaptiveTimingSuggestionInputSchema = z.object({
  taskDifficulty: z.enum(['Easy', 'Medium', 'Hard', 'N/A']).describe('The difficulty of the task.'),
  taskCategory: z.string().describe('The category of the task (e.g., "Education", "Career").'),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening']).describe('The current time of day.'),
  mbti: z.string().optional().describe("The user's MBTI personality type."),
});
export type AdaptiveTimingSuggestionInput = z.infer<typeof AdaptiveTimingSuggestionInputSchema>;

const AdaptiveTimingSuggestionOutputSchema = z.object({
  recommendedDuration: z.number().describe('The recommended session duration in minutes.'),
  reasoning: z.string().describe('A brief explanation for the recommendation.'),
});
export type AdaptiveTimingSuggestionOutput = z.infer<typeof AdaptiveTimingSuggestionOutputSchema>;


export async function adaptiveTimingSuggestion(input: AdaptiveTimingSuggestionInput): Promise<AdaptiveTimingSuggestionOutput> {
  return adaptiveTimingSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adaptiveTimingSuggestionPrompt',
  input: { schema: AdaptiveTimingSuggestionInputSchema },
  output: { schema: AdaptiveTimingSuggestionOutputSchema },
  prompt: `You are an AI productivity expert specializing in focus techniques like the Pomodoro method. Your goal is to suggest an optimal focus session duration (between 15 and 90 minutes) based on the user's task and personal context.

  **Context:**
  - Task Difficulty: {{taskDifficulty}}
  - Task Category: {{taskCategory}}
  - Time of Day: {{timeOfDay}}
  {{#if mbti}}- User's MBTI: {{mbti}}{{/if}}

  **Reasoning Guidelines:**
  -   **Difficulty:** Harder tasks warrant longer sessions (e.g., 45-60 min). Easy tasks can be shorter (e.g., 20-25 min).
  -   **Category:** 'Education' or 'Career' might need longer, deep work sessions. 'Hobbies' or 'Home' could be shorter.
  -   **Time of Day:** Suggest longer sessions during 'morning' or 'afternoon' when energy is typically higher. Suggest shorter sessions in the 'evening'.
  -   **MBTI:**
      -   **Introverts (I):** May handle longer, uninterrupted sessions well.
      -   **Perceivers (P):** Might prefer shorter, more frequent bursts to maintain interest.
      -   **Judging (J):** May appreciate structured, standard-length sessions (25 or 50 min).
      -   **Intuitive (N):** Could benefit from slightly longer sessions to explore complex ideas.

  **Task:**
  Based on the provided context, determine the single best session duration in minutes. Then, provide a concise, one-sentence reasoning for your choice. For example, "A longer session is ideal for this difficult career task in the morning."

  Return the output as a JSON object.
  `,
});

const adaptiveTimingSuggestionFlow = ai.defineFlow(
  {
    name: 'adaptiveTimingSuggestionFlow',
    inputSchema: AdaptiveTimingSuggestionInputSchema,
    outputSchema: AdaptiveTimingSuggestionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
