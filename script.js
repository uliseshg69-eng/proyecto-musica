// Playlist de ejemplo con URLs de canciones de prueba
const playlist = [
    {
        title: "Ocean Waves",
        artist: "Ambient Music",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    {
        title: "Forest Sounds",
        artist: "Nature Sounds",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    },
    {
        title: "City Vibes",
        artist: "Urban Beats",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    },
    {
        title: "Mountain Echo",
        artist: "Nature Sounds",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
    },
    {
        title: "Sunset Dreams",
        artist: "Chill Lofi",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
    }
];

// DOM Elements
const audio = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const volumeSlider = document.getElementById('volume-slider');
const volumeValue = document.getElementById('volume-value');
const progressBar = document.querySelector('.progress-bar');
const progress = document.querySelector('.progress');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const songTitle = document.getElementById('song-title');
const songArtist = document.getElementById('song-artist');
const playlistEl = document.getElementById('playlist');
const visualizerBars = document.querySelectorAll('.bar');

// State
let currentSongIndex = 0;
let isPlaying = false;

// Initialize
function init() {
    loadPlaylist();
    loadSong(currentSongIndex);
    setupEventListeners();
}

// Load playlist in UI
function loadPlaylist() {
    playlistEl.innerHTML = '';
    playlist.forEach((song, index) => {
        const songElement = document.createElement('div');
        songElement.className = `playlist-item ${index === currentSongIndex ? 'active' : ''}`;
        songElement.innerHTML = `
            <div class="playlist-item-info">
                <div class="playlist-item-title">${song.title}</div>
                <div class="playlist-item-artist">${song.artist}</div>
            </div>
            <span>♫</span>
        `;
        songElement.addEventListener('click', () => {
            currentSongIndex = index;
            loadSong(index);
            play();
        });
        playlistEl.appendChild(songElement);
    });
}

// Load song
function loadSong(index) {
    const song = playlist[index];
    audio.src = song.url;
    songTitle.textContent = song.title;
    songArtist.textContent = song.artist;
    
    // Update active playlist item
    document.querySelectorAll('.playlist-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });
}

// Setup event listeners
function setupEventListeners() {
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', previousSong);
    nextBtn.addEventListener('click', nextSong);
    volumeSlider.addEventListener('input', changeVolume);
    progressBar.addEventListener('click', seek);
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', nextSong);
    audio.addEventListener('loadedmetadata', updateDuration);
}

// Play/Pause
function togglePlay() {
    if (isPlaying) {
        pause();
    } else {
        play();
    }
}

function play() {
    audio.play();
    isPlaying = true;
    playBtn.innerHTML = '<span>⏸️</span>';
    playBtn.title = 'Pausa';
    startVisualizer();
}

function pause() {
    audio.pause();
    isPlaying = false;
    playBtn.innerHTML = '<span>▶️</span>';
    playBtn.title = 'Reproducir';
    stopVisualizer();
}

// Next/Previous
function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    loadSong(currentSongIndex);
    if (isPlaying) play();
}

function previousSong() {
    currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    loadSong(currentSongIndex);
    if (isPlaying) play();
}

// Volume control
function changeVolume() {
    const volume = volumeSlider.value / 100;
    audio.volume = volume;
    volumeValue.textContent = volumeSlider.value;
}

// Progress bar
function updateProgress() {
    const { currentTime, duration } = audio;
    
    if (duration) {
        const progressPercent = (currentTime / duration) * 100;
        progress.style.width = progressPercent + '%';
    }
    
    currentTimeEl.textContent = formatTime(currentTime);
}

function updateDuration() {
    durationEl.textContent = formatTime(audio.duration);
}

function seek(e) {
    const width = progressBar.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    
    if (duration) {
        audio.currentTime = (clickX / width) * duration;
    }
}

// Format time (mm:ss)
function formatTime(time) {
    if (!time || isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Visualizer
function startVisualizer() {
    visualizerBars.forEach((bar) => {
        bar.style.animation = 'dance 0.6s ease-in-out infinite';
    });
}

function stopVisualizer() {
    visualizerBars.forEach((bar) => {
        bar.style.animation = 'none';
        bar.style.height = '20%';
    });
}

// Set initial volume
audio.volume = 0.7;

// Start the app
init();

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    switch(e.code) {
        case 'Space':
            e.preventDefault();
            togglePlay();
            break;
        case 'ArrowRight':
            nextSong();
            break;
        case 'ArrowLeft':
            previousSong();
            break;
    }
});

// Prevent audio from playing automatically
window.addEventListener('load', () => {
    audio.volume = 0.7;
});
