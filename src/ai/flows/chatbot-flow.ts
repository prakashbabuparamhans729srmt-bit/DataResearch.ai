'use server';
/**
 * @fileOverview A multilingual helper AI agent for DataResearch.ai.
 *
 * - chatHelper - A function that handles user queries about the system.
 * - ChatInput - The input type for the chatbot.
 * - ChatOutput - The return type for the chatbot.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatInputSchema = z.object({
  message: z.string().describe('The user question in any Indian language.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string()
  })).optional().describe('Chat history for context.')
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  reply: z.string().describe('The AI response in the same language as the user query.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chatHelper(input: ChatInput): Promise<ChatOutput> {
  return chatHelperFlow(input);
}

const chatHelperPrompt = ai.definePrompt({
  name: 'chatHelperPrompt',
  input: { schema: ChatInputSchema },
  output: { schema: ChatOutputSchema },
  prompt: `You are the Official Assistant for DataResearch.ai, an advanced student analytics platform built for India.
Your mission is to help users navigate the system and understand student performance data.

System Overview:
- 'Operational Hub' (Dashboard): Summary of attendance, scores, and rank.
- 'Intelligence Unit' (Analysis): Deep charts and AI-generated insights.
- 'Archive Vault' (Reports): Exporting research data as summaries.
- 'Control Panel' (Settings): Managing admin profile and theme.

Guidelines:
1. Respond in the language the user speaks (Hindi, English, Bengali, Tamil, etc.).
2. Be professional, "high-tech", and helpful.
3. If users ask about search, explain they can use the search bar or the mic icon.
4. If users ask about students, explain that the system monitors metrics like attendance and rank.

User Message: {{{message}}}`,
});

const chatHelperFlow = ai.defineFlow(
  {
    name: 'chatHelperFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const { output } = await chatHelperPrompt(input);
    if (!output) throw new Error('Assistant failed to respond.');
    return output;
  }
);
