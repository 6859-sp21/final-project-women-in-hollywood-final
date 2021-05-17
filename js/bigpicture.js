movie_titles = [];
// getting all required elements
const searchWrapper = document.querySelector(".search-input");
const inputBox = searchWrapper.querySelector("input");
const suggBox = searchWrapper.querySelector(".autocom-box");

function select(element) {
    let selectData = element.textContent;
    let resultBox = document.querySelector(".movie_result");
    inputBox.value = selectData;

    let result = ""
    d3.csv('https://raw.githubusercontent.com/fivethirtyeight/data/master/bechdel/movies.csv', d3.autoType)
        .then(function (movies) {
            let selectedMovie = movies.filter(mov => mov.title == selectData)[0];
            // console.log(selectedMovie);
            result += `<h3 class="` + selectedMovie.binary + `"> This movie ` + selectedMovie.binary + `ED. </h3>`
            if (selectedMovie.binary === "FAIL") {
                result += "<p class='FAIL'>"
                switch (selectedMovie.clean_test) {
                    case "men":
                        result += "The women only talked about men"
                        break;
                    case "nowomen":
                        result += "There were no prominent female characters in the movie"
                        break;
                    case "notalk":
                        result += "The women did not talk to each other"
                        break;
                    case "dubious":
                        result += "There was no consensus among viewers of passing"
                }
                result += "</p>"
            }
            result += `<p> Budget: $` + (selectedMovie.budget).toLocaleString('en') + `</p>`
            result += `<p> Grossed (domestic): $` + (selectedMovie.domgross).toLocaleString('en') + `</p>`
            result += `<p> Grossed (international): $` + (selectedMovie.intgross).toLocaleString('en') + `</p>`
            resultBox.innerHTML = result;
        });
    searchWrapper.classList.remove("active");
    document.querySelector(".movie_result").classList.remove("hidden");
}
d3.csv('https://raw.githubusercontent.com/fivethirtyeight/data/master/bechdel/movies.csv', d3.autoType)
    .then(function (movies) {

        movie_titles = movies.map(movie => movie.title);
        // console.log(suggestions)          
        // if user press any key and release
        inputBox.onkeyup = (e) => {
            document.querySelector(".movie_result").classList.add("hidden");
            let userData = e.target.value; //user entered data
            let emptyArray = [];
            if (userData) {
                emptyArray = movie_titles.filter((data) => {
                    // console.log(data, "data");
                    //filtering array value and user characters to lowercase and return only those words which are start with user entered chars
                    return data.toString().toLocaleLowerCase().startsWith(userData.toLocaleLowerCase());
                });
                emptyArray = emptyArray.map((data) => {
                    return data = '<li>' + data + '</li>';
                });
                searchWrapper.classList.add("active"); //show autocomplete box
                showSuggestions(emptyArray);
                let allList = suggBox.querySelectorAll("li");
                for (let i = 0; i < allList.length; i++) {
                    //adding onclick attribute in all li tag
                    allList[i].setAttribute("onclick", "select(this)");
                }
            } else {
                searchWrapper.classList.remove("active"); //hide autocomplete box
            }
        }

        function showSuggestions(list) {
            let listData;
            if (!list.length) {
                listData = '<li> No Results Found </li>';
            } else {
                listData = list.join('');
            }
            suggBox.innerHTML = listData;
        }
    });

// Load data from a URL. You can also have the json file downloaded.
// See https://github.com/d3/d3/blob/master/API.md#fetches-d3-fetch for more options.
const earliestYear = 1973;
const latestYear = 2013;

// set the dimensions and margins of the graph
var margin = { top: 10, right: 10, bottom: 40, left: 40 },
    width = 900,
    height = 450;


// for the bubble chart
var bubble_chart_width = 720,
    bubble_chart_height = 650;

var w = bubble_chart_width, h = bubble_chart_height;

var forceStrength = 5;

var bubble_chart_svg = d3.select("#bubble_chart").append("svg")
    .attr("width", w)
    .attr("height", h)

var bubble_legend_svg = d3.select("#bubble_legend").append("svg")
    .attr("width", 320)
    .attr("height", 400)

