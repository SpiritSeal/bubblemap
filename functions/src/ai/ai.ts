import * as functions from 'firebase-functions';
import { Configuration, OpenAIApi } from 'openai';
const https = require('https');

// // Read API key from ./secrets/openai_key.secret file and save it to a variable
const openai_key = process.env.OPENAI_SECRET;

const configuration = new Configuration({
  apiKey: openai_key,
});
const openai = new OpenAIApi(configuration);

async function genIdeaOAI(text: string) {
  const response = await openai.createCompletion({
    model: 'text-davinci-002',
    prompt: `Single word related to ${text}`,
    temperature: 0.5,
    max_tokens: 6,
    n: 1,
  });
  return response.data;
}

// Request https://api.datamuse.com/words?rel_trg=cow
async function genIdeaDM(text: string) {
  
  const url = `https://api.datamuse.com/words?rel_trg=${text}`;
  const response = await new Promise((resolve, reject) => {
    https.get(url, (res: any) => {
      let data = '';
      res.on('data', (chunk: string) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(JSON.parse(data));
      });
    }).on('error', (err: any) => {
      reject(err);
    });
  });
  console.log(response);
  return response;
  // console.log(data);
  // return "test";
}

const ai = functions
  .runWith({ secrets: ['OPENAI_SECRET'] })
  .region('us-west2')
  .https.onCall(async (data) => {
    const result = await genIdeaOAI(data.data);
    console.log("OpenAI: \n"+result);
    const resultDM = await genIdeaDM(data.data);
    console.log("Datamuse: \n"+resultDM);
    return {
      idea: resultDM,
    }
    // const result = await genIdeaOAI(data.data);
    // if (!result.choices) {
    //   throw new functions.https.HttpsError('internal', 'No idea found');
    // }
    // return {
    //   idea: result.choices[0].text,
    // };
  });

export default ai;
