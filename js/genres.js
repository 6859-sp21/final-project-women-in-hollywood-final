var fullHeightGenre = 200;
var fullWidthGenre = 400;
var marginGenre = { top: 30, bottom: 30, left: 30, right: 30 }
var heightGenre = fullHeightGenre - marginGenre.top - marginGenre.bottom
var widthGenre = fullWidthGenre - marginGenre.left - marginGenre.right

xScaleGenre = d3.scaleLinear().domain([1973, 2013]).range([0, widthGenre])
yScaleGenre = d3.scaleLinear().domain([0, 1]).range([heightGenre, 0])

var yAxisGenre = d3.axisLeft()
    .scale(yScaleGenre)

var xAxisGrid = d3.axisTop()
    .scale(xScaleGenre)
    .tickSize(heightGenre)
    .tickFormat('')
    .tickValues(d3.range(1980, 2011, 10))

var area = d3.area()
    .x(function (d) {
        return xScaleGenre(d.year)
    })
    .y0(heightGenre)
    .y1(function (d) {
        return yScaleGenre(d.amount)
    })

var line = d3.line()
    .x(function (d) {
        return xScaleGenre(d.year)
    })
    .y(function (d) {
        return yScaleGenre(d.amount)
    })

d3.csv("https://raw.githubusercontent.com/6859-sp21/final-project-women-in-hollywood-final/main/data/genres2.csv", d3.autoType).then(function (data) {
    console.log(data)
    var years = []
    for (i = 1973; i < 2014; i++) {
        years.push(i)
    }
    var dataset = []
    data.forEach(function (d, i) {
        var vehicleSales = [];
        years.forEach(function (y) {
            if (d[y]) {
                vehicleSales.push({
                    year: y,
                    amount: d[y]
                });
            }
            else {
                vehicleSales.push({
                    year: y,
                    amount: 0
                });
            }
        });

        dataset.push({
            genre: d.genre,
            sales: vehicleSales
        });
    });
    console.log(dataset)
    var svg = d3.select("#genres_line_chart").selectAll("svg")
        .data(dataset)
        .enter()
        .append("svg")
        .attr("class", "genreChart")
        .attr("width", fullWidthGenre)
        .attr("height", fullHeightGenre)
        .append("g")
        .attr("transform", "translate(" + marginGenre.left + "," + marginGenre.right + ")")
        .each(multiple)

    function multiple(model) {

        d3.select(this.parentNode)
            .attr("class", function (d) {
                return d.genre
            });

        var svg = d3.select(this)
            .append("g")
            .attr("class", function (d) {
                return d.genre + "-line"
            });
        

        svg.append('g')
            .attr('class', 'x-axis-grid')
            .attr('transform', 'translate(0,' + (heightGenre) + ")")
            .style("stroke", "rgba(0,0,0,.1)")
            .style("stroke-width", "1px")
            .call(xAxisGrid)

        svg.append("text")
            .attr("class", "label")
            .attr("x", widthGenre / 2)
            .attr("y", -10)
            .style("text-anchor", "middle")
            .text(function (d) { return d.genre; });

        svg.datum(function (d) { return d.sales; })
            .append("path")
            .attr("class", "area")
            .attr("d", area);

        svg//.datum(function (d) { return d.sales; })
            .append("path")
            .attr("class", "line")
            .attr("d", line);

        d3.select(this).append("g")
            .call(yAxisGenre)
            .attr("class", "y axis lineChart")
            .selectAll("text")
            .style("text-anchor", "end");

        svg.append("text")
            .attr("x", widthGenre / 2)
            .attr("y", function (d) {
                return yScaleGenre(d[d.length - 1].amount);
            })
            .attr("class", "label")
            .style("text-anchor", "start")
            .attr("dx", 8)
            .attr("dy", 4);

        svg.append("text")
            .attr("x", -20)
            .attr("y", heightGenre + marginGenre.bottom / 2 + 5)
            .attr("class", "static_year")
            .style("text-anchor", "start")
            .text(function (d) { return d[0].year });

        svg.append("text")
            .attr("x", widthGenre + 20)
            .attr("y", heightGenre + marginGenre.bottom / 2 + 5)
            .attr("class", "static_year")
            .style("text-anchor", "end")
            .text(function (d) { return d[d.length - 1].year });

        circle = svg.append("circle")
            .classed("yearCircle", true)
            .attr("r", 2.2)
            .attr("opacity", 0)
            .style("pointer-events", "none");

        caption = svg.append("text")
            .attr("class", "caption")
            .attr("text-anchor", "middle")
            .style("pointer-events", "none")
            .attr("dy", -6);

        curYear = svg.append("text")
            .attr("class", "year")
            .attr("text-anchor", "middle")
            .style("pointer-events", "none")
            .attr("dy", marginGenre.bottom / 2)
            .attr("y", heightGenre);

        svg.append("rect")
            .attr("class", "bg")
            .attr("width", widthGenre)
            .attr("height", heightGenre)
            .on("mouseover", mouseOverFunc)
            .on("mousemove", mouseMoveFunc)
            .on("mouseout", mouseOutFunc);
    }
})

function mouseOverFunc(d) {
    d3.selectAll(".yearCircle").attr("opacity", 1.0);
    d3.selectAll(".static_year").classed("hidden", true);
    return mouseMoveFunc.call(this);
}
function mouseMoveFunc(d) {
    var year = Math.round(xScaleGenre.invert(d3.pointer(d)[0]));
    var index = year - 1973;
    d3.selectAll(".yearCircle")
        .attr("r", 5)
        .attr("cx", xScaleGenre(year))
        .attr("cy", function (c) {
            if (typeof (c) == "object") {
                return yScaleGenre(c[year - 1973].amount);
            }
            return 0;
        });
    d3.selectAll("text.caption")
        .attr("x", xScaleGenre(year))
        .attr("y", function (c) {
            if (typeof (c) == "object") {
                return yScaleGenre(c[index].amount) - 10;
            }
            return 0
        })
        .text(function (c) {
            if (typeof (c) == "object") {
                return Math.round(c[index].amount * 100) + "%";
            }
            return 0
        });
    d3.selectAll("text.year")
        .attr("x", xScaleGenre(year))
        .text(year);
}
function mouseOutFunc(d) {
    d3.selectAll(".static_year").classed("hidden", false);
    d3.selectAll(".yearCircle").attr("opacity", 0);
    d3.selectAll("text.caption").text("");
    d3.selectAll("text.year").text("");
}