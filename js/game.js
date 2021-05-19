// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyCpjRTC3KmhRgrwBKKwLJvhrW_Kw8rvP_Y",
    authDomain: "datavizfinal-cd6ad.firebaseapp.com",
    projectId: "datavizfinal-cd6ad",
    storageBucket: "datavizfinal-cd6ad.appspot.com",
    messagingSenderId: "473927765723",
    appId: "1:473927765723:web:34968554648a27d64706fe"
};
// Initialize Firebase
// firebase.initializeApp(firebaseConfig);

var game_results = {"score": 0, "falsePos": 0, "falseNeg": 0, "players": 0}
function updateVals(){
    firebase.database().ref('game').on('value', function (snapshot) {
        game_results["score"] = snapshot.val().score
        game_results["falsePos"] = snapshot.val().falsePos
        game_results["falseNeg"] = snapshot.val().falseNeg
        game_results["players"] = snapshot.val().players
    })
}

// intro poll
var gameWidth = 400;
var gameHeight = 100;
var barHeight = 40;
var userScore = 0;
var userAnswered = 0;
var userFalsePos = 0;
var userFalseNeg = 0;

var summary_bars_svg = d3.select("#highest_gross_chart_legend").append("svg")
    .attr("width", 800)
    .attr("height", 100)
    .classed('summary_bars_svg', true);

d3.csv('https://raw.githubusercontent.com/fivethirtyeight/data/master/bechdel/movies.csv', d3.autoType)
    .then(updateVals())
    .then(function (movies) {
        // pass = movies.filter(mov => (mov.domgross >= 100000000)&&(mov.binary=="PASS"));
        // pass = pass.sort(() => 0.5 - Math.random());
        // pass = pass.slice(0, 5)

        // fail = movies.filter(mov => (mov.domgross >= 100000000) && (mov.binary == "FAIL"));
        // fail = fail.sort(() => 0.5 - Math.random());
        // fail = fail.slice(0, 5)

        // pop_movies = pass.concat(fail)
        // pop_movies = pop_movies.sort(() => 0.5 - Math.random());

        pop_movies = movies.filter(mov => (mov.domgross >= 100000000));
        pop_movies = pop_movies.sort(() => 0.5 - Math.random());
        pop_movies = pop_movies.slice(0, 10)

        function setColor(vote) {
            return vote == "Yes" ? "#71c788" : "#db8181";
        };
        
        function cast_vote(d){
            target = d.target
            if (target.classList.contains("answered")){
                // console.log("answered", target.attributes.movie)
                return;
            } else {
                attributes = target.attributes
                chosen = attributes.value.value
                answer = attributes.answer.value
                // console.log(chosen, answer)

                if (chosen == answer){
                    target.classList.add("correct")
                    userScore++
                } else {
                    target.classList.add("incorrect")
                    if (chosen == "FAIL") {
                        userFalseNeg++
                    } else if (chosen == "PASS") {
                        userFalsePos++
                    }
                }
    
                attribute = "[movie='" + attributes.movie.value + "']"
                movieButtons = document.querySelectorAll(attribute).forEach(function(d){
                    d.classList.add("answered")
                })

                document.querySelector("#gameScore").innerHTML = userScore

                userAnswered++
                if (userAnswered == 10) {
                    console.log("YAY", userScore, userFalsePos, userFalseNeg)
                    firebase.database().ref('game').update({
                        "score": userScore + game_results['score'],
                        "falsePos": userFalsePos + game_results['falsePos'],
                        "falseNeg": userFalseNeg + game_results['falseNeg'],
                        "players": game_results['players']+1,
                    });
                    showGameChart()
                }
            }
        };

        var game_movie_ids = [];

        var svg = d3.select("#game").selectAll("svg")
            .data(pop_movies)
            .enter()
            .append("svg")
            .attr("class", "game")
            .attr("width", fullWidthGenre)
            .attr("height", 140)
            .append("g")
            .attr("transform", "translate(" + marginGenre.left + "," + marginGenre.right + ")")
            .each(multiple)

        function multiple(model){
            d3.select(".dots").append("div")
                .attr("class", "dot dot"+game_movie_ids.length);
                    
            d3.select(this.parentNode)
                .attr("class", function (d) {
                    game_movie_ids.push(d.imdb);
                    return d.imdb + "_game game_movie fade"
                });
            
            
            var svg = d3.select(this)
                .append("g")
                .attr("class", function (d) {
                    return d.imdb + "_svg"
                });

            svg.append("rect")
                .attr('name', 'yes')
                .attr('class', 'poll_button')
                .attr('movie', function (d) {
                    return d.imdb
                })
                .attr('answer', function(d){
                    return d.binary
                })
                .attr("value", "PASS")
                .attr("width", gameWidth)
                .attr("height", gameHeight)
                .style("fill", "white")
                .on("click", cast_vote)

            svg.append("text")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("x", gameWidth/2-30)
                .attr("y", barHeight/2)
                .style("fill", "black")
                .text("PASS")
            
            svg.append("rect")
                .attr('name', 'no')
                .attr('class', 'poll_button')
                .attr('movie', function (d) {
                    return d.imdb
                })
                .attr('answer', function (d) {
                    return d.binary
                })
                .attr("value", "FAIL")
                .attr("y", barHeight + 10)
                .attr("width", gameWidth)
                .attr("height", gameHeight)
                .style("fill",  "#222")
                .on("click", cast_vote);
            
            svg.append("text")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("x", gameWidth / 2 - 30)
                .attr("y", barHeight + 10 + barHeight / 2)
                .style("fill", "white")
                .text("FAIL")

            svg.append("text")
                .attr("class", "label")
                .attr("x", widthGenre / 2)
                .attr("y", -10)
                .style("text-anchor", "middle")
                .style("fill", "white")
                .style("font-size", "20px")
                .style("font-weight", "bold")
                .text(function (d) { return d.title; });
        }

        d3.select("#game_buttons").append("div")
            .attr("class", "prev")
            .text("Previous")
            .style("fill", "white")
            .on("click", prevSlide);
        
        d3.select("#game_buttons").append("div")
            .attr("class", "next")
            .text("Next")
            .on("click", nextSlide)
            .style("fill", "white");

    
        var slideIndex = 1;
        showSlides(slideIndex);

        // Next/previous controls
        function nextSlide() {
            showSlides(slideIndex += 1);
        }

        function prevSlide() {
            showSlides(slideIndex -= 1);
        }

        function showSlides(n) {
            var i;
            var slides = game_movie_ids;
            // console.log(slides);
            if (n >= slides.length) {
                slideIndex = slides.length;
                d3.select(".next").style("display", "none");
                
            } else {
                d3.select(".next").style("display", "flex");
                
            }
            if (n <= 1) {
                slideIndex = 1;
                d3.select(".prev").style("display", "none");
                
            } else {
                d3.select(".prev").style("display", "flex");
                
            }
            for (i = 0; i < slides.length; i++) {
                d3.select("."+slides[i]+"_game").style("display", "none");
                d3.select(".dot"+i).classed("active", false);
            }
            d3.select("."+game_movie_ids[slideIndex-1]+"_game").style("display", "block");
            d3.select(".dot"+(slideIndex-1)).classed("active", "true");
        }
    })

