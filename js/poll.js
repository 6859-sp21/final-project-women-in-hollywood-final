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
firebase.initializeApp(firebaseConfig);

var poll_results_json = [{"name": "Yes", "value": 0},{"name": "No", "value": 0}];
var pollTot = 0
function updateVals(){
    firebase.database().ref('poll').on('value', function (snapshot) {
        poll_results_json[0]["value"] = snapshot.val().yes
        poll_results_json[1]["value"] = snapshot.val().no
        pollTot = poll_results_json[0]['value'] + poll_results_json[1]['value']
    })
}
updateVals()
// console.log(poll_results_json)

// intro poll
var width = 400;
var height = 100;
var barHeight = 40;

function setColor(vote) {
    return vote == "Yes" ? "#71c788" : "#db8181";
};

function cast_vote(d){
    // bruh;
    const vote = d.target.name;
    if (vote == "yes"){
      firebase.database().ref('poll').update({
        "yes": poll_results_json[0]["value"]+1,
        "no": poll_results_json[1]["value"]
      });
    } else if (vote == "no") {
      firebase.database().ref('poll').update({
        "yes": poll_results_json[0]["value"],
        "no": poll_results_json[1]["value"]+1
      });
    }
    updateVals()
    poll_result_svg.style("display","flex")
    d3.select("#poll_question").style("display", "none")
    display_poll_results(poll_results_json);
};

function display_poll_results(poll_results_json) {
    poll_g = poll_result_svg.append("g")
    .attr("width", width)
    .attr("height", height)
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
    .attr("width", width)
    .attr("height", height)
    .style("display", "none")  
    .classed('poll', true);

d3.select(".poll_question")
    .append("button")
    .attr('name', 'yes')
    .attr('class', 'poll_button')
    .style("background-color",  setColor("Yes"))
    .text("Yes")
    .on("click", cast_vote);

d3.select(".poll_question")
    .append("button")
    .attr('name', 'no')
    .attr('class', 'poll_button')
    .style("background-color",  setColor("No"))
    .text("No")
    .on("click", cast_vote);
