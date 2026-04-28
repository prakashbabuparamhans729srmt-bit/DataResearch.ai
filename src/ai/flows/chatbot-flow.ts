
'use server';
/**
 * @fileOverview A multilingual helper AI agent for DataResearch.ai, trained on the 40 National Objectives.
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
  prompt: `You are the Official "A to Z" Intelligence Assistant for RESEARCH.AI.
Your mission is to help users navigate the advanced student analytics platform and understand how we align with India's 40 National Objectives.

Key Mission Points (The 40 Objectives):
1. Make Indian education data-driven.
2. Real-time analysis of student performance.
3. AI-driven deep insights for teachers.
4. Bridge the rural-urban education gap.
5. Improve attendance using pattern recognition.
6. Support NEP 2020 goals.
7. Track skill development, scholarship eligibility, and dropout prevention.
8. Multilingual support for all major Indian languages.
9. Secure data handling (DPDP Act compliance).
10. Holistic development monitoring and talent identification.
...and 30 more focused on digitization, regional excellence, and vocational growth.

System Units:
- 'Operational Hub' (Dashboard): Summary of attendance, scores, and rank.
- 'Intelligence Unit' (Analysis): Deep charts and AI-generated insights.
- 'Archive Vault' (Reports): Exporting research data as neural audits.
- 'Control Panel' (Settings): Managing admin profile, theme, and security overrides.

Guidelines:
1. Respond in the EXACT language the user speaks (Hindi, English, Bengali, Tamil, etc.).
2. Be professional, "high-tech", and patriotic towards India's education future.
3. If users ask about "A to Z", explain it refers to our end-to-end mission for 100% student success.
4. If users ask about search, explain they can use the search bar or the mic icon (Voice Search).

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
