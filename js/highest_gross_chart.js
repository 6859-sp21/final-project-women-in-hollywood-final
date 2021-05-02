// stacked bar chart for highest grossing movies
var width = 750;
var height = 550;

var stacked_bars_legend_svg = d3.select("#highest_gross_chart_legend").append("svg")
    .attr("width", 800)
    .attr("height", 100)
var stacked_bars_svg = d3.select("#highest_gross_chart").append("svg")
    .attr("width", 800)
    .attr("height", height)
    .classed('stacked_bars_svg', true);
var margin = {top: 20, right: 20, bottom: 30, left: 40},

g = stacked_bars_svg.append("g")
.attr("width", width)
.attr("height", "100%")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var y = d3.scaleBand()			// x = d3.scaleBand()	
.rangeRound([0, 500])	// .rangeRound([0, width])
.paddingInner(0.15)
.align(0.1);

var x = d3.scaleLinear()		// y = d3.scaleLinear()
.rangeRound([0, width]);	// .rangeRound([height, 0]);

var z = d3.scaleOrdinal()
.range(["#99382b", "#ba6f65", "#db8181", "black"]);

let all_movies_data;
d3.json("https://raw.githubusercontent.com/6859-sp21/final-project-women-in-hollywood-final/main/data/all_movies.json", d3.autotype).then(
    function(data) {
        all_movies_data = data;
        all_movies_data.sort(function(x, y){
            return d3.ascending(x.year, y.year);
        })
        
        // Make a list of Movie Names for Search
        movie_names = []
        movie_names = all_movies_data.map(m => m.title);  
        var keys = ['0', '1', '2', '3'];
        // console.log(keys , "keys");
        let past_twenty_years = [];
        for (i = 2019; i>=1999; i--) {
            past_twenty_years.push(i);
        }

        chart_data = past_twenty_years.map(year => {
            num_passed_0 = 0;
            num_passed_1 = 0;
            num_passed_2 = 0;
            num_passed_3 = 0;
            // console.log(year)
            blockbusters.filter(movie => movie.release_year==year)
            .forEach(movie => {
                // console.log(movie)
                var bechdel_movie = get_movie(movie.film_title);
            // console.log(bechdel_movie, "movie results");
                if (bechdel_movie && bechdel_movie.rating=='0'){
                    num_passed_0 ++;
                } 
                else if (bechdel_movie && bechdel_movie.rating==1){
                    num_passed_1++;
                }  
                else if (bechdel_movie && bechdel_movie.rating==2){
                    num_passed_2++;
                }    
                else if (bechdel_movie && bechdel_movie.rating==3){
                    num_passed_3++;
                } else {
                    num_passed_0 ++;
                }
                // console.log(num_passed_0, "num_passed_0")
              
            })
            return {
                'year': year,
                '0': num_passed_0,
                '1': num_passed_1,
                '2': num_passed_2,
                '3': num_passed_3,
            }
        }
        );
        // console.log(chart_data, "chart data");

        y.domain(past_twenty_years);					// x.domain...
        x.domain([0, 10]).nice();	// y.domain...
        z.domain(keys);

        g.append("g")
        .selectAll("g")
        .data(d3.stack().keys(keys)(chart_data))
        .enter().append("g")
            .attr("fill", function(d) { 
                return z(d.key); })
        .selectAll("rect")
        .data(function(d) { return d; })
        .enter().append("rect")
            .attr("y", function(d) { 
                // console.log(d,"d");
                return y(d.data.year); })	    
            .attr("x", function(d) { 
                // console.log(d[0], x(d[0]));
                return x(d[0]); })			    
            .attr("width", function(d) { 
                // console.log(d[1], d[0], x(d[1]), x(d[0]));
                return x(d[1])-x(d[0]); })	
            .attr("height", y.bandwidth());						

        g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0,0)") 						
            .call(d3.axisLeft(y));							

        g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0,"+(height-50)+")")				
            .call(d3.axisBottom(x).ticks(null, "s"))				
        .append("text")
            .attr("y", 2)											
            .attr("x", x(x.ticks().pop()) + 0.5) 					
            .attr("dy", "0.32em")								
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Year")
            .attr("transform", "translate("+ (-width) +",-10)"); 

        var legend = stacked_bars_legend_svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "start")
            .selectAll("g")
            .data(keys.slice().reverse())
            .enter().append("g")
            .attr("transform", function(d, i) { return "translate(-450, " + (i * 20) + ")"; });

        legend.append("rect")
            .attr("x", width - 19)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", z);

        legend.append("text")
            .attr("x", width + 5)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .classed("text", true)
            .text(function(d) { 
                if (d==0){
                    return "Did not contain two named women"
                } else if (d==1){
                    return "Women did not talk to each other"
                } else if (d==2){
                    return "Women only talked about men"
                } 
            });

    }
)
function get_movie(search_title){
    // get the searched movie name
    // console.log("search title", search_title);
    index = movie_names.indexOf(search_title)
    if (index != -1){
      return all_movies_data[index];
    }
};

