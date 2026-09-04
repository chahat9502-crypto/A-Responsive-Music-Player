const songs = [
  {
    title: "Chahun Main Ya Naa from Aashiqui 2",
    artist: "Arijit Singh",
    duration: "3:34",
    file: "music1/new_320_03 - Chahun Main Ya Naa - PagalSongs.com.mp3",
    cover: "image1/1.jpg"
  },
  {
    title: "Apna Bana Le From Bhediya",
    artist: "Arijit Singh ",
    duration: "4:21",
    file: "music1/Apna_Bana_Le__From__Bhediya__(256k).mp3",
    cover: "image1/2.jpg"
  },
  {
    title: "Deva_Deva_Brahmāstra",
    artist: "Arijit Singh and Jonita Gandhi",
    duration: "6:14",
    file: "music1/Deva_Deva__Film_Version_(256k).mp3",
    cover: "image1/3.jpg"
  },
  {
    title: "Namo_Namo from Kedarnath",
    artist: "Amit Trivedi",
    duration: "5:22",
    file: "music1/Namo_Namo(256k).mp3",
    cover: "image1/4.jpg"
  },
  {
    title: "Qaafirana_Kedarnath",
    artist: "Arijit_Singh__Nikhita___Amit Trivedi",
    duration: "6:16",
    file: "music1/Qaafirana_Kedarnath___Sushant_Rajput___Sara_Ali_Khan___Arijit_Singh___Nikhita___Amit_Trivedi(256k).mp3",
    cover: "image1/5.jpg"
  },
  {
    title: "Kiya Kiya Welcome",
    artist: "Anand Raj Anand and Shweta Pandit",
    duration: "5:02",
    file: "music1/Kiya Kiya Welcome 320 Kbps.mp3",
    cover: "image1/6.jpg"
  }
];

const audioPlayer = document.getElementById("audioPlayer");
const playButton = document.getElementById("playButton");
const playIcon = document.getElementById("playIcon");
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");
const shuffleButton = document.getElementById("shuffleButton");
const repeatButton = document.getElementById("repeatButton");
const favoriteButton = document.getElementById("favoriteButton");
const progressBar = document.getElementById("progressBar");
const volumeBar = document.getElementById("volumeBar");
const muteButton = document.getElementById("muteButton");
const volumeIcon = document.getElementById("volumeIcon");
const volumeValue = document.getElementById("volumeValue");
const autoplayToggle = document.getElementById("autoplayToggle");
const themeButton = document.getElementById("themeButton");
const themeIcon = document.getElementById("themeIcon");
const playlistElement = document.getElementById("playlist");
const albumArtwork = document.getElementById("albumArtwork");
const songTitle = document.getElementById("songTitle");
const artistName = document.getElementById("artistName");
const trackNumber = document.getElementById("trackNumber");
const trackCopy = document.querySelector(".track-copy");
const currentTimeElement = document.getElementById("currentTime");
const durationElement = document.getElementById("duration");
const favoriteCount = document.getElementById("favoriteCount");
const playlistCount = document.getElementById("playlistCount");
const toast = document.getElementById("toast");
const listeningTime = document.getElementById("listeningTime");

let currentSongIndex = 0;
let isShuffleOn = false;
let isRepeatOn = false;
let currentFilter = "all";
let toastTimer;
let listenedSeconds = 0;

let favorites = JSON.parse(localStorage.getItem("neonwaveFavorites")) || [];
const savedTheme = localStorage.getItem("neonwaveTheme") || "dark";

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function loadSong(index) {
  const song = songs[index];
  currentSongIndex = index;

  audioPlayer.src = song.file;
  albumArtwork.src = song.cover;
  albumArtwork.alt = `${song.title} album cover`;
  songTitle.textContent = song.title;
  artistName.textContent = song.artist;
  trackNumber.textContent = `TRACK ${String(index + 1).padStart(2, "0")} / ${String(songs.length).padStart(2, "0")}`;
  currentTimeElement.textContent = "0:00";
  durationElement.textContent = song.duration;
  progressBar.value = 0;
  updateRangeBackground(progressBar, 0);

  trackCopy.classList.remove("track-changed");
  void trackCopy.offsetWidth;
  trackCopy.classList.add("track-changed");

  updateFavoriteButtons();
  renderPlaylist();
}