function showGameChart(){

    document.querySelector("#gameChartDiv").style["display"] = "block"

    var gameChartMargin = { top: 10, right: 30, bottom: 20, left: 50 },
        gameChartWidth = 600 - gameChartMargin.left - gameChartMargin.right,
        gameChartHeight = 400 - gameChartMargin.top - gameChartMargin.bottom;
    
    // append the svg object to the body of the page
    var svg = d3.select("#gameChart")
        .append("svg")
        .attr("width", gameChartWidth + gameChartMargin.left + gameChartMargin.right)
        .attr("height", gameChartHeight + gameChartMargin.top + gameChartMargin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + gameChartMargin.left + "," + gameChartMargin.top + ")");
    
    // Parse the Data
    d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_stacked.csv", d3.autoType).then(function (data) {
    
        // console.log(data)
        data = [{ "Type": "Score", "You": userScore, "Others": Math.round(game_results["score"] / game_results["players"]) }, 
                { "Type": "False Positive", "You": userFalsePos, "Others": Math.round(game_results["falsePos"] / game_results["players"]) },
                { "Type": "False Negative", "You": userFalseNeg, "Others": Math.round(game_results["falseNeg"] / game_results["players"]) }]
        // console.log(data)
    
        // List of subgroups = header of the csv files = soil condition here
        // var subgroups = data.columns.slice(1)
        var subgroups = ["You", "Others"]
        // console.log(subgroups)
    
        // List of groups = species here = value of the first column called group -> I show them on the X axis
        // var groups = d3.map(data, function (d) { return (d.Type) }).keys()
        var groups = ["Score", "False Positive", "False Negative"]
    
        // Add X axis
        var gameChartx = d3.scaleBand()
            .domain(groups)
            .range([0, gameChartWidth])
            .padding([0.2])
        svg.append("g")
            .attr("transform", "translate(0," + gameChartHeight + ")")
            .call(d3.axisBottom(gameChartx).tickSize(0));
    
        // Add Y axis
        var gameCharty = d3.scaleLinear()
            .domain([0, 10])
            .range([gameChartHeight, 0]);
        svg.append("g")
            .call(d3.axisLeft(gameCharty));
    
        // Another scale for subgroup position?
        var xSubgroup = d3.scaleBand()
            .domain(subgroups)
            .range([0, gameChartx.bandwidth()])
            .padding([0.05])
    
        // color palette = one color per subgroup
        var color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(['steelblue', 'darkgray'])
    
        // Show the bars
        svg.append("g")
            .selectAll("g")
            // Enter in data = loop group per group
            .data(data)
            .enter()
            .append("g")
            .attr("transform", function (d) { return "translate(" + gameChartx(d.Type) + ",0)"; })
            .selectAll("rect")
            .data(function (d) { return subgroups.map(function (key) { return { key: key, value: d[key] }; }); })
            .enter().append("rect")
            .attr("x", function (d, i) { return xSubgroup(d.key); })
            .attr("y", function (d) { return gameCharty(d.value); })
            .attr("width", xSubgroup.bandwidth())
            .attr("height", function (d) { return gameChartHeight - gameCharty(d.value); })
            .attr("fill", function (d) { return color(d.key); });

        var gameG = svg.append("g")
            .attr("transform", "translate("+0+","+gameChartMargin.top+")")
    
        var legend = gameG.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(subgroups)
            .enter().append("g")
            .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", gameChartWidth - 19)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", function(d){
                return color(d)
            });

        legend.append("text")
            .attr("x", gameChartWidth - 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .style("fill", "white")
            .text(function (d) { return d; });

    })
}
