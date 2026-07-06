import * as functions from 'firebase-functions/v1';
import { logger } from 'firebase-functions/logger';

// Groq's chat-completions endpoint is OpenAI-compatible; one small feature,
// one provider, no SDK needed (issue #190). Node 24 provides global fetch.
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

// Split the model's reply into up to 3 clean, lowercase, deduped ideas.
function formatIdeas(reply: string): string[] {
  const ideas = reply
    .split('\n')
    .map((line) =>
      line
        .replace(/^[\s\d.\-*•]+/, '')
        .trim()
        .toLowerCase(),
    )
    .filter((line) => line !== '');
  return [...new Set(ideas)].slice(0, 3);
}

async function genIdeasGroq(text: string, apiKey: string): Promise<string[]> {
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You suggest ideas for a mind map. Reply with exactly 3 ' +
            'suggestions, one per line, each a single word or very short ' +
            'phrase. No numbering, no punctuation, no commentary.',
        },
        { role: 'user', content: `Ideas related to: ${text}` },
      ],
      temperature: 0.5,
      max_tokens: 60,
    }),
  });
  if (!response.ok) {
    throw new Error(
      `Groq API error ${response.status}: ${await response.text()}`,
    );
  }
  const body = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return formatIdeas(body.choices?.[0]?.message?.content ?? '');
}

// Still exported/deployed as `gpt3`: renaming a callable would need a client
// change plus an interactive function-delete confirmation on deploy. The one
// shared key is a free-tier tradeoff — see issue #190; on any failure
// (missing key, quota burst, API error) we return [] and the client falls
// back to Datamuse suggestions.
const gpt3 = functions
  .runWith({ secrets: ['GROQ_API_KEY'] })
  .region('us-west2')
  .https.onCall(async (data) => {
    const apiKey = process.env.GROQ_API_KEY;
    const prompt: unknown = data?.data;
    if (typeof prompt !== 'string' || prompt.trim() === '') return [];
    if (!apiKey) {
      logger.error('GROQ_API_KEY is not set; returning no AI ideas');
      return [];
    }
    try {
      return await genIdeasGroq(prompt, apiKey);
    } catch (error) {
      logger.error('Groq idea generation failed', error);
      return [];
    }
  });

export default gpt3;