async function togglePlay() {
  if (audioPlayer.paused) {
    try {
      await audioPlayer.play();
    } catch (error) {
      showToast("Press play again if your browser blocked audio");
    }
  } else {
    audioPlayer.pause();
  }
}

function updatePlayUI(isPlaying) {
  playIcon.textContent = isPlaying ? "Ⅱ" : "▶";
  playButton.setAttribute("aria-label", isPlaying ? "Pause song" : "Play song");
  document.body.classList.toggle("is-playing", isPlaying);
}

function getNextIndex() {
  if (!isShuffleOn || songs.length === 1) {
    return (currentSongIndex + 1) % songs.length;
  }

  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * songs.length);
  } while (randomIndex === currentSongIndex);

  return randomIndex;
}

function playSongAt(index) {
  loadSong(index);
  togglePlay();
}

function playNextSong() {
  playSongAt(getNextIndex());
}

function playPreviousSong() {
  const previousIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  playSongAt(previousIndex);
}

function updateRangeBackground(range, percentage) {
  range.style.setProperty("--range-progress", `${percentage}%`);
}

function renderPlaylist() {
  const visibleSongs = songs
    .map((song, index) => ({ ...song, originalIndex: index }))
    .filter(song => currentFilter === "all" || favorites.includes(song.originalIndex));

  playlistElement.innerHTML = "";
  playlistCount.textContent = `${visibleSongs.length} ${visibleSongs.length === 1 ? "song" : "songs"}`;

  if (visibleSongs.length === 0) {
    playlistElement.innerHTML = '<p class="empty-message">No favorite songs yet.<br>Tap the heart beside any song to save it here.</p>';
    return;
  }

  visibleSongs.forEach((song, listIndex) => {
    const songRow = document.createElement("div");
    const isFavorite = favorites.includes(song.originalIndex);
    songRow.className = `song-item ${song.originalIndex === currentSongIndex ? "active" : ""}`;
    songRow.setAttribute("role", "button");
    songRow.setAttribute("tabindex", "0");
    songRow.setAttribute("aria-label", `Play ${song.title} by ${song.artist}`);
    songRow.style.setProperty("--item-index", listIndex);

    songRow.innerHTML = `
      <img src="${song.cover}" alt="">
      <span class="song-info">
        <strong>${song.title}</strong>
        <span>${song.artist}</span>
      </span>
      <span class="song-duration">${song.duration}</span>
      <button class="mini-favorite ${isFavorite ? "active" : ""}" type="button"
        aria-label="${isFavorite ? "Remove" : "Add"} ${song.title} ${isFavorite ? "from" : "to"} favorites">
        ${isFavorite ? "♥" : "♡"}
      </button>
    `;

    songRow.addEventListener("click", () => playSongAt(song.originalIndex));
    songRow.addEventListener("keydown", event => {
      if (event.key === "Enter") playSongAt(song.originalIndex);
    });

    songRow.querySelector(".mini-favorite").addEventListener("click", event => {
      event.stopPropagation();
      toggleFavorite(song.originalIndex);
    });

    playlistElement.appendChild(songRow);
  });
}

function toggleFavorite(index = currentSongIndex) {
  const favoritePosition = favorites.indexOf(index);

  if (favoritePosition === -1) {
    favorites.push(index);
    showToast("Added to favorites");
  } else {
    favorites.splice(favoritePosition, 1);
    showToast("Removed from favorites");
  }

  localStorage.setItem("neonwaveFavorites", JSON.stringify(favorites));
  updateFavoriteButtons();
  renderPlaylist();
}

function updateFavoriteButtons() {
  const isFavorite = favorites.includes(currentSongIndex);
  favoriteButton.textContent = isFavorite ? "♥" : "♡";
  favoriteButton.classList.toggle("active", isFavorite);
  favoriteButton.setAttribute("aria-label", isFavorite ? "Remove current song from favorites" : "Add current song to favorites");
  favoriteCount.textContent = favorites.length;
}

function setTheme(theme) {
  const lightTheme = theme === "light";
  document.body.classList.toggle("light-theme", lightTheme);
  themeIcon.textContent = lightTheme ? "☾" : "☀";
  themeButton.setAttribute("aria-label", lightTheme ? "Switch to dark theme" : "Switch to light theme");
  document.querySelector('meta[name="theme-color"]').content = lightTheme ? "#eef1fb" : "#080914";
  localStorage.setItem("neonwaveTheme", theme);
}

