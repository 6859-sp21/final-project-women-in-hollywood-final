movie_titles = [];
    // getting all required elements
const searchWrapper = document.querySelector(".search-input");
const inputBox = searchWrapper.querySelector("input");
const suggBox = searchWrapper.querySelector(".autocom-box");

function select(element){
    let selectData = element.textContent;
    let resultBox = document.querySelector(".movie_result");
    inputBox.value = selectData;
    
    let result = ""
    d3.csv('https://raw.githubusercontent.com/fivethirtyeight/data/master/bechdel/movies.csv', d3.autoType)
        .then(function (movies) {
        let selectedMovie = movies.filter(mov => mov.title == selectData)[0];
        // console.log(selectedMovie);
        result += `<h3 class="`+selectedMovie.binary +`"> This movie `+ selectedMovie.binary + `ED. </h3>`
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
        result += `<p> Budget: $`+(selectedMovie.budget).toLocaleString('en')+`</p>`
        result += `<p> Grossed (domestic): $`+(selectedMovie.domgross).toLocaleString('en')+`</p>`     
        result += `<p> Grossed (international): $`+(selectedMovie.intgross).toLocaleString('en')+`</p>`
        resultBox.innerHTML = result;
        });
    searchWrapper.classList.remove("active");
    document.querySelector(".movie_result").classList.remove("hidden");
}
d3.csv('https://raw.githubusercontent.com/fivethirtyeight/data/master/bechdel/movies.csv', d3.autoType)
    .then(function (movies) { 

    movie_titles = movies.map(movie=>movie.title);
    // console.log(suggestions)          
    // if user press any key and release
    inputBox.onkeyup = (e)=>{
        document.querySelector(".movie_result").classList.add("hidden");
        let userData = e.target.value; //user entered data
        let emptyArray = [];
        if(userData){
            emptyArray = movie_titles.filter((data)=>{
                // console.log(data, "data");
                //filtering array value and user characters to lowercase and return only those words which are start with user entered chars
                return data.toString().toLocaleLowerCase().startsWith(userData.toLocaleLowerCase()); 
            });
            emptyArray = emptyArray.map((data)=>{
                return data = '<li>'+ data +'</li>';
            });
            searchWrapper.classList.add("active"); //show autocomplete box
            showSuggestions(emptyArray);
            let allList = suggBox.querySelectorAll("li");
            for (let i = 0; i < allList.length; i++) {
                //adding onclick attribute in all li tag
                allList[i].setAttribute("onclick", "select(this)");
            }
        }else{
            searchWrapper.classList.remove("active"); //hide autocomplete box
        }
    }

    function showSuggestions(list){
        let listData;
        if(!list.length){
            listData = '<li> No Results Found </li>';
        }else{
            listData = list.join('');
        }
        suggBox.innerHTML = listData;
    }
});