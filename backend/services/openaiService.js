import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

let openai = null;

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_API_KEY;
  if (!apiKey || apiKey.trim() === '') return null;
  if (!openai) {
    openai = new OpenAI({
      apiKey,
      timeout: 5000,
      maxRetries: 1,
    });
  }
  return openai;
};

/**
 * Generate realistic mock data using OpenAI.
 * Returns null for any service, timeout, or JSON parsing issue so callers can
 * immediately use the local mock generator instead.
 */
export const generateMockData = async (jsonSchema, context = {}) => {
  try {
    const client = getOpenAIClient();
    if (!client) return null;

    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You generate realistic mock JSON data. Given a JSON schema and API context, return ONLY valid JSON matching the schema. Use contextually appropriate values: pet APIs use pet names; user APIs use real human names and emails; product APIs use product names and prices; order APIs use realistic order data. Return only raw JSON with no markdown, explanations, or comments.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            schema: jsonSchema,
            context: {
              path: context.path || '',
              method: context.method || '',
              operationId: context.operationId || '',
            },
          }, null, 2),
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      console.warn('[OpenAI] Empty response received');
      return null;
    }

    const cleanContent = content
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    return JSON.parse(cleanContent);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.warn('[OpenAI] Invalid JSON returned, using fallback generator');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout')) {
      console.warn('[OpenAI] Request timed out, using fallback generator');
    } else {
      console.warn('[OpenAI] Service error:', error.message);
    }
    return null;
  }
};
