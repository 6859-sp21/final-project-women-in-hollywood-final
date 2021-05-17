// Your web app's Firebase configuration
// var firebaseConfig = {
//     apiKey: "AIzaSyCpjRTC3KmhRgrwBKKwLJvhrW_Kw8rvP_Y",
//     authDomain: "datavizfinal-cd6ad.firebaseapp.com",
//     projectId: "datavizfinal-cd6ad",
//     storageBucket: "datavizfinal-cd6ad.appspot.com",
//     messagingSenderId: "473927765723",
//     appId: "1:473927765723:web:34968554648a27d64706fe"
// };
// Initialize Firebase
// firebase.initializeApp(firebaseConfig);

// var poll_results_json = [{"name": "Yes", "value": 0},{"name": "No", "value": 0}];
// var pollTot = 0
// function updateVals(){
//     firebase.database().ref('poll').on('value', function (snapshot) {
//         poll_results_json[0]["value"] = snapshot.val().yes
//         poll_results_json[1]["value"] = snapshot.val().no
//         pollTot = poll_results_json[0]['value'] + poll_results_json[1]['value']
//     })
// }
// updateVals()
// console.log(poll_results_json)

// intro poll
var gameWidth = 400;
var gameHeight = 100;
var barHeight = 40;
var userScore = 0;

d3.csv('https://raw.githubusercontent.com/fivethirtyeight/data/master/bechdel/movies.csv', d3.autoType)
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
                }
    
                attribute = "[movie='" + attributes.movie.value + "']"
                movieButtons = document.querySelectorAll(attribute).forEach(function(d){
                    d.classList.add("answered")
                })

                document.querySelector("#gameScore").innerHTML = userScore
            }
        };
        
        function display_poll_results(poll_results_json) {
            poll_g = poll_result_svg.append("g")
                .attr("width", gameWidth)
                .attr("height", gameHeight)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            
            poll_results_json.sort(function (a, b) {
                return d3.ascending(a.name, b.name);
            })
            var y = d3.scaleOrdinal()
                .range([50, 0], .1)
                .domain(poll_results_json.map(function (d) {
                    return d.name;
                }));
        
            var x = d3.scaleLinear()	
            .rangeRound([0, 300])
            .domain([0, d3.max(poll_results_json, function (d) {
                return d.value;
            })]);
        
            var bars = poll_result_svg.selectAll(".bar")
                .data(poll_results_json)
                .enter()
                .append("g")
        
            //append rects
            bars.append("rect")
                .attr("class", "bar")
                .attr("y", function (d) {
                    return y(d.name)+8;
                })
                .attr("height", barHeight)
                .attr("x", 0)
                .attr("fill",  function (d) { return setColor(d.name) })
                .attr("width", function (d) {
                    return 0;
                })
        
            bars.selectAll("rect")
                .transition().duration(1000)	
                .attr("height", barHeight)
                .attr("x", 0)
                .attr("width", function (d) {
                    return x(d.value);
                })	
        
            bars.append("text")
                .attr("class", "percent_label")
                //y position of the label is halfway down the bar
                .attr("y", function (d) {
                    return y(d.name) + 25 + 8;
                })
                //x position is 3 pixels to the right of the bar
                .attr("x", function (d) {
                    return x(d.value) + 3;
                })
                .attr("fill", "white")
                .text(function (d) {
                    return (Math.round(d.value/pollTot *100) + "%");
                });
        
            bars.append("text")
                .attr("class", "label")
                //y position of the label is halfway down the bar
                .attr("y", function (d) {
                    return y(d.name) + 24 + 8;
                })
                .attr("x", function (d) {
                    return 10;
                })
                .attr("fill", "white")
                .text(function (d) {
                    return (d.name);
                });
        
        }
        
        var poll_result_svg = d3.select("#poll_results").append("svg")
            .attr("width", gameWidth)
            .attr("height", gameHeight)
            .style("display", "none")  
            .classed('poll', true);

        var svg = d3.select("#game").selectAll("svg")
            .data(pop_movies)
            .enter()
            .append("svg")
            .attr("class", "game")
            .attr("width", fullWidthGenre)
            .attr("height", fullHeightGenre)
            .append("g")
            .attr("transform", "translate(" + marginGenre.left + "," + marginGenre.right + ")")
            .each(multiple)

        function multiple(model){
            d3.select(this.parentNode)
                .attr("class", function (d) {
                    return d.imdb + "_game"
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
                .text(function (d) { return d.title; });
        }
        
    })

