import { callGeminiWithFailover } from './geminiConfig';
import { LearningCategory } from '../../database/schema';

export async function extractLearnings(diaryText: string): Promise<Array<{ text: string, category: LearningCategory }>> {
    return callGeminiWithFailover(async (model) => {
        const prompt = `Extract key learnings from this diary entry and categorize them.

Diary:
${diaryText}

Categories: work_career, studies_academics, personal_life, emotional_mental_health, habits_discipline, health_fitness, communication_relationships, time_management, productivity, finance_responsibility, decision_making, mistakes_to_avoid, values_ethics, self_awareness, lifestyle, other

Return JSON array (return empty array if no learnings found):
[{"text": "learning text", "category": "category_name"}]`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleaned = text.replace(/```json\n?|```/g, '').trim();
        const learnings = JSON.parse(cleaned);
        return Array.isArray(learnings) ? learnings : [];
    });
}
