import { callGeminiWithFailover } from './geminiConfig';

export async function paraphraseDiary(originalText: string): Promise<string> {
    return callGeminiWithFailover(async (model) => {
        const prompt = `You are a personal diary writing assistant.

Task:
Rewrite the given diary text to improve grammar, clarity, and sentence structure.

Strict Rules:
- Do NOT change the meaning, intent, facts, or emotions.
- Do NOT add or remove information.
- Keep the tone personal and natural.
- Preserve emotional expressions exactly.
- Do NOT summarize or interpret.

Input Diary Text:
${originalText}

Output:
Return only the corrected and well-written version of the same content.`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    });
}
