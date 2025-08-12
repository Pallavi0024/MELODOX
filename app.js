/* ===== Theme & Sidebar ===== */
function toggleDarkMode() {
    document.body.classList.toggle("dark");
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('hidden');
}

/* ===== Playlist Login Check ===== */
function checkLoginBeforePlaylist() {
    alert("To create a playlist, you have to login first!");
    window.location.href = "Login.html?mode=login";
}

/* ===== Data ===== */
let allSongs = [];
let currentSong = null;
let playlists = JSON.parse(localStorage.getItem("playlists")) || {};
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

/* ===== Player Elements ===== */
const audioPlayer = document.getElementById("audio-player");
const playerTitle = document.getElementById("player-title");
const playerArtist = document.getElementById("player-artist");
const playerImg = document.getElementById("player-img");
const playlistEl = document.getElementById("playlist");
const favListEl = document.getElementById("fav-playlist");
const playlistListEl = document.getElementById("playlist-list");

/* ===== Fetch Songs ===== */
async function fetchSongs() {
    try {
        const response = await fetch("https://sonix-s830.onrender.com/api/songs");
        allSongs = await response.json();
        displaySongs(allSongs);
    } catch (error) {
        document.getElementById("songs").innerHTML = `<p class="text-red-500">Failed to load songs.</p>`;
        console.error("Error fetching songs:", error);
    }
}

/* ===== Display Songs ===== */
function displaySongs(songs) {
    const songContainer = document.getElementById("songs");
    songContainer.innerHTML = "";

    songs.forEach(song => {
        const isFav = favorites.some(fav => fav.title === song.title);
        const songCard = document.createElement("div");
        songCard.className = "bg-gray-700 p-3 rounded-lg shadow-lg flex flex-col items-center hover:bg-gray-600 transition";

        songCard.innerHTML = `
            <img src="${song.previewImg}" class="rounded-lg w-full h-40 object-cover">
            <div class="p-3 w-full text-center">
                <h3 class="mt-2 font-bold text-white">${song.title}</h3>
                <p class="text-gray-400">${song.artistName}</p>
                <p class="text-pink-500">${song.genre}</p>
                <div class="flex justify-center space-x-4 mt-3">
                    <button onclick="playSong('${song.songUrl}', '${song.title}', '${song.artistName}', '${song.previewImg}')" class="text-white"><i class="fa-solid fa-play"></i></button>
                    <button onclick="promptAddToPlaylist('${song.title}', '${song.artistName}', '${song.previewImg}', '${song.songUrl}')" class="text-white"><i class="fa-solid fa-plus"></i></button>
                    <button class="favorite-btn text-red-500" 
                        data-title="${song.title}" 
                        data-artist="${song.artistName}" 
                        data-img="${song.previewImg}" 
                        data-url="${song.songUrl}">
                        <i class="fa${isFav ? 's' : 'r'} fa-heart"></i>
                    </button>
                </div>
            </div>
        `;

        songContainer.appendChild(songCard);
    });

    /* Favorite Toggle */
    document.querySelectorAll(".favorite-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            const title = this.dataset.title;
            const artist = this.dataset.artist;
            const img = this.dataset.img;
            const url = this.dataset.url;

            const index = favorites.findIndex(fav => fav.title === title);
            const icon = this.querySelector("i");

            if (index > -1) {
                favorites.splice(index, 1);
                icon.classList.remove("fas");
                icon.classList.add("far");
            } else {
                favorites.push({ title, artist, img, url });
                icon.classList.remove("far");
                icon.classList.add("fas");
            }

            localStorage.setItem("favorites", JSON.stringify(favorites));
            renderFavorites();
        });
    });
}

/* ===== Player Controls ===== */
function playSong(audioSrc, title, artist, img) {
    audioPlayer.src = audioSrc;
    audioPlayer.play();
    currentSong = { title, artist, img, audioSrc };

    playerTitle.textContent = title;
    playerArtist.textContent = artist;
    playerImg.src = img;
    playerImg.classList.remove("hidden");
}

/* ===== Playlist ===== */
function promptAddToPlaylist(title, artist, img, url) {
    let playlistName = prompt("Enter playlist name:");
    if (!playlistName) return;

    if (!playlists[playlistName]) playlists[playlistName] = [];
    playlists[playlistName].push({ title, artist, img, url });

    localStorage.setItem("playlists", JSON.stringify(playlists));
    renderPlaylists();
}

function renderPlaylists() {
    playlistListEl.innerHTML = "";
    Object.keys(playlists).forEach(name => {
        const li = document.createElement("li");
        li.className = "text-sm px-4 py-1 hover:bg-gray-700 cursor-pointer";
        li.textContent = name;
        li.onclick = () => showPlaylistSongs(name);
        playlistListEl.appendChild(li);
    });
}

function showPlaylistSongs(name) {
    const songs = playlists[name];
    const songListHTML = songs.map((s, i) => `
        <li class="px-4 py-1 flex justify-between items-center hover:bg-gray-700">
            <span onclick="playSong('${s.url}', '${s.title}', '${s.artist}', '${s.img}')">
                ${i + 1}. ${s.title} - ${s.artist}
            </span>
            <button onclick="removeFromPlaylist('${name}', ${i})" class="text-red-500 hover:text-red-700">
                <i class="fa-solid fa-trash"></i>
            </button>
        </li>
    `).join("");
    playlistEl.innerHTML = `<h4 class="font-bold text-white px-4">${name} Playlist</h4><ul>${songListHTML}</ul>`;
}

function removeFromPlaylist(playlistName, songIndex) {
    playlists[playlistName].splice(songIndex, 1);
    if (playlists[playlistName].length === 0) {
        delete playlists[playlistName];
    }
    localStorage.setItem("playlists", JSON.stringify(playlists));
    renderPlaylists();
    playlistEl.innerHTML = "";
}

/* ===== Favorites ===== */
function renderFavorites() {
    favListEl.innerHTML = "";
    favorites.forEach((song, index) => {
        const li = document.createElement("li");
        li.className = "text-sm px-4 py-1 flex justify-between items-center hover:bg-gray-700";
        li.innerHTML = `
            <span onclick="playSong('${song.url}', '${song.title}', '${song.artist}', '${song.img}')">
                ${index + 1}. ${song.title} - ${song.artist}
            </span>
            <button onclick="removeFromFavorites(${index})" class="text-red-500 hover:text-red-700">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        favListEl.appendChild(li);
    });
}

function removeFromFavorites(songIndex) {
    favorites.splice(songIndex, 1);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    renderFavorites();
}

/* ===== Search ===== */
function searchSongs() {
    let query = document.getElementById("input").value.toLowerCase();
    let filteredSongs = allSongs.filter(song =>
        song.title.toLowerCase().includes(query) || song.artistName.toLowerCase().includes(query)
    );
    displaySongs(filteredSongs);
}

document.getElementById("input").addEventListener("input", searchSongs);

/* ===== Init ===== */
fetchSongs();
renderFavorites();
renderPlaylists();
