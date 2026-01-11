import { callGeminiWithFailover } from './geminiConfig';

export async function generateDiaryImage(diaryText: string): Promise<{ imageUrl: string, prompt: string }> {
    // Use Gemini to extract keywords/themes from diary
    const imagePrompt = await callGeminiWithFailover(async (model) => {
        const prompt = `Based on this diary entry, extract 2-3 key themes or keywords that best represent the day (e.g., "coding", "nature", "study", "celebration", "stress").

Diary:
${diaryText}

Return only the keywords separated by commas:`;

        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    });

    // Use Unsplash API properly with access key
    // Since we don't have an Unsplash API key configured, we'll use Picsum (Lorem Picsum) 
    // which is a free, open-source image placeholder service
    const keywords = imagePrompt.split(',').map(k => k.trim()).join(',');

    // Generate a semi-random ID based on keywords (so same keywords get same image)
    const keywordHash = keywords.split('').reduce((acc, char) => {
        return acc + char.charCodeAt(0);
    }, 0);
    const imageId = (keywordHash % 1000) + 1; // IDs from 1 to 1000

    // Use Picsum Photos - free image service that doesn't require API keys
    const imageUrl = `https://picsum.photos/800/400?random=${imageId}`;

    return { imageUrl, prompt: imagePrompt };
}
