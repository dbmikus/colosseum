function scaleParagraphs () {
    d3.selectAll('p')
        .data([4, 8, 15, 16, 23, 42])
        .style('font-size', function (d) { return d + 'px'; });
}

// The data is paired with the selection of nodes
// If there is more data than nodes,
// then the remaining data is sent to enter selection
function makeScaleParagraphs () {
    d3.select('#select_test').selectAll('p')
        .data([4, 8, 15, 16, 23, 42])
        .style('font-size', function (d) { return d + 'px'; })
        .enter().append('p')
        .text(function (d) { return "I'm a number " + d + "!"; })
        .style('font-size', function (d) { return d + 'px'; });
}

function testExit () {
    var p = d3.select('#exit_test').selectAll('p')
        .data([15, 16, 23, 42])
        .text(function (d) { return 'This stuff stays. Data = ' + d;  })
        .style('font-size', function (d) { return d + 'px'; });

    p.exit()
        .text(function (d) {
            return 'This is in exit. Excess p tags after data is used.';
        });
}


function fadeBackground (bgcolor) {
    d3.select('body').transition()
    .style('background-color', bgcolor);
}


makeScaleParagraphs();
testExit();
fadeBackground('white');
