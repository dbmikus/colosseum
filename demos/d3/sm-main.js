function randInt(min, max) {
    return Math.floor(Math.random() * ((max+1) - min)) + min;
}

function randColor () {
    var max = 255;
    var r = String(randInt(0, 255));
    var g = String(randInt(0, 255));
    var b = String(randInt(0, 255));
    var a = String(1.0);

    return ('rgba(' + r + ','
            + g + ','
            + b + ','
            + a + ')');
}

function drawBars (n) {
    var data = [];
    var i = 0;

    var min = 1;
    var max = 25;

    while (i < n) {
        data.push(randInt(min, max));
        i++;
    }

    d3.select('#barchart').selectAll('div')
        .data(data)
        .enter().append('div')
        .attr('class', 'bar')
        .style('height', function (d) { return String(d*10) + 'px'; })
        .style('background-color', randColor)
}


function drawSVG (n) {

    function drawBars (n, offset, spacing) {
        var data = [];
        var i = 0;

        var min = 1;
        var max = 25;

        while (i < n) {
            data.push(randInt(min, max));
            i++;
        }

        var graphHeight = $('#svgtest').height();
        var scale = 8;

        function createY (n) {
            var height = scale * n;
            return String(graphHeight - height) + 'px';
        }

        d3.select('#svgtest').selectAll('rect')
            .data(data)
            .enter().append('rect')
            .attr('x', function (d, i) {
                return String(i * 50 + spacing + offset);
            })
            .attr('y', createY)
            .attr('height', function (d) { return String(scale * d) + 'px'; })
            .attr('width', function (d) { return '25px'; })
            .style('fill', randColor);
    }

    function drawLine(chart, x1, x2, y1, y2) {
        var line = $('<line/>');

        console.log(x1);
        console.log(x2);
        console.log(y1);
        console.log(y2);

        line.attr('x1', x1);
        line.attr('y1', y1);
        line.attr('x2', x2);
        line.attr('y2', y2);

        line.attr('stroke', 'black');
        line.attr('stroke-width', 2);

        return line;
    }

    function drawAxis () {
        var chart = $('#svgtest');
        chart.prepend(drawLine(chart, 0, chart.width(), 0, chart.height()));
    }

    drawBars(n, 20, 5);
    drawAxis();
}

drawBars(5);
drawSVG(8);
