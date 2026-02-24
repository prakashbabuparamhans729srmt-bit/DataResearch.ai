'use server';
/**
 * @fileOverview Provides an AI-generated summary of key student data trends, performance, and intervention areas.
 *
 * - summarizeStudentDataInsights - A function that orchestrates the summarization of student data.
 * - AIDataInsightsSummarizationInput - The input type for the summarizeStudentDataInsights function.
 * - AIDataInsightsSummarizationOutput - The return type for the summarizeStudentDataInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StudentDataSchema = z.object({
  id: z.string().describe('Unique identifier for the student.'),
  name: z.string().describe('The name of the student.'),
  gender: z.enum(['Male', 'Female', 'Other']).describe('The gender of the student.'),
  tags: z.array(z.string()).describe('Academic tags or categories associated with the student (e.g., Science, Arts, Commerce).'),
  attendancePercentage: z.number().min(0).max(100).describe('Student attendance percentage (0-100).'),
  completionPercentage: z.number().min(0).max(100).describe('Assignment or course completion percentage (0-100).'),
  averageScorePercentage: z.number().min(0).max(100).describe('Average score percentage across all assessments (0-100).'),
  rank: z.number().int().positive().optional().describe('Overall rank among all students.'),
  status: z.enum(['Active', 'Idle']).describe('Current status of the student (Active or Idle).'),
});

const AIDataInsightsSummarizationInputSchema = z.object({
  students: z.array(StudentDataSchema).describe('An array of student data objects for analysis.'),
});
export type AIDataInsightsSummarizationInput = z.infer<typeof AIDataInsightsSummarizationInputSchema>;

const AIDataInsightsSummarizationOutputSchema = z.object({
  summary: z.object({
    overallTrends: z.string().describe('A high-level summary of overall student performance and behavioral trends.'),
    topPerformers: z.array(z.object({
      name: z.string().describe('Name of the top-performing student.'),
      performanceMetric: z.string().describe('The key metric by which the student excelled (e.g., "highest score", "best attendance").'),
      value: z.number().describe('The value of the performance metric.'),
      notes: z.string().optional().describe('Any additional notes or specific achievements for this student.'),
    })).optional().describe('A list of noteworthy top-performing students.'),
    areasForIntervention: z.array(z.object({
      category: z.string().describe('The category of concern (e.g., "Low Attendance", "Failing Scores", "Idle Students").'),
      description: z.string().describe('A detailed description of the identified issue.'),
      studentCount: z.number().int().positive().describe('The number of students affected by this issue.'),
      exampleStudents: z.array(z.string()).optional().describe('Names of a few example students facing this issue.'),
    })).optional().describe('Identified areas where intervention might be needed, along with supporting details.'),
    generalInsights: z.string().optional().describe('Any other general insights or recommendations based on the data.'),
  }).describe('The AI-generated summary of student data insights.'),
});
export type AIDataInsightsSummarizationOutput = z.infer<typeof AIDataInsightsSummarizationOutputSchema>;

export async function summarizeStudentDataInsights(input: AIDataInsightsSummarizationInput): Promise<AIDataInsightsSummarizationOutput> {
  return aiDataInsightsSummarizationFlow(input);
}

const studentDataInsightsPrompt = ai.definePrompt({
  name: 'studentDataInsightsPrompt',
  input: { schema: AIDataInsightsSummarizationInputSchema },
  output: { schema: AIDataInsightsSummarizationOutputSchema },
  prompt: `You are an expert educational data analyst. Your task is to analyze the provided student data and generate a comprehensive summary. Focus on identifying key trends, highlighting noteworthy student performance, and pointing out potential areas for intervention. Your output should be structured as a JSON object following the specified schema.

Here is the student data:

Students: {{{json students}}}`,
});

const aiDataInsightsSummarizationFlow = ai.defineFlow(
  {
    name: 'aiDataInsightsSummarizationFlow',
    inputSchema: AIDataInsightsSummarizationInputSchema,
    outputSchema: AIDataInsightsSummarizationOutputSchema,
  },
  async (input) => {
    const { output } = await studentDataInsightsPrompt(input);
    if (!output) {
      throw new Error('Failed to generate student data insights summary.');
    }
    return output;
  }
);
