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


var summary_bars_svg = d3.select("#highest_gross_chart_legend").append("svg")
    .attr("width", 800)
    .attr("height", 100)
    .classed('summary_bars_svg', true);

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

