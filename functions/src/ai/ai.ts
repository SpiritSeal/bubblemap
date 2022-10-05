/* eslint-disable @typescript-eslint/no-explicit-any */
import * as functions from 'firebase-functions';
import { Configuration, OpenAIApi } from 'openai';

import * as https from 'https';

/* eslint-disable @typescript-eslint/no-var-requires */
const nlp = require('compromise/two');
const cowsay = require('cowsay');

const openai_key = process.env.OPENAI_SECRET;

const configuration = new Configuration({
  apiKey: openai_key,
});
const openai = new OpenAIApi(configuration);

async function genIdeaOAI(text: string) {
  const response = await openai.createCompletion({
    model: 'text-davinci-002',
    prompt: `Single word or phrase related to ${text}`,
    temperature: 0.5,
    max_tokens: 6,
    n: 3,
  });
  return formatIdeaOAI(response.data);
}

// This method attempts to extract the greatest possible value keywords from the text
function extractKeywords(text: string) {
  // If the text is empty, return an empty array
  if (text === '') {
    return [];
  }
  // If the text is a single word, return an array with that word
  if (text.split(' ').length === 1) {
    return [text];
  }
  // If there are multiple words, use compromise to extract the keywords
  const doc = nlp(text);

  const nouns = doc.match('#Noun').out('array');
  if (nouns.length > 0) return nouns;
  const verbs = doc.match('#Verb').out('array');
  if (verbs.length > 0) return verbs;
  const adjectives = doc.match('#Adjective').out('array');
  if (adjectives.length > 0) return adjectives;
  const adverbs = doc.match('#Adverb').out('array');
  if (adverbs.length > 0) return adverbs;

  // If no keywords are found, return all the words, sorted by length descending
  return text.split(' ').sort((a, b) => b.length - a.length);
}

async function genIdeaDM(text: string) {
  const keywords = extractKeywords(text);
  const url = `https://api.datamuse.com/words?rel_trg=${keywords[0]}&max=3`;
  const response = await new Promise((resolve, reject) => {
    https
      .get(url, (res: any) => {
        let data = '';
        res.on('data', (chunk: string) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve(JSON.parse(data));
        });
      })
      .on('error', (err: any) => {
        reject(err);
      });
  });
  return formatIdeaDM(response);
}

function formatIdeaDM(idea: any) {
  // builds an array of strings from the Datamuse response
  const ideas = idea.map((item: any) => item.word);
  return ideas;
}

function formatIdeaOAI(idea: any) {
  // builds an array of strings from the OpenAI response
  // trim the whitespace and lowercase all the strings
  let ideas = idea.choices.map((item: any) => item.text.trim().toLowerCase());
  // remove duplicates
  ideas = ideas.filter((item: any, pos: any) => ideas.indexOf(item) === pos);
  return ideas;
}

/* eslint-disable no-console */
const ai = functions
  .runWith({ secrets: ['OPENAI_SECRET'] })
  .region('us-west2')
  .https.onCall(async (data) => {
    const result = await genIdeaOAI(data.data);
    const resultDM = await genIdeaDM(data.data);
    console.log(cowsay.say({ text: 'Success!' }));
    console.log(cowsay.say({ text: `Datamuse Thinks: ${resultDM[0]}` }));
    // console.log(resultDM);
    console.log(cowsay.say({ text: `OpenAI Thinks: ${result[0]}` }));
    return {
      idea: {
        openai: result,
        datamuse: resultDM,
      },
    };
  });

export default ai;
