/* eslint-disable @typescript-eslint/no-explicit-any */
import * as functions from 'firebase-functions';
import { Configuration, OpenAIApi } from 'openai';
import { logger } from 'firebase-functions';

const openai_key = process.env.OPENAI_SECRET;

const configuration = new Configuration({
  apiKey: openai_key,
});
const openai = new OpenAIApi(configuration);

async function genIdeaOAI(text: string) {
  const response = await openai.createCompletion({
    model: 'gpt-3.5-turbo',
    prompt: `Single word or very short phrase related to ${text}`,
    temperature: 0.5,
    max_tokens: 6 * 3,
    n: 3,
    presence_penalty: 1.9,
  });
  return formatIdeaOAI(response.data);
}

function formatIdeaOAI(idea: any) {
  // builds an array of strings from the OpenAI response
  // trim the whitespace and lowercase all the strings
  let ideas = idea.choices.map((item: any) => item.text.trim().toLowerCase());
  // remove duplicates
  ideas = ideas.filter((item: any, pos: any) => ideas.indexOf(item) === pos);
  return ideas;
}

const gpt3 = functions
  .runWith({ secrets: ['OPENAI_SECRET'] })
  .region('us-west2')
  .https.onCall(async (data) => {
    // Check openai_key is not undefined, if it is, return empty result and log in functions log an error
    if (openai_key === undefined) {
      logger.error('OPENAI_SECRET is undefined');
      return [];
    }

    const result = await genIdeaOAI(data.data);
    return result;
  });

export default gpt3;
