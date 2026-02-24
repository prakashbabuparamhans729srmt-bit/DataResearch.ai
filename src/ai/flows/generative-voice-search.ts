'use server';
/**
 * @fileOverview A Genkit flow for processing natural language voice commands
 * to search for specific student data or insights.
 *
 * - generativeVoiceSearch - A function that handles the voice search query.
 * - GenerativeVoiceSearchInput - The input type for the generativeVoiceSearch function.
 * - GenerativeVoiceSearchOutput - The return type for the generativeVoiceSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerativeVoiceSearchInputSchema = z.object({
  query: z.string().describe('The natural language voice command to search for student data or insights.')
});
export type GenerativeVoiceSearchInput = z.infer<typeof GenerativeVoiceSearchInputSchema>;

const GenerativeVoiceSearchOutputSchema = z.object({
  gender: z.enum(['Male', 'Female']).optional().describe('Filter by student gender.'),
  academicTags: z.array(z.string()).optional().describe('Filter by academic subject tags (e.g., Science, Arts, Commerce).'),
  minScore: z.number().optional().describe('Filter students with a minimum score percentage.'),
  maxScore: z.number().optional().describe('Filter students with a maximum score percentage.'),
  keyword: z.string().optional().describe('General keyword to search student names or descriptions.'),
  insightRequest: z.string().optional().describe('A specific request for an insight if the query is not purely for filtering.')
});
export type GenerativeVoiceSearchOutput = z.infer<typeof GenerativeVoiceSearchOutputSchema>;

export async function generativeVoiceSearch(input: GenerativeVoiceSearchInput): Promise<GenerativeVoiceSearchOutput> {
  return generativeVoiceSearchFlow(input);
}

const generativeVoiceSearchPrompt = ai.definePrompt({
  name: 'generativeVoiceSearchPrompt',
  input: {schema: GenerativeVoiceSearchInputSchema},
  output: {schema: GenerativeVoiceSearchOutputSchema},
  prompt: `You are an AI assistant for a student data research application. Your task is to parse a natural language voice command and extract relevant filters and keywords for searching student data.
Based on the user's query, identify and return the following information in a JSON object:
- 'gender': 'Male' or 'Female' if specified.
- 'academicTags': An array of academic subjects like 'Science', 'Arts', 'Commerce' if mentioned.
- 'minScore': A minimum score percentage (e.g., 90 for "above 90%").
- 'maxScore': A maximum score percentage (e.g., 80 for "below 80%").
- 'keyword': Any general search term not covered by specific filters, such as student names.
- 'insightRequest': A specific request for an insight or analysis if the query is not purely for filtering (e.g., "average attendance").

If a filter is not specified or applicable to the query, do not include it in the output. Prioritize specific filters over general keywords if there's overlap.

Examples:
- User: "Show me all students with scores above 90% in Science"
  Output: { "minScore": 90, "academicTags": ["Science"] }
- User: "Find female students in Arts"
  Output: { "gender": "Female", "academicTags": ["Arts"] }
- User: "Students named Priya"
  Output: { "keyword": "Priya" }
- User: "What is the average attendance for male students?"
  Output: { "gender": "Male", "insightRequest": "average attendance" }
- User: "Show me all students"
  Output: {}
- User: "Students with scores between 70 and 80 in Commerce"
  Output: { "minScore": 70, "maxScore": 80, "academicTags": ["Commerce"] }

Now, process the following user query:
User: {{{query}}}`
});

const generativeVoiceSearchFlow = ai.defineFlow(
  {
    name: 'generativeVoiceSearchFlow',
    inputSchema: GenerativeVoiceSearchInputSchema,
    outputSchema: GenerativeVoiceSearchOutputSchema
  },
  async (input) => {
    const {output} = await generativeVoiceSearchPrompt(input);
    return output!;
  }
);
