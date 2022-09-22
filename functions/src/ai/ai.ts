/* eslint-disable @typescript-eslint/no-explicit-any */
import * as functions from 'firebase-functions';
import { Configuration, OpenAIApi } from 'openai';

import * as https from 'https';

// // Read API key from ./secrets/openai_key.secret file and save it to a variable
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

// Request https://api.datamuse.com/words?rel_trg=cow
async function genIdeaDM(text: string) {
  const url = `https://api.datamuse.com/words?rel_trg=${text}&max=3`;
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
  // console.log(response);
  return formatIdeaDM(response);
  // console.log(data);
  // return "test";
}

function formatIdeaDM(idea: any) {
  // builds an array of strings from the Datamuse response
  const ideas = idea.map((item: any) => item.word);
  return ideas;
}

function formatIdeaOAI(idea: any) {
  // builds an array of strings from the OpenAI response
  // trim the whitespace and lowercase all the strings
  const ideas = idea.choices.map((item: any) => item.text.trim().toLowerCase());
  return ideas;
}

const ai = functions
  .runWith({ secrets: ['OPENAI_SECRET'] })
  .region('us-west2')
  .https.onCall(async (data) => {
    const result = await genIdeaOAI(data.data);
    // console.log("OpenAI: \n"+result);
    const resultDM = await genIdeaDM(data.data);
    // console.log("Datamuse: \n"+resultDM);
    return {
      idea: {
        openai: result,
        datamuse: resultDM,
      },
    };
    // const result = await genIdeaOAI(data.data);
    // if (!result.choices) {
    //   throw new functions.https.HttpsError('internal', 'No idea found');
    // }
    // return {
    //   idea: result.choices[0].text,
    // };
  });

export default ai;
