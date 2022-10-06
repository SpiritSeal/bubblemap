import React from 'react';

const ManageMindMaps = () => (
  <div>
    <ul>
      {/* Go home */}
      <li>
        <a href="/">
          <h1>Home</h1>
        </a>
      </li>
      {/* button to /mindmap/test01 */}
      <li>
        <a href="/mindmap/test01">
          <button type="button">
            Go to Mindmap <code>test01</code>{' '}
            <em>(shows off the new loading screen)</em>
          </button>
        </a>
      </li>
      {/* button to /mindmap/PxICnzGAskSEQXxkCIL4 */}
      <li>
        <a href="/mindmap/PxICnzGAskSEQXxkCIL4">
          <button type="button">
            Go to Mindmap <code>PxICnzGAskSEQXxkCIL4</code>{' '}
            <em>(the one we&apos;ve been using for testing)</em>
          </button>
        </a>
      </li>
    </ul>
  </div>
);

export default ManageMindMaps;
