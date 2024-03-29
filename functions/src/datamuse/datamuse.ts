/* eslint-disable @typescript-eslint/no-explicit-any */
import * as functions from 'firebase-functions';
import * as https from 'https';

/* eslint-disable @typescript-eslint/no-var-requires */
const nlp = require('compromise/three');
// const cowsay = require('cowsay');

// This method attempts to extract the greatest possible value keywords from the text
function extractKeywords(input: string) {
  // Remove punctuation
  const text = input.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
  // If the text is empty, return an empty array
  if (text === '') {
    return [];
  }
  // If the text is a single word, return an array with that word
  // if (text.split(' ').length === 1) {
  //   return [text];
  // }

  // If there are multiple words, use compromise to extract the keywords
  const docArray = nlp(text).unique().out('array');
  const doc = nlp(nlp(text).unique().out('text'));

  // Create an array that builds up the keywords
  const keywords: string[] = [];

  // Create an array that pops the words when they are added to the keywords array
  // console.log('doc', doc);
  const remWords = docArray;

  // Extract the nouns
  const nouns = doc.match('#Noun').out('array');
  nouns.forEach((noun: string) => {
    keywords.push(noun);
    remWords.splice(remWords.indexOf(noun), 1);
  });

  // Extract the verbs
  const verbs = doc.match('#Verb').out('array');
  verbs.forEach((verb: string) => {
    keywords.push(verb);
    remWords.splice(remWords.indexOf(verb), 1);
  });

  // Extract the adjectives
  const adjectives = doc.match('#Adjective').out('array');
  adjectives.forEach((adj: string) => {
    keywords.push(adj);
    remWords.splice(remWords.indexOf(adj), 1);
  });

  // Extract the adverbs
  const adverbs = doc.match('#Adverb').out('array');
  adverbs.forEach((adv: string) => {
    keywords.push(adv);
    remWords.splice(remWords.indexOf(adv), 1);
  });

  // The remaining words are added to the keywords array
  remWords.forEach((word: string) => {
    keywords.push(word);
  });

  // Simplify the words in the keywords array by removing plurals and conjugations
  const advancedList: string[] = [];
  // Make nouns singular
  keywords.forEach((word: string) => {
    advancedList.push(nlp(word).nouns().toSingular().out('text'));
  });
  // Remove conjugations
  keywords.forEach((word: string) => {
    advancedList.push(nlp(word).verbs().toInfinitive().out('text'));
  });

  // add the simplified keywords to the keywords array
  advancedList.forEach((word: string) => {
    // console.log('word', word);
    keywords.push(word);
  });

  // Remove duplicates
  const uniqueKeywords = keywords
    .filter((item: string, index: number) => keywords.indexOf(item) === index)
    .filter((item: string) => item !== '');

  return uniqueKeywords;
}

async function genIdeaDM(text: string) {
  const keywords = extractKeywords(text);
  // Get up to the first 6 keywords from the array
  const keywordsToUse = keywords.slice(0, 7);
  // const url = `https://api.datamuse.com/words?rel_trg=${keywords[0]}&topics=${keywords[1-6, comma separatedif they exist]}&max=3`;
  const url = `https://api.datamuse.com/words?rel_trg=${
    keywordsToUse[0]
  }&topics=${keywordsToUse.slice(1).join(',')}&max=3`;

  // attempt to generate ideas from Datamuse by trying each word in keywords until a valid response is received
  let response: any;
  for (let i = 0; i < keywords.length; i += 1) {
    const newUrl = url.replace(keywords[0], keywords[i]);
    // eslint-disable-next-line no-await-in-loop
    response = await new Promise((resolve, reject) => {
      https
        .get(newUrl, (res: any) => {
          let data = '';
          res.on('data', (chunk: any) => {
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
    // console.log(`Datamuse response for ${keywords[i]}: ${response}`);
    // check if the response is a non-empty array
    if (Array.isArray(response) && response.length > 0) {
      // console.log(`Datamuse response for ${keywords[i]}: ${response}`);
      break;
    }
  }
  return formatIdeaDM(response);
}

function formatIdeaDM(idea: any) {
  // builds an array of strings from the Datamuse response
  const ideas = idea.map((item: any) => item.word);
  return ideas;
}

const datamuse = functions
  .runWith({ secrets: ['OPENAI_SECRET'] })
  .region('us-west2')
  .https.onCall(async (data) => {
    const resultDM = await genIdeaDM(data.data);
    // console.log(cowsay.say({ text: 'Success!' }));
    // console.log(cowsay.say({ text: `Datamuse Thinks: ${resultDM[0]}` }));
    return resultDM;
  });

export default datamuse;
