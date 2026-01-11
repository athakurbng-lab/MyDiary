import { callGeminiWithFailover } from './geminiConfig';
import { Suggestion } from '../../database/schema';

export async function generateSuggestions(diaryText: string): Promise<Omit<Suggestion, 'id' | 'diaryId' | 'createdAt'>> {
    return callGeminiWithFailover(async (model) => {
        const prompt = `Analyze this diary entry and provide structured feedback:

${diaryText}

Provide your analysis in JSON format:
{
  "whatWentWell": "...",
  "whatWentWrong": "...",
  "whyItFailed": "...",
  "improvements": "..."
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleaned = text.replace(/```json\n?|```/g, '').trim();
        return JSON.parse(cleaned);
    });
}
