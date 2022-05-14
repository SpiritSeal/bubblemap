## Note to Eric
We'll prob be using d3 v6 instead of the newer d3 v7 because
1. The new `Observable` format that hosts the examples for d3 v7 makes it excessively difficult to adapt features and code
2. There is really good documentation and learning tools for d3 v6 at [d3indepth](https://www.d3indepth.com)
3. There are (from what I can see) minimal functionality differences between v6 and v7 that would significantly improve dev experience or reduce programming time. Additionally, the [migration](https://observablehq.com/@d3/d3v6-migration-guide) for the parts of d3 we would most likely use doesn't really look too bad if we ever want to upgrade later.