const blockbusters = [
    {
        "film_title": "Back to the Future",
        "release_year": 1985
    },
    {
        "film_title": "Rocky IV",
        "release_year": 1985
    },
    {
        "film_title": "Rambo: First Blood II",
        "release_year": 1985
    },
    {
        "film_title": "Out of Africa",
        "release_year": 1985
    },
    {
        "film_title": "The Jewel of the Nile",
        "release_year": 1985
    },
    {
        "film_title": "The Color Purple",
        "release_year": 1985
    },
    {
        "film_title": "Cocoon",
        "release_year": 1985
    },
    {
        "film_title": "Witness",
        "release_year": 1985
    },
    {
        "film_title": "The Goonies",
        "release_year": 1985
    },
    {
        "film_title": "E.T. the Extra-Terrestrial 1985 Re-release",
        "release_year": 1985
    },
    {
        "film_title": "Top Gun",
        "release_year": 1986
    },
    {
        "film_title": "Crocodile Dundee",
        "release_year": 1986
    },
    {
        "film_title": "Platoon",
        "release_year": 1986
    },
    {
        "film_title": "Aliens",
        "release_year": 1986
    },
    {
        "film_title": "The Karate Kid Part II",
        "release_year": 1986
    },
    {
        "film_title": "Star Trek IV: Voyage Home",
        "release_year": 1986
    },
    {
        "film_title": "Legal Eagles",
        "release_year": 1986
    },
    {
        "film_title": "Back to School",
        "release_year": 1986
    },
    {
        "film_title": "An American Tail",
        "release_year": 1986
    },
    {
        "film_title": "The Golden Child",
        "release_year": 1986
    },
    {
        "film_title": "Fatal Attraction",
        "release_year": 1987
    },
    {
        "film_title": "Beverly Hills Cop II",
        "release_year": 1987
    },
    {
        "film_title": "Dirty Dancing",
        "release_year": 1987
    },
    {
        "film_title": "Three Men and a Baby",
        "release_year": 1987
    },
    {
        "film_title": "Good Morning, Vietnam",
        "release_year": 1987
    },
    {
        "film_title": "Lethal Weapon",
        "release_year": 1987
    },
    {
        "film_title": "The Secret of My Success",
        "release_year": 1987
    },
    {
        "film_title": "Predator",
        "release_year": 1987
    },
    {
        "film_title": "Moonstruck",
        "release_year": 1987
    },
    {
        "film_title": "The Untouchables",
        "release_year": 1987
    },
    {
        "film_title": "Rain Man",
        "release_year": 1988
    },
    {
        "film_title": "Who Framed Roger Rabbit",
        "release_year": 1988
    },
    {
        "film_title": "Coming to America",
        "release_year": 1988
    },
    {
        "film_title": "Crocodile Dundee II",
        "release_year": 1988
    },
    {
        "film_title": "Dead Poets Society",
        "release_year": 1988
    },
    {
        "film_title": "Twins",
        "release_year": 1988
    },
    {
        "film_title": "Rambo III",
        "release_year": 1988
    },
    {
        "film_title": "Cocktail",
        "release_year": 1988
    },
    {
        "film_title": "Big",
        "release_year": 1988
    },
    {
        "film_title": "Die Hard",
        "release_year": 1988
    },
    {
        "film_title": "Indiana Jones and the Last Crusade",
        "release_year": 1989
    },
    {
        "film_title": "Batman",
        "release_year": 1989
    },
    {
        "film_title": "Back to the Future II",
        "release_year": 1989
    },
    {
        "film_title": "Look Who's Talking",
        "release_year": 1989
    },
    {
        "film_title": "Lethal Weapon 2",
        "release_year": 1989
    },
    {
        "film_title": "Honey, I Shrunk the Kids",
        "release_year": 1989
    },
    {
        "film_title": "Ghostbusters II",
        "release_year": 1989
    },
    {
        "film_title": "The Little Mermaid",
        "release_year": 1989
    },
    {
        "film_title": "Born on the Fourth of July",
        "release_year": 1989
    },
    {
        "film_title": "The War of the Roses",
        "release_year": 1989
    },
    {
        "film_title": "Ghost",
        "release_year": 1990
    },
    {
        "film_title": "Home Alone ",
        "release_year": 1990
    },
    {
        "film_title": "Pretty Woman ",
        "release_year": 1990
    },
    {
        "film_title": "Dances with Wolves",
        "release_year": 1990
    },
    {
        "film_title": "Total Recall",
        "release_year": 1990
    },
    {
        "film_title": "Back to the Future III",
        "release_year": 1990
    },
    {
        "film_title": "Die Hard 2",
        "release_year": 1990
    },
    {
        "film_title": "Presumed Innocent",
        "release_year": 1990
    },
    {
        "film_title": "Teenage Mutant Ninja Turtles",
        "release_year": 1990
    },
    {
        "film_title": "Kindergarten Cop",
        "release_year": 1990
    },
    {
        "film_title": "Terminator 2: Judgement Day",
        "release_year": 1991
    },
    {
        "film_title": "Robin Hood: Prince of Thieves",
        "release_year": 1991
    },
    {
        "film_title": "Beauty and the Beast",
        "release_year": 1991
    },
    {
        "film_title": "Hook",
        "release_year": 1991
    },
    {
        "film_title": "The Silence of the Lambs",
        "release_year": 1991
    },
    {
        "film_title": "JFK",
        "release_year": 1991
    },
    {
        "film_title": "The Addams Family",
        "release_year": 1991
    },
    {
        "film_title": "Cape Fear",
        "release_year": 1991
    },
    {
        "film_title": "Hot Shots!",
        "release_year": 1991
    },
    {
        "film_title": "City Slickers",
        "release_year": 1991
    },
    {
        "film_title": "Aladdin",
        "release_year": 1992
    },
    {
        "film_title": "The Bodyguard",
        "release_year": 1992
    },
    {
        "film_title": "Home Alone 2: Lost in New York ",
        "release_year": 1992
    },
    {
        "film_title": "Basic Instinct",
        "release_year": 1992
    },
    {
        "film_title": "Lethal Weapon 3",
        "release_year": 1992
    },
    {
        "film_title": "Batman Returns",
        "release_year": 1992
    },
    {
        "film_title": "A  Few Good Men",
        "release_year": 1992
    },
    {
        "film_title": "Sister Act",
        "release_year": 1992
    },
    {
        "film_title": "Bram Stoker's Dracula",
        "release_year": 1992
    },
    {
        "film_title": "Wayne's World",
        "release_year": 1992
    },
    {
        "film_title": "Jurassic Park ",
        "release_year": 1993
    },
    {
        "film_title": "Mrs. Doubtfire",
        "release_year": 1993
    },
    {
        "film_title": "The Fugitive",
        "release_year": 1993
    },
    {
        "film_title": "Schindler's List",
        "release_year": 1993
    },
    {
        "film_title": "The Firm",
        "release_year": 1993
    },
    {
        "film_title": "Indecent Proposal",
        "release_year": 1993
    },
    {
        "film_title": "Cliffhanger",
        "release_year": 1993
    },
    {
        "film_title": "Sleepless in Seattle",
        "release_year": 1993
    },
    {
        "film_title": "Philadelphia",
        "release_year": 1993
    },
    {
        "film_title": "The Pelican Brief",
        "release_year": 1993
    },
    {
        "film_title": "The Lion King",
        "release_year": 1994
    },
    {
        "film_title": "Forrest Gump",
        "release_year": 1994
    },
    {
        "film_title": "True Lies",
        "release_year": 1994
    },
    {
        "film_title": "The Mask",
        "release_year": 1994
    },
    {
        "film_title": "Speed",
        "release_year": 1994
    },
    {
        "film_title": "The Flintstones",
        "release_year": 1994
    },
    {
        "film_title": "Dumb and Dumber",
        "release_year": 1994
    },
    {
        "film_title": "Four Weddings and a Funeral",
        "release_year": 1994
    },
    {
        "film_title": "Interview with the Vampire: The Vampire Chronicles",
        "release_year": 1994
    },
    {
        "film_title": "Clear and Present Danger",
        "release_year": 1994
    },
    {
        "film_title": "Die Hard with a Vengeance",
        "release_year": 1995
    },
    {
        "film_title": "Toy Story",
        "release_year": 1995
    },
    {
        "film_title": "Apollo 13",
        "release_year": 1995
    },
    {
        "film_title": "GoldenEye",
        "release_year": 1995
    },
    {
        "film_title": "Pocahontas",
        "release_year": 1995
    },
    {
        "film_title": "Batman Forever",
        "release_year": 1995
    },
    {
        "film_title": "Se7en",
        "release_year": 1995
    },
    {
        "film_title": "Casper",
        "release_year": 1995
    },
    {
        "film_title": "Waterworld",
        "release_year": 1995
    },
    {
        "film_title": "Jumanji",
        "release_year": 1995
    },
    {
        "film_title": "Independence Day",
        "release_year": 1996
    },
    {
        "film_title": "Twister",
        "release_year": 1996
    },
    {
        "film_title": "Mission: Impossible",
        "release_year": 1996
    },
    {
        "film_title": "The Rock",
        "release_year": 1996
    },
    {
        "film_title": "The Hunchback of Notre Dame",
        "release_year": 1996
    },
    {
        "film_title": "101 Dalmatians",
        "release_year": 1996
    },
    {
        "film_title": "Ransom",
        "release_year": 1996
    },
    {
        "film_title": "The Nutty Professor",
        "release_year": 1996
    },
    {
        "film_title": "Jerry Maguire",
        "release_year": 1996
    },
    {
        "film_title": "Eraser",
        "release_year": 1996
    },
    {
        "film_title": "Titanic",
        "release_year": 1997
    },
    {
        "film_title": "The Lost World: Jurassic Park",
        "release_year": 1997
    },
    {
        "film_title": "Men in Black",
        "release_year": 1997
    },
    {
        "film_title": "Tomorrow Never Dies",
        "release_year": 1997
    },
    {
        "film_title": "Air Force One",
        "release_year": 1997
    },
    {
        "film_title": "As Good As It Gets",
        "release_year": 1997
    },
    {
        "film_title": "Liar Liar",
        "release_year": 1997
    },
    {
        "film_title": "My Best Friend's Wedding",
        "release_year": 1997
    },
    {
        "film_title": "The Fifth Element",
        "release_year": 1997
    },
    {
        "film_title": "The Full Monty",
        "release_year": 1997
    },
    {
        "film_title": "Armageddon",
        "release_year": 1998
    },
    {
        "film_title": "Saving Private Ryan",
        "release_year": 1998
    },
    {
        "film_title": "Godzilla",
        "release_year": 1998
    },
    {
        "film_title": "There's Something About Mary",
        "release_year": 1998
    },
    {
        "film_title": "A Bug's Life",
        "release_year": 1998
    },
    {
        "film_title": "Deep Impact",
        "release_year": 1998
    },
    {
        "film_title": "Mulan",
        "release_year": 1998
    },
    {
        "film_title": "Doctor Dolittle",
        "release_year": 1998
    },
    {
        "film_title": "Shakespeare in Love",
        "release_year": 1998
    },
    {
        "film_title": "Lethal Weapon 4",
        "release_year": 1998
    },
    {
        "film_title": "Star Wars: Episode I - The Phantom Menace",
        "release_year": 1999
    },
    {
        "film_title": "The Sixth Sense",
        "release_year": 1999
    },
    {
        "film_title": "Toy Story 2",
        "release_year": 1999
    },
    {
        "film_title": "The Matrix",
        "release_year": 1999
    },
    {
        "film_title": "Tarzan",
        "release_year": 1999
    },
    {
        "film_title": "The Mummy",
        "release_year": 1999
    },
    {
        "film_title": "Notting Hill",
        "release_year": 1999
    },
    {
        "film_title": "The World is Not Enough",
        "release_year": 1999
    },
    {
        "film_title": "American Beauty",
        "release_year": 1999
    },
    {
        "film_title": "Austin Powers: The Spy Who Shagged Me",
        "release_year": 1999
    },
    {
        "film_title": "Mission: Impossible II",
        "release_year": 2000
    },
    {
        "film_title": "Gladiator",
        "release_year": 2000
    },
    {
        "film_title": "Cast Away",
        "release_year": 2000
    },
    {
        "film_title": "What Women Want",
        "release_year": 2000
    },
    {
        "film_title": "Dinosaur",
        "release_year": 2000
    },
    {
        "film_title": "How the Grinch Stole Christmas",
        "release_year": 2000
    },
    {
        "film_title": "Meet the Parents",
        "release_year": 2000
    },
    {
        "film_title": "The Perfect Storm",
        "release_year": 2000
    },
    {
        "film_title": "X-Men",
        "release_year": 2000
    },
    {
        "film_title": "What Lies Beneath",
        "release_year": 2000
    },
    {
        "film_title": "Harry Potter and the Sorcerer's Stone",
        "release_year": 2001
    },
    {
        "film_title": "The Lord of the Rings: The Fellowship of the Ring",
        "release_year": 2001
    },
    {
        "film_title": "Monsters, Inc.",
        "release_year": 2001
    },
    {
        "film_title": "Shrek",
        "release_year": 2001
    },
    {
        "film_title": "Ocean's Eleven",
        "release_year": 2001
    },
    {
        "film_title": "Pearl Harbor",
        "release_year": 2001
    },
    {
        "film_title": "The Mummy Returns",
        "release_year": 2001
    },
    {
        "film_title": "Jurassic Park III",
        "release_year": 2001
    },
    {
        "film_title": "Planet of the Apes",
        "release_year": 2001
    },
    {
        "film_title": "Hannibal",
        "release_year": 2001
    },
    {
        "film_title": "The Lord of the Rings: The Two Towers",
        "release_year": 2002
    },
    {
        "film_title": "Harry Potter and the Chamber of Secrets",
        "release_year": 2002
    },
    {
        "film_title": "Spider-Man",
        "release_year": 2002
    },
    {
        "film_title": "Star Wars: Episode II - Attack of the Clones",
        "release_year": 2002
    },
    {
        "film_title": "Men in Black II",
        "release_year": 2002
    },
    {
        "film_title": "Die Another Day",
        "release_year": 2002
    },
    {
        "film_title": "Signs",
        "release_year": 2002
    },
    {
        "film_title": "Ice Age",
        "release_year": 2002
    },
    {
        "film_title": "My Big Fat Greek Wedding",
        "release_year": 2002
    },
    {
        "film_title": "Minority Report",
        "release_year": 2002
    },
    {
        "film_title": "The Lord of the Rings: The Return of the King",
        "release_year": 2003
    },
    {
        "film_title": "Finding Nemo",
        "release_year": 2003
    },
    {
        "film_title": "The Matrix Reloaded",
        "release_year": 2003
    },
    {
        "film_title": "Pirates of the Caribbean: The Curse of the Black Pearl",
        "release_year": 2003
    },
    {
        "film_title": "Bruce Almighty",
        "release_year": 2003
    },
    {
        "film_title": "The Last Samurai",
        "release_year": 2003
    },
    {
        "film_title": "Terminator 3: Rise of the Machines",
        "release_year": 2003
    },
    {
        "film_title": "The Matrix Revolutions",
        "release_year": 2003
    },
    {
        "film_title": "X2: X-Men United",
        "release_year": 2003
    },
    {
        "film_title": "Bad Boys II",
        "release_year": 2003
    },
    {
        "film_title": "Shrek 2",
        "release_year": 2004
    },
    {
        "film_title": "Harry Potter and the Prisoner of Azkaban",
        "release_year": 2004
    },
    {
        "film_title": "Spider-Man 2",
        "release_year": 2004
    },
    {
        "film_title": "The Incredibles",
        "release_year": 2004
    },
    {
        "film_title": "The Passion of the Christ",
        "release_year": 2004
    },
    {
        "film_title": "The Day After Tomorrow",
        "release_year": 2004
    },
    {
        "film_title": "Meet the Fockers",
        "release_year": 2004
    },
    {
        "film_title": "Troy",
        "release_year": 2004
    },
    {
        "film_title": "Shark Tale",
        "release_year": 2004
    },
    {
        "film_title": "Ocean's Twelve",
        "release_year": 2004
    },
    {
        "film_title": "Harry Potter and the Goblet of Fire",
        "release_year": 2005
    },
    {
        "film_title": "Star Wars: Episode III - Revenge of the Sith",
        "release_year": 2005
    },
    {
        "film_title": "The Chronicles of Narnia: The Lion, the Witch and the Wardrobe",
        "release_year": 2005
    },
    {
        "film_title": "War of the Worlds",
        "release_year": 2005
    },
    {
        "film_title": "King Kong",
        "release_year": 2005
    },
    {
        "film_title": "Madagascar",
        "release_year": 2005
    },
    {
        "film_title": "Mr. & Mrs. Smith",
        "release_year": 2005
    },
    {
        "film_title": "Charlie and the Chocolate Factory",
        "release_year": 2005
    },
    {
        "film_title": "Batman Begins",
        "release_year": 2005
    },
    {
        "film_title": "Hitch",
        "release_year": 2005
    },
    {
        "film_title": "Pirates of the Caribbean: Dead Man's Chest",
        "release_year": 2006
    },
    {
        "film_title": "The Da Vinci Code",
        "release_year": 2006
    },
    {
        "film_title": "Ice Age: The Meltdown",
        "release_year": 2006
    },
    {
        "film_title": "Casino Royale",
        "release_year": 2006
    },
    {
        "film_title": "Night at the Museum",
        "release_year": 2006
    },
    {
        "film_title": "Cars",
        "release_year": 2006
    },
    {
        "film_title": "X-Men: The Last Stand",
        "release_year": 2006
    },
    {
        "film_title": "Mission: Impossible III",
        "release_year": 2006
    },
    {
        "film_title": "Superman Returns",
        "release_year": 2006
    },
    {
        "film_title": "Happy Feet",
        "release_year": 2006
    },
    {
        "film_title": "Pirates of the Caribbean: At World's End",
        "release_year": 2007
    },
    {
        "film_title": "Harry Potter and the Order of the Phoenix",
        "release_year": 2007
    },
    {
        "film_title": "Spider-Man 3",
        "release_year": 2007
    },
    {
        "film_title": "Shrek the Third",
        "release_year": 2007
    },
    {
        "film_title": "Transformers",
        "release_year": 2007
    },
    {
        "film_title": "Ratatouille",
        "release_year": 2007
    },
    {
        "film_title": "I Am Legend",
        "release_year": 2007
    },
    {
        "film_title": "The Simpsons Movie",
        "release_year": 2007
    },
    {
        "film_title": "National Treasure: Book of Secrets",
        "release_year": 2007
    },
    {
        "film_title": 300,
        "release_year": 2007
    },
    {
        "film_title": "The Dark Knight",
        "release_year": 2008
    },
    {
        "film_title": "Indiana Jones and the Kingdom of the Crystal Skull",
        "release_year": 2008
    },
    {
        "film_title": "Kung Fu Panda",
        "release_year": 2008
    },
    {
        "film_title": "Hancock",
        "release_year": 2008
    },
    {
        "film_title": "Mamma Mia!",
        "release_year": 2008
    },
    {
        "film_title": "Madagascar: Escape 2 Africa",
        "release_year": 2008
    },
    {
        "film_title": "Quantum of Solace",
        "release_year": 2008
    },
    {
        "film_title": "Iron Man ",
        "release_year": 2008
    },
    {
        "film_title": "WALL�E",
        "release_year": 2008
    },
    {
        "film_title": "The Chronicles of Narnia: Prince Caspian",
        "release_year": 2008
    },
    {
        "film_title": "Avatar",
        "release_year": 2009
    },
    {
        "film_title": "Harry Potter and the Half-Blood Prince",
        "release_year": 2009
    },
    {
        "film_title": "Ice Age: Dawn of the Dinosaurs",
        "release_year": 2009
    },
    {
        "film_title": "Transformers: Revenge of the Fallen",
        "release_year": 2009
    },
    {
        "film_title": 2012,
        "release_year": 2009
    },
    {
        "film_title": "Up",
        "release_year": 2009
    },
    {
        "film_title": "The Twilight Saga: New Moon",
        "release_year": 2009
    },
    {
        "film_title": "Sherlock Holmes",
        "release_year": 2009
    },
    {
        "film_title": "Angels & Demons",
        "release_year": 2009
    },
    {
        "film_title": "The Hangover ",
        "release_year": 2009
    },
    {
        "film_title": "Toy Story 3",
        "release_year": 2010
    },
    {
        "film_title": "Alice in Wonderland",
        "release_year": 2010
    },
    {
        "film_title": "Harry Potter and the Deathly Hallows: Part 1",
        "release_year": 2010
    },
    {
        "film_title": "Inception",
        "release_year": 2010
    },
    {
        "film_title": "Shrek Forever After",
        "release_year": 2010
    },
    {
        "film_title": "The Twilight Saga: Eclipse",
        "release_year": 2010
    },
    {
        "film_title": "Iron Man 2",
        "release_year": 2010
    },
    {
        "film_title": "Tangled",
        "release_year": 2010
    },
    {
        "film_title": "Despicable Me",
        "release_year": 2010
    },
    {
        "film_title": "How to Train Your Dragon",
        "release_year": 2010
    },
    {
        "film_title": "Harry Potter and the Deathly Hallows: Part 2",
        "release_year": 2011
    },
    {
        "film_title": "Transformers: Dark of the Moon",
        "release_year": 2011
    },
    {
        "film_title": "Pirates of the Caribbean: On Stranger Tides",
        "release_year": 2011
    },
    {
        "film_title": "The Twilight Saga: Breaking Dawn - Part 1",
        "release_year": 2011
    },
    {
        "film_title": "Mission: Impossible - Ghost Protocol",
        "release_year": 2011
    },
    {
        "film_title": "Kung Fu Panda 2",
        "release_year": 2011
    },
    {
        "film_title": "Fast Five",
        "release_year": 2011
    },
    {
        "film_title": "The Hangover Part II",
        "release_year": 2011
    },
    {
        "film_title": "The Smurfs",
        "release_year": 2011
    },
    {
        "film_title": "Cars 2",
        "release_year": 2011
    },
    {
        "film_title": "The Avengers",
        "release_year": 2012
    },
    {
        "film_title": "Skyfall",
        "release_year": 2012
    },
    {
        "film_title": "The Dark Knight Rises",
        "release_year": 2012
    },
    {
        "film_title": "The Hobbit: An Unexpected Journey",
        "release_year": 2012
    },
    {
        "film_title": "Ice Age: Continental Drift",
        "release_year": 2012
    },
    {
        "film_title": "The Twilight Saga: Breaking Dawn - Part 2",
        "release_year": 2012
    },
    {
        "film_title": "The Amazing Spider-Man",
        "release_year": 2012
    },
    {
        "film_title": "Madagascar 3: Europe's Most Wanted",
        "release_year": 2012
    },
    {
        "film_title": "The Hunger Games",
        "release_year": 2012
    },
    {
        "film_title": "Men in Black 3",
        "release_year": 2012
    },
    {
        "film_title": "Frozen ",
        "release_year": 2013
    },
    {
        "film_title": "Iron Man 3",
        "release_year": 2013
    },
    {
        "film_title": "Despicable Me 2",
        "release_year": 2013
    },
    {
        "film_title": "The Hobbit: The Desolation of Smaug",
        "release_year": 2013
    },
    {
        "film_title": "The Hunger Games: Catching Fire",
        "release_year": 2013
    },
    {
        "film_title": "Fast & Furious 6",
        "release_year": 2013
    },
    {
        "film_title": "Monsters University",
        "release_year": 2013
    },
    {
        "film_title": "Gravity",
        "release_year": 2013
    },
    {
        "film_title": "Man of Steel",
        "release_year": 2013
    },
    {
        "film_title": "Thor: The Dark World",
        "release_year": 2013
    },
    {
        "film_title": "Transformers: Age of Extinction",
        "release_year": 2014
    },
    {
        "film_title": "The Hobbit: The Battle of the Five Armies",
        "release_year": 2014
    },
    {
        "film_title": "Guardians of the Galaxy",
        "release_year": 2014
    },
    {
        "film_title": "Maleficent",
        "release_year": 2014
    },
    {
        "film_title": "The Hunger Games: Mockingjay - Part 1",
        "release_year": 2014
    },
    {
        "film_title": "X-Men: Days of Future Past",
        "release_year": 2014
    },
    {
        "film_title": "Captain America: The Winter Soldier",
        "release_year": 2014
    },
    {
        "film_title": "Dawn of the Planet of the Apes",
        "release_year": 2014
    },
    {
        "film_title": "The Amazing Spider-Man 2",
        "release_year": 2014
    },
    {
        "film_title": "Interstellar",
        "release_year": 2014
    },
    {
        "film_title": "Star Wars: Episode VII - The Force Awakens",
        "release_year": 2015
    },
    {
        "film_title": "Jurassic World",
        "release_year": 2015
    },
    {
        "film_title": "Furious 7",
        "release_year": 2015
    },
    {
        "film_title": "Avengers: Age of Ultron",
        "release_year": 2015
    },
    {
        "film_title": "Minions",
        "release_year": 2015
    },
    {
        "film_title": "Spectre",
        "release_year": 2015
    },
    {
        "film_title": "Batman v Superman: Dawn of Justice",
        "release_year": 2015
    },
    {
        "film_title": "Inside Out",
        "release_year": 2015
    },
    {
        "film_title": "Mission: Impossible - Rogue Nation",
        "release_year": 2015
    },
    {
        "film_title": "The Hunger Games: Mockingjay - Part 2",
        "release_year": 2015
    },
    {
        "film_title": "Captain America: Civil War",
        "release_year": 2016
    },
    {
        "film_title": "Rogue One: A Star Wars Story",
        "release_year": 2016
    },
    {
        "film_title": "Finding Dory",
        "release_year": 2016
    },
    {
        "film_title": "Zootopia",
        "release_year": 2016
    },
    {
        "film_title": "The Jungle Book",
        "release_year": 2016
    },
    {
        "film_title": "The Secret Life of Pets",
        "release_year": 2016
    },
    {
        "film_title": "Fantastic Beasts and Where to Find Them",
        "release_year": 2016
    },
    {
        "film_title": "Deadpool ",
        "release_year": 2016
    },
    {
        "film_title": "Suicide Squad",
        "release_year": 2016
    },
    {
        "film_title": "Doctor Strange",
        "release_year": 2016
    },
    {
        "film_title": "Star Wars: Episode VIII - The Last Jedi",
        "release_year": 2017
    },
    {
        "film_title": "Beauty and the Beast",
        "release_year": 2017
    },
    {
        "film_title": "The Fate of the Furious",
        "release_year": 2017
    },
    {
        "film_title": "Despicable Me 3",
        "release_year": 2017
    },
    {
        "film_title": "Jumanji: Welcome to the Jungle",
        "release_year": 2017
    },
    {
        "film_title": "Spider-Man: Homecoming",
        "release_year": 2017
    },
    {
        "film_title": "Wolf Warrior 2",
        "release_year": 2017
    },
    {
        "film_title": "Guardians of the Galaxy Vol. 2",
        "release_year": 2017
    },
    {
        "film_title": "Thor: Ragnarok",
        "release_year": 2017
    },
    {
        "film_title": "Wonder Woman",
        "release_year": 2017
    },
    {
        "film_title": "Avengers: Infinity War",
        "release_year": 2018
    },
    {
        "film_title": "Black Panther",
        "release_year": 2018
    },
    {
        "film_title": "Jurassic World: Fallen Kingdom",
        "release_year": 2018
    },
    {
        "film_title": "Incredibles 2",
        "release_year": 2018
    },
    {
        "film_title": "Aquaman",
        "release_year": 2018
    },
    {
        "film_title": "Bohemian Rhapsody",
        "release_year": 2018
    },
    {
        "film_title": "Venom",
        "release_year": 2018
    },
    {
        "film_title": "Mission: Impossible - Fallout",
        "release_year": 2018
    },
    {
        "film_title": "Deadpool 2",
        "release_year": 2018
    },
    {
        "film_title": "Fantastic Beasts: The Crimes of Grindelwald",
        "release_year": 2018
    },
    {
        "film_title": "Avengers: Endgame",
        "release_year": 2019
    },
    {
        "film_title": "The Lion King",
        "release_year": 2019
    },
    {
        "film_title": "Frozen II",
        "release_year": 2019
    },
    {
        "film_title": "Spider-Man: Far from Home",
        "release_year": 2019
    },
    {
        "film_title": "Captain Marvel",
        "release_year": 2019
    },
    {
        "film_title": "Toy Story 4",
        "release_year": 2019
    },
    {
        "film_title": "Joker",
        "release_year": 2019
    },
    {
        "film_title": "Aladdin",
        "release_year": 2019
    },
    {
        "film_title": "Star Wars: Episode IX - The Rise of Skywalker",
        "release_year": 2019
    },
    {
        "film_title": "Fast & Furious Presents: Hobbs & Shaw",
        "release_year": 2019
    }
]