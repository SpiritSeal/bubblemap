

const svg = d3.select("b").append("svg")
// create("svg")
.attr("viewBox", [0, 0, width, height]),
link = svg
.selectAll(".link")
.data(graph.links)
.join("line")
.classed("link", true),
node = svg
.selectAll(".node")
.data(graph.nodes)
.join("circle")
.attr("r", 12)
.classed("node", true)
.classed("fixed", d => d.fx !== undefined);

console.log(svg.node());

var zoom_handler = d3.zoom()
.extent([[0, 0], [width, height]])
.scaleExtent([1, 8])
.on("zoom", zoomed);
// svg.call(zoom_handler);
zoom_handler(svg);

const simulation = d3
.forceSimulation()
.nodes(graph.nodes)
.force("charge", d3.forceManyBody())
.force("center", d3.forceCenter(width / 2, height / 2))
.force("link", d3.forceLink(graph.links))
.on("tick", tick);

const drag = d3
.drag()
.on("start", dragstart)
.on("drag", dragged);

node.call(drag).on("click", click);

function tick() {
    link
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y);
    node
    .attr("cx", d => d.x)
    .attr("cy", d => d.y);
}

function click(event, d) {
    delete d.fx;
    delete d.fy;
    d3.select(this).classed("fixed", false);
    simulation.alpha(1).restart();
}

function dragstart() {
    d3.select(this).classed("fixed", true);
}

function dragged(event, d) {
    d3.select(this).attr("cx", d.x = event.x).attr("cy", d.y = event.y);
    d.fx = clamp(event.x, 0, width);
    d.fy = clamp(event.y, 0, height);
    // d.fx = d.x;
    // d.fy = d.y;
    simulation.alpha(1).restart();
}

function zoomed({transform}) {
    node.attr("transform", transform);
    link.attr("transform", transform);
}