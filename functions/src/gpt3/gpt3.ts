/* eslint-disable @typescript-eslint/no-explicit-any */
import * as functions from 'firebase-functions';
import { Configuration, OpenAIApi } from 'openai';

/* eslint-disable @typescript-eslint/no-var-requires */
// const cowsay = require('cowsay');

const openai_key = process.env.OPENAI_SECRET;

const configuration = new Configuration({
  apiKey: openai_key,
});
const openai = new OpenAIApi(configuration);

async function genIdeaOAI(text: string) {
  const response = await openai.createCompletion({
    model: 'text-davinci-002',
    prompt: `Single word or very short phrase related to ${text}`,
    temperature: 0.5,
    max_tokens: 6 * 3,
    n: 3,
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
    const result = await genIdeaOAI(data.data);
    // console.log(cowsay.say({ text: 'Success!' }));
    // console.log(cowsay.say({ text: `OpenAI Thinks: ${result[0]}` }));
    return result;
  });

export default gpt3;
