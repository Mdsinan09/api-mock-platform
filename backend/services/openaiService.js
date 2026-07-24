import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate realistic mock data based on a JSON Schema
 * @param {Object} jsonSchema
 * @returns {Promise<Object>}
 */
export const generateMockData = async (jsonSchema) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured in environment');
    }

    const systemPrompt =
      "You generate realistic mock JSON data. Given a JSON schema, return only valid JSON matching the schema with realistic values (real names, emails, addresses, not 'test1'). Do not include markdown formatting, explanations, or code blocks. Return ONLY the raw JSON.";

    const userPrompt = `Generate mock data for this JSON schema:\n${JSON.stringify(jsonSchema, null, 2)}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2048
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('OpenAI returned an empty response');
    }

    const cleanContent = content.replace(/```json\s?|```\s?/g, '').trim();
    return JSON.parse(cleanContent);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('OpenAI returned invalid JSON. Please retry.');
    }
    throw new Error(`OpenAI Service Error: ${error.message}`);
  }
};
