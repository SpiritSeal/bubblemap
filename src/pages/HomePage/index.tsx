import React from 'react';

const HomePage = () => {
  // Build a basic homepage
  const one = 1;
  //   eslint-disable-next-line
  console.log(one);
  return (
    <div>
      <h1>Home Page</h1>
      {/* Button that takes you to the mindmap page at /mindmap */}
      <a href="/mindmap">
        <button type="button">Go to Mindmap Selector</button>
      </a>
    </div>
  );
};

export default HomePage;
