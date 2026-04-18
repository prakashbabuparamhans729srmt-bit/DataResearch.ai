'use server';
/**
 * @fileOverview Generates a comprehensive National Objective Audit Report based on student data.
 *
 * - generateNationalReport - Function to generate the AI report.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const NationalReportInputSchema = z.object({
  students: z.array(z.any()).describe('The current set of student nodes for analysis.'),
  objectives: z.array(z.string()).describe('The 40 National Objectives to audit against.'),
});
export type NationalReportInput = z.infer<typeof NationalReportInputSchema>;

const NationalReportOutputSchema = z.object({
  reportTitle: z.string().describe('The generated title for the audit.'),
  executiveSummary: z.string().describe('A high-level summary of the research findings.'),
  objectiveAudit: z.array(z.object({
    objective: z.string().describe('The specific national objective.'),
    status: z.enum(['Achieved', 'Progressing', 'Requires Intervention']).describe('The current status.'),
    impactScore: z.number().describe('A numeric score from 0-100 representing success.'),
    details: z.string().describe('Detailed analysis based on student data.')
  })).describe('An audit of selected key objectives.'),
  strategicRecommendation: z.string().describe('A high-tech strategic path forward.')
});
export type NationalReportOutput = z.infer<typeof NationalReportOutputSchema>;

export async function generateNationalReport(input: NationalReportInput): Promise<NationalReportOutput> {
  return nationalReportFlow(input);
}

const nationalReportPrompt = ai.definePrompt({
  name: 'nationalReportPrompt',
  input: { schema: NationalReportInputSchema },
  output: { schema: NationalReportOutputSchema },
  prompt: `You are the Chief Intelligence Officer for DataResearch.ai.
Your mission is to audit the current student data against India's 40 National Objectives for Education.

Research Data:
{{{json students}}}

Objectives to Audit:
{{{json objectives}}}

Generate a professional, high-tech, and patriotic research report. Focus on how the current student performance aligns with the mission of digitizing and improving Indian education.`,
});

const nationalReportFlow = ai.defineFlow(
  {
    name: 'nationalReportFlow',
    inputSchema: NationalReportInputSchema,
    outputSchema: NationalReportOutputSchema,
  },
  async (input) => {
    const { output } = await nationalReportPrompt(input);
    if (!output) throw new Error('Report generation failed.');
    return output;
  }
);
