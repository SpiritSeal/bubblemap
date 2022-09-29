import React from 'react';
import { SimulationNodeDatum } from 'd3-force';
import { node as nodeType } from '../../types';

const radius = 15;
const lineHeight = 15.5;
const subLineHeight = 1.7;

// We may have to replace many of these consts below with lets in the future (or maybe not)

function measureWidth(text: string) {
  const context = document.createElement('canvas').getContext('2d');
  if (!context) {
    return 0;
  }
  return context.measureText(text).width;
}

function wordsGenerator(text: string) {
  const wordList = text.split(/\s+/g); // To hyphenate: /\s+|(?<=-)/
  if (!wordList[wordList.length - 1]) wordList.pop();
  if (!wordList[0]) wordList.shift();
  return wordList;
}

const Bubble = ({
  node,
  selected,
}: {
  node: SimulationNodeDatum & nodeType;
  selected: boolean;
}) => {
  // Prepare the text
  const { text } = node;
  const words = wordsGenerator(text);
  const targetWidth = Math.sqrt(measureWidth(text.trim()) * lineHeight);
  const getLines = () => {
    // line has properties { text, width }
    let line: { text: string; width: number } = { text: '', width: 0 };
    let lineWidth0 = Infinity;
    const linesTemp = [];
    for (let i = 0, n = words.length; i < n; i += 1) {
      // eslint-disable-next-line
      const lineText1 = `${line.text}${line ? ' ': ''}${words[i]}`;
      const lineWidth1 = measureWidth(lineText1);
      if ((lineWidth0 + lineWidth1) / 2 < targetWidth) {
        // eslint-disable-next-line
        line!.width = lineWidth0 = lineWidth1;
        // eslint-disable-next-line
        line!.text = lineText1;
      } else {
        lineWidth0 = measureWidth(words[i]);
        line = { width: lineWidth0, text: words[i] };
        linesTemp.push(line);
      }
    }
    return linesTemp;
  };
  const lines = getLines();
  const textRadius = function textRadius() {
    let tradius = 0;
    for (let i = 0, n = lines.length; i < n; i += 1) {
      const dy = (Math.abs(i - n / 2 + 0.5) + 0.5) * lineHeight;
      const dx = lines[i].width / 2;
      tradius = Math.max(tradius, Math.sqrt(dx ** 2 + dy ** 2));
    }
    return tradius;
  };
  // Generate metadata text that will go in the section underneath the main text
  const subLines = (function subLines() {
    const subLinesTemp = [];
    const createdBy = 'Saketh Reddy [@spyre]';
    const createdOn = '5 minutes ago';
    subLinesTemp.push(createdBy);
    subLinesTemp.push(createdOn);
    subLinesTemp.push(`Idea #${node.id}`);
    return subLinesTemp;
  })();

  // Return Statement
  return (
    <g
      className="bubble"
      transform={`translate(${(node.x ?? 0) - radius} ${
        (node.y ?? 0) - radius
      })`}
      style={
        node.id === 0
          ? { cursor: 'no-drop' }
          : { cursor: selected ? 'grabbing' : 'grab' }
      }
    >
      <circle
        cx={radius}
        cy={radius}
        r={radius}
        fill={node.id === 0 ? 'lightblue' : 'grey'}
        stroke="black"
        strokeWidth="0.5"
      />
      {/* print the main text in the bubble */}
      {/* main text uses https://observablehq.com/@mbostock/fit-text-to-circle */}
      <text
        transform={`translate(${radius},${
          radius - 0.5 * 0.5 * 0.5 * 0.5 * radius
        }) scale(${radius / (textRadius() * 1.5)})`}
        // Green
        fill={node.id === 0 ? 'red' : 'darkblue'}
      >
        {lines.map((line, i) => (
          <tspan
            key={line.text}
            x="0"
            // dy={i === 0 ? '0em' : `${lineHeight}em`}
            y={(i - lines.length / 2 + 0.8) * lineHeight}
            textAnchor="middle"
          >
            {line.text}
          </tspan>
        ))}
      </text>

      <g className="bottom_region">
        <path
          d="M27 24C27 24 23 30 15 30C7 30 3 24 3 24C3 24 7.1318 23 15.0478 23C22.9638 23 27 24 27 24Z"
          fill="white"
          stroke="black"
          strokeWidth="0.5"
        />
        <text
          x={radius}
          y="25.5"
          textAnchor="middle"
          dominantBaseline="auto"
          fontStyle="italic"
          // style={{ fontSize: '0.8rem' }}
          // force text to fit in the region
          style={{ fontSize: '0.12rem' }}
        >
          {/* Make each line of text on a new line */}
          {subLines.map((line, i) => (
            <tspan x={radius} dy={i === 0 ? 0 : subLineHeight}>
              {line}
            </tspan>
          ))}
        </text>
      </g>
      <g
        className="top_region"
        style={{ cursor: 'pointer' }}
        onClick={(e) => {
          // print the node id
          // eslint-disable-next-line no-console
          console.log(node.id);
          e.stopPropagation();
        }}
      >
        <path
          d="M20 3.00095C20 4.00189 20 5 15 5C10 5 10 4.00189 10 3.00095C9.99999 2 9.99998 1.00379 15 1.00189C20 1 20 2 20 3.00095Z"
          fill="white"
        />
        <path
          d="M11 2C11 2 18.8225 2.00058 19 2M11 3.02521C11 3.02521 18.8225 3.02579 19 3.02521M11 4C11 4 18.8225 4.00058 19 4"
          stroke="black"
          strokeWidth="0.2"
          strokeLinecap="round"
        />
      </g>
    </g>
  );
};
export default Bubble;
