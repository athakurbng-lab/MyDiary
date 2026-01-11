import { callGeminiWithFailover } from './geminiConfig';

export async function compareDiaryProgress(todayDiary: string, pastDiaries: string[]): Promise<-1 | 0 | 1> {
    return callGeminiWithFailover(async (model) => {
        const prompt = `Compare today's diary with past entries and determine if it represents:
+1 = Better day (more productive, positive emotions, growth)
0 = Same level
-1 = Worse day (less productive, negative emotions, setbacks)

Today:
${todayDiary}

Past entries:
${pastDiaries.join('\n---\n')}

Respond with only: 1, 0, or -1`;

        const result = await model.generateContent(prompt);
        const score = parseInt(result.response.text().trim());
        return (score === 1 || score === -1 ? score : 0) as -1 | 0 | 1;
    });
}
