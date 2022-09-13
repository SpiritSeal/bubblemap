import * as functions from 'firebase-functions';
import { Configuration, OpenAIApi } from 'openai';

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

const ai = functions
  .runWith({ secrets: ['OPENAI_SECRET'] })
  .region('us-west2')
  .https.onCall(async (data) => {
    const result = await genIdeaOAI(data.data);
    if (!result.choices) {
      throw new functions.https.HttpsError('internal', 'No idea found');
    }
    return {
      idea: result.choices[0].text,
    };
  });

export default ai;
