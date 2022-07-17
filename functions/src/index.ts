import { initializeApp } from 'firebase-admin/app';

initializeApp();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

// eslint-disable-next-line import/prefer-default-export
export { default as ai } from './ai/ai.js';
