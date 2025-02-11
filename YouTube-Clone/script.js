const API_KEY =  "AIzaSyAA13mNy3utl4-TX1TFVnSUhKH0K-FfRLY";
const BASE_URL = "https://www.googleapis.com/youtube/v3"



//GET VIDEO

document.getElementById("search-btn").addEventListener("click",()=>{ 
    getVideos(document.getElementById("search-bar1").value);
})


function getVideos(query){ 

    fetch(`${BASE_URL}/search?key=${API_KEY}&q=${query}&type=video&maxResults=10&part=snippet`)
    .then((res)=> res.json())
    .then((data)=>{ 
        console.log(data)
        displayVideos(data.items)
    })
}

getVideos("")

// Showing or Displaying video 

function displayVideos(videos){ 

    document.getElementById("main-container-1").innerHTML = "";

    videos.map((video, i)=> { 
        document.getElementById("main-container-1").innerHTML += `
        <a href='/video.html?videoId=${video.id.videoId}'
        <li>
        <img class="video-thumbnail" src='${video.snippet.thumbnails.high.url}'/> <p>${video.snippet.title}</p>
        </li>
        </a>
        `
    })
}


document.querySelectorAll('.video-card').forEach(card => {
    card.addEventListener('click', (e) => {
        const videoId = card.dataset.videoId; // Make sure to add data-video-id attribute to your video cards
        if (videoId) {
            window.location.href = `/watch?videoId=${videoId}`;
        }
    });
});