var simulation = d3.forceSimulation()
    .force("collide", d3.forceCollide(function (d) {
        return d.r + 2
    }).iterations(20)
    )
    .force("charge", d3.forceManyBody())
    .force("y", d3.forceY().y(h / 2))
    .force("x", d3.forceX().x(w / 2));
// .stop();

bubble_chart_svg.append("text")
    .attr("x", (width / 2))
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Movies In Year")
    .attr("fill", "white");

//Read the data
d3.csv('https://raw.githubusercontent.com/fivethirtyeight/data/master/bechdel/movies.csv', d3.autoType)
    .then(function (movies) {
        // console.log("movies", movies[0]);
        years = [];
        yearRange = [earliestYear, latestYear]
        moviesPercentPassed = [];
        totMovies = 0
        totPassed = 0
        for (year = earliestYear; year <= latestYear; year++) {
            moviesInYear = movies.filter(mov => mov.year === year);
            numMovies = moviesInYear.length;
            moviesPassedInYear = moviesInYear.filter(mov => mov.binary === "PASS");
            numMoviesPassed = moviesPassedInYear.length;

            moviesPercentPassed.push(numMoviesPassed / numMovies);
            movies.push(year);
            totMovies += numMovies
            totPassed += numMoviesPassed
        }
        yearsNum = latestYear - earliestYear
        percentMoviesPassed = totPassed / totMovies

        const svg = d3.create('svg')
            .attr('width', width)
            .attr('height', height);
        const g = svg.append('g')
            .classed('marks', true)
        // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Add X axis --> the years
        var x = d3.scaleLinear()
            .domain([earliestYear, latestYear])
            .range([margin.left, width - margin.right]);
        svg.append("g")
            .classed('x-axis', true)
            .attr("transform", "translate(0," + (height - margin.bottom) + ")")
            .call(d3.axisBottom(x).tickFormat(d3.format("d")));

        var indexToYear = d3.scaleLinear()
            .domain([0, yearsNum])
            .range([earliestYear, latestYear])

        var brushToYear = d3.scaleLinear()
            .domain([margin.left, width - margin.right])
            .range([earliestYear, latestYear])

        var yearToIndex = d3.scaleLinear()
            .domain([earliestYear, latestYear])
            .range([0, yearsNum])

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, 1])
            .range([height - margin.bottom, margin.top]);
        svg.append("g")
            .classed('y-axis', true)
            .attr('transform', "translate(" + (margin.left) + ",0)")
            .call(d3.axisLeft(y).tickFormat(function (d) { return d * 100 + "%" }));

        // Add the line
        svg.append("path")
            .datum(moviesPercentPassed)
            // .attr('transform', "translate(" + margin.left + ",0)")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function (d, i) { return x(indexToYear(i)) })
                .y(function (d) { return y(d) })
            )

        d3.select("#resetButton")
            .on("click", function () {
                yearRange = [earliestYear, latestYear]
                allgroupsCount = ["", ""]

                yearLabel(yearRange[0], yearRange[1])
                percentPassed(yearRange[0], yearRange[1], percentMoviesPassed)
                chartsDataJoin([]);
                bubbleDirections()
                bubbleLegendCount()

                d3.selectAll(".selection").attr("width", "0");
            });

        var focus = svg.append("g")
            .append("circle")
            .style("fill", "none")
            .style("stroke", "white")
            .attr("stroke", "black")
            .attr("r", 8.5)
            .style("opacity", 0)

        var focusText = svg.append("g")
            .append("text")
            .style("opacity", 0)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("fill", "white")

        var focusTextYear = svg.append("g")
            .append("text")
            .style("opacity", 0)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("fill", "white")

        function getDotColor(index) {
            year = indexToYear(index)
            if (yearRange[0] == earliestYear && yearRange[1] == latestYear) {
                return 0.5
            }
            if (Math.floor(year) >= yearRange[0] && Math.floor(year) <= yearRange[1]) {
                return 1
            }
            return 0.25;
        };

        function bubbleDirections() {
            if (yearRange[0] == earliestYear && yearRange[1] == latestYear) {
                bubble_chart_svg.append("text")
                    .classed("bubbleDirections", true)
                    .attr("x", (w / 2))
                    .attr("y", (h / 2))
                    .attr("text-anchor", "middle")
                    .style("font-size", "24px")
                    .text("Click and drag the line chart to select years to explore")
                    .attr("fill", "white");
                    
            }
        }
        bubbleDirections()

        function chartsDataJoin(rawData = movies) {
            dataJoin(rawData);
            dataJoinBubble(rawData);
        };

        function yearLabel(early, end) {
            svg.selectAll(".yearLabel").remove()
            document.getElementById("bubbleYear").innerHTML = ""
            // console.log(early, end)
            if (earliestYear != early && latestYear != end) {
                if (end != early) {
                    yearText = early + " to " + end
                } else {
                    yearText = early
                }
                const yearLabel = svg.append('text')
                    .attr("class", "yearLabel")
                    .attr('x', 70)
                    .attr('y', margin.top + 70)
                    .attr('fill', 'SteelBlue')
                    .attr('font-family', 'Helvetica Neue, Arial')
                    .attr('font-weight', 500)
                    .attr('font-size', 80)
                    .text(yearText);

                document.getElementById("bubbleYear").innerHTML = yearText
            }
        }

        const symbol = d3.symbol();
        function dataJoin(rawData = movies) {
            // const data = rawData.filter(d => d.year === year);

            g.selectAll('path')
                .data(moviesPercentPassed)
                .join('path')
                .classed('country', true) // can reference these marks like css, i.e. 'path.country'
                .attr('transform', (d, i) => `translate(${x(indexToYear(i))}, ${y(d)})`)
                .attr('fill', "steelblue")
                .attr('fill-opacity', (d, i) => getDotColor(i))
                .attr('d', d => symbol())
        }
        dataJoin(moviesPercentPassed);

        const brush = d3.brushX()  // Add the brush feature using the d3.brush function
            // .extent([[0, 0], [width, height]]) // wrong
            .extent([[margin.left, 0], [width, height - margin.bottom]])
            .on("start brush end", brushed)

        svg.select("g.marks")
            .attr("class", "brush")
            .call(brush)

            .on('mouseover', function () {
                focus.style("opacity", 1)
                focusText.style("opacity", 1)
                focusTextYear.style("opacity", 1)
            })
            .on('mousemove', function (event, d) {
                // console.log(d3.pointer(event)[0], brushToYear(d3.pointer(event)[0]))
                var i = Math.round(yearToIndex(brushToYear(d3.pointer(event)[0])));
                selectedData = moviesPercentPassed[i]
                // console.log(event.pageX, "x:", i, ', y:', selectedData)
                focus
                    .attr("cx", x(indexToYear(i)))
                    .attr("cy", y(selectedData))
                focusText
                    .html(Math.round(selectedData * 100) + "%")
                    .attr("x", x(indexToYear(i)) - 10)
                    .attr("y", y(selectedData) - 20)
                focusTextYear
                    .html(indexToYear(i))
                    .attr("x", x(indexToYear(i)) - 10)
                    .attr("y", y(selectedData) - 40)
            })
            .on('mouseout', function () {
                focus.style("opacity", 0)
                focusText.style("opacity", 0)
                focusTextYear.style("opacity", 0)
            });

        // 11. add brush callback to handle brush event
        let brushedData = [];
        function brushed(event) {
            const coords = event.selection;
            if (coords) {
                x0 = coords[0]
                x1 = coords[1]

                yearRange = [Math.ceil(brushToYear(x0)), Math.floor(brushToYear(x1))]
                if (yearRange[0] == earliestYear && yearRange[1] == latestYear) {
                    allgroupsCount = ["", ""]
                    brushedData = []
                } else {
                    brushedData = movies.filter(mov => mov.year >= yearRange[0] && mov.year <= yearRange[1])
                    percentMoviesPassed = (brushedData.filter(mov => mov.binary === "PASS").length) / (brushedData.length)
                    allgroupsCount = [brushedData.filter(mov => mov.binary === "PASS").length, brushedData.filter(mov => mov.binary === "FAIL").length]
                }
            } else {
                yearRange = [earliestYear, latestYear]
                allgroupsCount = ["", ""]
            }

            yearLabel(yearRange[0], yearRange[1])
            percentPassed(yearRange[0], yearRange[1], percentMoviesPassed)
            chartsDataJoin(brushedData);
            bubbleDirections()
            bubbleLegendCount()
        };

        document.getElementById("line_chart").appendChild(svg.node());

        // BUBBLE CHART BASED ON BRUSHED DATA
        //bubble chart datajoin
        var radius_var = 'intgross';

        function dataJoinBubble(brushedData = []) {
            // console.log(radius_var, "radius_var");
            bubble_chart_svg.selectAll('*').remove();
            brushedData.forEach(function (movie) {
                movie.r = setScale(movie[radius_var]);
                movie.x = w / 2;
                movie.y = h / 2;
                var txt = document.createElement("textarea");
                txt.innerHTML = movie.title;
                movie.title = txt.value;
            })
            // console.log(brushedData)
            // bind nodes data to circle elements
            const elements = bubble_chart_svg.selectAll('.bubble')
                .data(brushedData, function (d) { return d.imdb; })
                .enter()
                .append('g')

            let bubbles = elements
                .append('circle')
                .classed('bubble', true)
                .attr('r', d => d.r)
                .attr('fill', d => setColor2(d.clean_test))
                .attr("class", function (d) { return "bubbles " + d.binary })
                .attr("cx", function (d, i) { return 175 + 25 * i + 2 * i ** 2; })
                .attr("cy", function (d, i) { return 250; })
                // .style("stroke", function(d, i){ return setColor(d.binary) })
                .style("stroke-width", 1)
                .style("pointer-events", "all")
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended))
                .on("mouseover", function (event, d) {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0.8)
                    tooltipHTML = "<b>" + d.title +
                        "</b> (<i>" + d.year +
                        "</i>)<br><b>Budget</b>: $" + (d.budget).toLocaleString('en') +
                        "<br><b>Grossed (domestic)</b>: $" + (d.domgross).toLocaleString('en') +
                        "<br><b>Grossed (international)</b>: $" + (d.intgross).toLocaleString('en')
                    if (d.binary === "FAIL") {
                        tooltipHTML += "<br><b>FAIL</b> because "
                        switch (d.clean_test) {
                            case "men":
                                tooltipHTML += "women only talked about men"
                                break;
                            case "nowomen":
                                tooltipHTML += "no prominent female characters in movie"
                                break;
                            case "notalk":
                                tooltipHTML += "women did not talk to each other"
                                break;
                            case "dubious":
                                tooltipHTML += "no consensus among viewers of passing"
                        }
                    }
                    tooltip.html(tooltipHTML)
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY) + "px")

                    d3.select(this)
                        .style("stroke", "black")
                })
                .on("mouseout", function (event, d) {
                    tooltip.transition()
                        .duration(100)
                        .style("opacity", 0)
                        .style("top", "-1000px")
                        .style("left", "-1000px")

                    d3.select(this)
                        .style("stroke", setColor2(d.clean_test))
                })

            // labels
            let labels = elements
                .append('text')
                .attr('dy', '.3em')
                .attr("class", function (d) { return "bubbles " + d.binary })
                .style('text-anchor', 'middle')
                .style('font-size', function (d) { return d.r >= 25 ? 10 : 0 })
                .text(d => {
                    let width = d.r * 2;
                    if (width > 50) {
                        return d.title
                    } else {
                        return ""
                    }
                })
                .attr("fill", "white")

            function ticked() {
                // for (let i = 0; i < 5; i++) {
                //   simulation.tick();
                // }
                // console.log("tick");
                simulation.alphaTarget(1).restart();
                bubbles
                    .attr('cx', d => d.x)
                    .attr('cy', d => d.y)
                labels
                    .attr('x', d => d.x)
                    .attr('y', d => d.y)
                // .each(updateText)
            }

            simulation
                .nodes(brushedData)
                .on("tick", ticked)
                .restart()

        }

        function setScale(value) {
            if (radius_var == 'intgross') {
                return Math.sqrt(value * 0.00001 / Math.PI)
            } else if (radius_var == 'domgross') {
                return Math.sqrt(value * 0.000015 / Math.PI)
            } else if (radius_var == 'budget') {
                return Math.sqrt(value * 0.00002 / Math.PI)
            }
        }

        // Add a scale for bubble color
        function setColor(test_result) {
            return test_result == "PASS" ? "#71c788" : "#db8181";
        };

        function setColor2(test_result){
            if (test_result=="men"){
                return "#db8181"
            } else if (test_result == "nowomen") {
                return "#631c1c"
            } else if (test_result == "notalk") {
                return "#b23333"
            } else if (test_result == "dubious") {
                return "#db8181"
            } else {
                return "#71c788"
            }
        }

        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)

        function updateLegendAndChart(d) {
            // console.log("HELLO", d.target.name)
            if (d.target.name != radius_var) {
                let legend_title;
                if (d.target.name == "intgross") {
                    legend_title = "International Gross (M)";
                    valuesToShow = [10000000, 100000000, 500000000, 1000000000]
                } else if (d.target.name == "domgross") {
                    legend_title = "Domestic Gross (M)";
                    valuesToShow = [10000000, 100000000, 500000000]
                } else {
                    legend_title = "Budget (M)";
                    valuesToShow = [10000000, 100000000, 500000000]
                }
                radius_var = d.target.name;
                bubble_legend_svg.selectAll(".circle_legend_title").remove()
                bubble_legend_svg.append("text")
                    .attr('x', xCircle)
                    .attr("y", height - 100 + 30)
                    .text(legend_title)
                    .attr("class", "circle_legend_title")
                    .attr("text-anchor", "middle")
                    .attr("fill", "white")
                dataJoinBubble(brushedData);
            }
            // console.log(brushedData, "brushed data");
            // console.log(d.target.name, "new radius variable")
            legendMaking()
        }

        d3.select(".button_group")
            .append("button")
            .attr('name', 'domgross')
            .attr('class', 'legend_button')
            .attr("fill", "white")
            .text("Domestic Gross")
            .on("click", updateLegendAndChart);
        d3.select(".button_group")
            .append("button")
            .attr('name', 'intgross')
            .attr('class', 'legend_button')
            .attr("fill", "white")
            .text("International Gross")
            .on("click", updateLegendAndChart);
        d3.select(".button_group")
            .append("button")
            .attr('name', 'budget')
            .attr('class', 'legend_button')
            .attr("fill", "white")
            .text("Budget")
            .on("click", updateLegendAndChart);



        var valuesToShow = [10000000, 100000000, 1000000000]
        var xCircle = 120
        var xLabel = 240
        function legendMaking() {
            bubble_legend_svg.selectAll(".circleMaking").remove()
            bubble_legend_svg
                .selectAll("legend")
                .data(valuesToShow)
                .enter()
                .append("circle")
                .classed("circleMaking", true)
                .attr("cx", xCircle)
                .attr("cy", function (d) { return height - 100 - setScale(d) })
                .attr("r", function (d) { return setScale(d) })
                .style("fill", "none")
                .attr("stroke", "white")

            // Add legend: segments
            bubble_legend_svg
                .selectAll("legend")
                .data(valuesToShow)
                .enter()
                .append("line")
                .classed("circleMaking", true)
                .attr('x1', function (d) { return xCircle + setScale(d) })
                .attr('x2', xLabel)
                .attr('y1', function (d) { return height - 100 - setScale(d) })
                .attr('y2', function (d) { return height - 100 - setScale(d) })
                .attr('stroke', 'black')
                .style('stroke-dasharray', ('2,2'))

            // Add legend: labels
            bubble_legend_svg
                .selectAll("legend")
                .data(valuesToShow)
                .enter()
                .append("text")
                .classed("circleMaking", true)
                .attr('x', xLabel)
                .attr('y', function (d) { return height - 100 - setScale(d) })
                .attr("fill", "white")
                .text(function (d) { return d / 1000000 })
                .style("font-size", 10)
                .attr('alignment-baseline', 'middle')
        }
        legendMaking()

        // Legend title
        bubble_legend_svg.append("text")
            .attr('x', xCircle)
            .attr("y", height - 100 + 30)
            .attr("class", "circle_legend_title")
            .text("International Gross (M)")
            .attr("text-anchor", "middle")
            .attr("fill", "white")

        // Add one dot in the legend for each name.
        var size = 20
        var allgroups = ["PASS", "FAIL"]
        bubble_legend_svg.selectAll("legend_dots")
            .data(allgroups)
            .enter()
            .append("circle")
            .attr("cx", 120)
            .attr("cy", function (d, i) { return 120 + i * (size + 5) }) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 7)
            .style("fill", function (d) {
                return setColor(d);
            })

        function percentPassed(early, end, passed) {
            bubble_legend_svg.selectAll(".percentPassed").remove()
            if (!isNaN(passed) && (earliestYear != early || latestYear != end)) {
                passed = (passed * 100).toFixed(2)

                if (end != early) {
                    yearText = "of movies from " + early + " to " + end + " passed"
                } else {
                    yearText = "of movies in " + early + " passed"
                }
                const percentPassedLabel = bubble_legend_svg.append('text')
                    .attr("class", "percentPassed")
                    .attr('x', "50%")
                    .attr('y', margin.top + 30)
                    .attr('fill', 'gray')
                    .attr('font-family', 'Helvetica Neue, Arial')
                    // .attr('font-weight', 500)
                    .attr('font-size', 30)
                    .attr('text-align', 'center')
                    .attr("dominant-baseline", "middle")
                    .attr("text-anchor", "middle")
                    .text(passed + "%");

                const percentPassedYearLabel = bubble_legend_svg.append('text')
                    .attr("class", "percentPassed")
                    .attr('x', "50%")
                    .attr('y', margin.top + 60)
                    .attr('fill', 'gray')
                    .attr('font-family', 'Helvetica Neue, Arial')
                    // .attr('font-weight', 500)
                    // .attr('font-size', 80)
                    .attr("dominant-baseline", "middle")
                    .attr("text-anchor", "middle")
                    .attr("fill", "white")
                    .text(yearText);
            }
        }

        // Add labels beside legend dots
        allgroupsCount = ["", ""]
        function bubbleLegendCount() {
            bubble_legend_svg.selectAll(".PFLabel").remove()

            bubble_legend_svg.selectAll("mylabels")
                .data(allgroups)
                .enter()
                .append("text")
                .classed("PFLabel", true)
                .attr("x", 120 + size * .8)
                .attr("y", function (d, i) { return 110 + i * (size + 5) + (size / 2) }) // 100 is where the first dot appears. 25 is the distance between dots
                .style("fill", function (d) { return setColor(d) })
                .text(function (d, i) {
                    if (allgroupsCount[i] != "") {
                        return d + " (" + allgroupsCount[i] + ")"
                    } else {
                        return d
                    }
                })
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle")
                .on("mouseover", highlight)
                .on("mouseleave", noHighlight)
        }
        bubbleLegendCount()
        bubble_legend_svg.append("text")
            .attr("x", 0)
            .attr("y", 180)
            .attr("text-anchor", "left")
            .classed("legend_caption", true)
            .style("alignment-baseline", "middle")
            .text("hover on PASS or FAIL to highlight only those bubbles")
            .attr("fill", "white")


        // What to do when one group is hovered
        function highlight(d) {
            // reduce opacity of all groups
            d3.selectAll(".bubbles").style("opacity", .06)
            // except the one that is hovered
            splitter = d.target.innerHTML.split(" ")[0]
            d3.selectAll("." + splitter).style("opacity", 1)
        }

        // And when it is not hovered anymore
        function noHighlight(d) {
            d3.selectAll(".bubbles").style("opacity", 1)
        }

        function dragstarted(mouse, node) {
            // console.log("dragstarted ", "movie", node, "d", mouse)
            if (!mouse.active) simulation.alphaTarget(1).restart();
            node.fx = mouse.x;
            node.fy = mouse.y;

        }

        function dragged(mouse, node) {
            // console.log("dragged " + node)
            node.fx = mouse.x;
            node.fy = mouse.y;
        }

        function dragended(mouse, node) {
            // console.log("dragended " + node)
            if (!mouse.active) simulation.alphaTarget(0);
            node.fx = null;
            node.fy = null;
            var me = d3.select(this)

        }

    });