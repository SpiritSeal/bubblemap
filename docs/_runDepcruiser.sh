# Create output directory
mkdir docs

# Set working directory to root of project
cd ..

# SVG and HTML versions
npx depcruise src functions/src --progress \
    --config .dependency-cruiser.js \
    --output-type dot \
    --prefix "https://github.com/SpiritSeal/bubblemap/tree/main/" \
  | dot -Tsvg \
  | tee docs/dependency-cruiser-graph-flat-dot.svg \
  | npx depcruise-wrap-stream-in-html \
  > docs/dependency-cruiser-graph-flat-dot.html

# PDF Version
npx depcruise src functions/src --progress \
>     --config .dependency-cruiser.js \
>     --output-type dot \
>     --prefix "https://github.com/SpiritSeal/bubblemap/tree/main/" \
>   | dot -T pdf \
>   > docs/dependency-cruiser-graph-flat-dot.pdf


# Old/ Unused
# npx depcruise src functions/src --config --output-type dot | dot -T svg > dependency-graph.svg