playButton.addEventListener("click", togglePlay);
nextButton.addEventListener("click", playNextSong);
previousButton.addEventListener("click", playPreviousSong);
favoriteButton.addEventListener("click", () => toggleFavorite());

shuffleButton.addEventListener("click", () => {
  isShuffleOn = !isShuffleOn;
  shuffleButton.classList.toggle("active", isShuffleOn);
  shuffleButton.setAttribute("aria-label", isShuffleOn ? "Turn shuffle off" : "Turn shuffle on");
  showToast(`Shuffle ${isShuffleOn ? "on" : "off"}`);
});

repeatButton.addEventListener("click", () => {
  isRepeatOn = !isRepeatOn;
  repeatButton.classList.toggle("active", isRepeatOn);
  repeatButton.setAttribute("aria-label", isRepeatOn ? "Turn repeat off" : "Turn repeat on");
  showToast(`Repeat ${isRepeatOn ? "on" : "off"}`);
});

themeButton.addEventListener("click", () => {
  const newTheme = document.body.classList.contains("light-theme") ? "dark" : "light";
  themeButton.classList.remove("theme-spinning");
  void themeButton.offsetWidth;
  themeButton.classList.add("theme-spinning");
  setTheme(newTheme);
});
document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    renderPlaylist();
  });
});

audioPlayer.addEventListener("play", () => updatePlayUI(true));
audioPlayer.addEventListener("pause", () => updatePlayUI(false));

audioPlayer.addEventListener("loadedmetadata", () => {
  durationElement.textContent = formatTime(audioPlayer.duration);
});

audioPlayer.addEventListener("timeupdate", () => {
  currentTimeElement.textContent = formatTime(audioPlayer.currentTime);

  if (audioPlayer.duration) {
    const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.value = progressPercent;
    updateRangeBackground(progressBar, progressPercent);
  }
});
progressBar.addEventListener("input", () => {
  if (!audioPlayer.duration) return;
  audioPlayer.currentTime = (progressBar.value / 100) * audioPlayer.duration;
  updateRangeBackground(progressBar, progressBar.value);
});

audioPlayer.addEventListener("ended", () => {
  if (isRepeatOn) {
    audioPlayer.currentTime = 0;
    audioPlayer.play();
  } else if (autoplayToggle.checked) {
    playNextSong();
  } else {
    updatePlayUI(false);
    progressBar.value = 0;
    updateRangeBackground(progressBar, 0);
  }
});

audioPlayer.addEventListener("error", () => {
  updatePlayUI(false);
  showToast("This audio could not load. Check the song file path.");
});

volumeBar.addEventListener("input", () => {
  audioPlayer.volume = volumeBar.value;
  audioPlayer.muted = false;
  const percent = Math.round(volumeBar.value * 100);
  volumeValue.textContent = `${percent}%`;
  volumeIcon.textContent = percent === 0 ? "🔇" : "🔊";
  updateRangeBackground(volumeBar, percent);
});

muteButton.addEventListener("click", () => {
  audioPlayer.muted = !audioPlayer.muted;
  volumeIcon.textContent = audioPlayer.muted ? "🔇" : "🔊";
  muteButton.setAttribute("aria-label", audioPlayer.muted ? "Unmute sound" : "Mute sound");
  showToast(audioPlayer.muted ? "Sound muted" : "Sound on");
});

document.addEventListener("keydown", event => {
  const interactiveElement = ["BUTTON", "INPUT"].includes(document.activeElement.tagName);
  if (event.code === "Space" && !interactiveElement) {
    event.preventDefault();
    togglePlay();
  }
});

setInterval(() => {
  if (!audioPlayer.paused) {
    listenedSeconds += 1;
    listeningTime.textContent = listenedSeconds < 60 ? "< 1 min" : `${Math.floor(listenedSeconds / 60)} min`;
  }
}, 1000);

audioPlayer.volume = Number(volumeBar.value);
setTheme(savedTheme);
updateRangeBackground(volumeBar, Number(volumeBar.value) * 100);
loadSong(currentSongIndex);
