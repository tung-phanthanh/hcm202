import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question, currentEvent, currentLocation, currentYear } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Initialize the SDK. It automatically picks up GEMINI_API_KEY from environment variables.
    const ai = new GoogleGenAI();

    // Construct a strict system prompt
    const systemInstruction = `You are a knowledgeable, respectful, and highly accurate historian expert specializing in the life, revolutionary journey, and ideology of Ho Chi Minh (Bác Hồ).
Your primary task is to answer user questions related to Ho Chi Minh.

RULES:
1. You MUST ONLY answer questions related to Ho Chi Minh, his life, his journey, Vietnamese history associated with him, or his ideology.
2. If the user asks a question COMPLETELY UNRELATED to Ho Chi Minh or his journey (e.g., "how to bake a cake", "what is quantum physics", "who is Taylor Swift"), you MUST politely decline to answer, stating that you are an AI assistant specialized only in Ho Chi Minh's history.
3. The user is currently exploring an interactive map. They are viewing the following context:
   - Location: ${currentLocation || 'Unknown'}
   - Year: ${currentYear || 'Unknown'}
   - Event: ${currentEvent || 'Unknown'}
4. Use this context to understand what they are referring to if they use pronouns like "this event", "here", "at that time".
5. Keep your answers concise, informative, and suitable for a web chat interface. Format your answer in Vietnamese.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: question,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2, // Low temperature for factual accuracy
      }
    });

    return res.status(200).json({ answer: response.text });
  } catch (error) {
    console.error('Error in /api/ask:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
