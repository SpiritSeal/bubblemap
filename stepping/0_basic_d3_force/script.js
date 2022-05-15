var width = 600, height = 400;

var colorScale = ['orange', 'lightblue', '#B19CD9'];
var xCenter = [100, 300, 500];

var numNodes = 100;
var nodes = d3.range(numNodes).map(function (d, i) {
    return {
        radius: Math.random() * 25,
        category: i % 3
    }
});

var simulation = d3.forceSimulation(nodes)
    .force('charge', d3.forceManyBody().strength(-5))
    // .force('x', d3.forceX().x(0))
    // .force('y', d3.forceY().y(0))
    .force('center', d3.forceCenter())
    .force('collision', d3.forceCollide().radius(function (d) {
        return d.radius;
    }))
    .on('tick', ticked);

function ticked() {
    var u = d3.select('svg g')
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('r', function (d) {
            return d.radius;
        })
        .style('fill', function (d) {
            return colorScale[d.category];
        })
        .attr('cx', function (d) {
            return d.x;
        })
        .attr('cy', function (d) {
            return d.y;
        });
}
