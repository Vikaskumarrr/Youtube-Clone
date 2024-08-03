const API_KEY = "AIzaSyDI7xuxOTRzMaDfaecSlpFJfHOKQV04dnk"
const BASE_URL = "https://www.googleapis.com/youtube/v3"


// // GET VIDEOS?


function displayVideos(videos) {

    // videos - is array 
    document.getElementById("videos-container").innerHTML = "";

    videos.map((video, i) => {
        document.getElementById("videos-container").innerHTML += `
        <a class="video-box" href='/video.html?videoId=${video.id.videoId}'>
            <li >
                <img class="yt1" src='${video.snippet.thumbnails.high.url}'/> <p>${video.snippet.title}</p>
            </li>
        </a>
        `
    })

}

function getVideos(query) {
    fetch(`${BASE_URL}/search?key=${API_KEY}&q=${query}&type=video&maxResults=10&part=snippet`)
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            displayVideos(data.items)
        })
}


getVideos("");


document.getElementById("search-btn").addEventListener("click", () => {
    getVideos(document.getElementById("search-bar1").value);
})