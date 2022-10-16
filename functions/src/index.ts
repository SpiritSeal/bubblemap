import { initializeApp } from 'firebase-admin/app';

initializeApp();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

// eslint-disable-next-line import/prefer-default-export
export { default as ai } from './ai/ai.js';
export { default as datamuse } from './datamuse/datamuse.js';
export { default as gpt3 } from './gpt3/gpt3.js';
export { default as gpt3_parent } from './gpt3_parent/gpt3_parent.js';
