import * as functions from 'firebase-functions';

const ai = functions.region('us-west2').https.onCall((data, context) => {
  console.log('hello');
  return 'Hello';
});

export default ai;
