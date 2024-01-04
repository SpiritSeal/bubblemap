/* eslint-disable @typescript-eslint/no-explicit-any */
import * as functions from 'firebase-functions';
// import { Configuration, OpenAIApi } from 'openai';
import OpenAI from 'openai';

/* eslint-disable @typescript-eslint/no-var-requires */
// const cowsay = require('cowsay');

const openai_key = process.env.OPENAI_SECRET;

// const configuration = new Configuration({
//   apiKey: openai_key,
// });
// const openai = new OpenAIApi(configuration);
const openai = new OpenAI({ apiKey: openai_key });

// async function genIdeaOAI(text: string) {
//   const response = await openai.createCompletion({
//     model: 'gpt-3.5-turbo',
//     prompt: `Single word or very short phrase related to ${text}`,
//     temperature: 0.5,
//     max_tokens: 6 * 3,
//     n: 3,
//     presence_penalty: 1.9,
//   });
//   return formatIdeaOAI(response.data);
// }

async function genIdeaOAI(text: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: `Single word or very short phrase related to {${text}}`,
      },
    ],
    temperature: 1,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    n: 3,
  });
  return formatIdeaOAI(response);
}

function formatIdeaOAI(idea: OpenAI.Chat.Completions.ChatCompletion) {
  // builds an array of strings from the OpenAI response
  // trim the whitespace and lowercase all the strings
  let ideas = idea.choices.map(
    (item: OpenAI.Chat.Completions.ChatCompletion.Choice) =>
      item.message.content?.trim().toLowerCase()
  );
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
