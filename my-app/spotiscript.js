document.addEventListener("DOMContentLoaded", () => {
    // -------------------- CUSTOM SCROLLBAR --------------------
    const right = document.querySelector('.right');
    // const container = document.querySelector('.Content');
    const thumb = document.querySelector('.custom-thumb');
    // const maxScroll = container.scrollHeight - container.clientHeight;
    let hideTimeout, isDragging = false, startY, startScrollTop;

    function updateThumb() {
        const scrollTop = container.scrollTop;
        const thumbHeight = right.clientHeight * (container.clientHeight / container.scrollHeight);
        const thumbTop = (scrollTop / maxScroll) * (right.clientHeight - thumbHeight);
        thumb.style.height = `${thumbHeight}px`;
        thumb.style.top = `${thumbTop}px`;
    }

    function showThumb() {
        clearTimeout(hideTimeout);
        thumb.style.opacity = '1';
    }

    function hideThumb() {
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => thumb.style.opacity = '0', 1000);
    }

    // container.addEventListener('scroll', updateThumb); 
    // container.addEventListener('mouseenter', showThumb);
    // container.addEventListener('mouseleave', hideThumb);

    // thumb.addEventListener('mousedown', (e) => {
    //     isDragging = true;
    //     startY = e.clientY;
    //     startScrollTop = container.scrollTop;
    //     document.body.style.userSelect = 'none';
    // });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        document.body.style.userSelect = '';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaY = e.clientY - startY;
        const thumbHeight = thumb.clientHeight;
        const maxThumbTop = right.clientHeight - thumbHeight;
        const scrollRatio = maxScroll / maxThumbTop;
        container.scrollTop = startScrollTop + deltaY * scrollRatio;
        showThumb();
    });

    // updateThumb();

    // -------------------- AUDIO PLAYER --------------------
    const playbt = document.querySelector('.playbtn');
    const audio = document.querySelector('audio');
    const dur = document.querySelector('.totalTime');
    const curtime = document.querySelector('.currentTime');
    const progressBar = document.querySelector('.lineProgress');
    const ball = document.querySelector('.ball');
    const lineBar = document.querySelector('.lineBar');
    const trackTitleDiv = document.querySelector('.playing div'); // Adjust selector to the element showing track title
    const trackImg = document.querySelector('.playing img'); // Adjust selector to the element showing track artwork
    const imgPlay = document.querySelector('.playbtn img');
    const titleDiv = document.querySelector('.title');
    // Listen for React to send a track
    window.addEventListener("playExternalTrack", (e) => {
        const { title, url, artwork } = e.detail;

        audio.src = url;            // Update audio source
        // trackTitleDiv.textContent = title; // Update title
        trackImg.src = artwork;     // Update artwork
        titleDiv.textContent = title; // Update title

        audio.play();               // Auto-play
        imgPlay.src = "images/pause.svg"; // Update play button icon
    });

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' + secs : secs}`;
    }

    // ✅ Safe duration display
    function updateDuration() {
        if (!isNaN(audio.duration)) {
            dur.textContent = formatTime(audio.duration);
        }
    }
    if (audio.readyState >= 1) {
        updateDuration();
    } else {
        audio.addEventListener('loadedmetadata', updateDuration);
    }

    // ✅ Update progress + ball
    audio.addEventListener('timeupdate', () => {
        if (!isNaN(audio.duration)) {
            const progress = audio.currentTime / audio.duration;
            const barWidth = lineBar.clientWidth;
            const ballWidth = ball.offsetWidth;

            progressBar.style.width = `${progress * 100}%`;
            ball.style.left = `${progress * (barWidth - ballWidth)}px`;
            curtime.textContent = formatTime(audio.currentTime);
        }
        const img = playbt.querySelector("img");
        if (audio.ended) {
            img.setAttribute("src", "images/play.svg");
        }
    });

    // ✅ Play/Pause toggle
    playbt.addEventListener("click", () => {
        console.log("i'm clicked")
        const img = playbt.querySelector("img");
        if (audio.paused) {
            audio.play();
            img.setAttribute("src", "images/pause.svg");
        } else {
            audio.pause();
            img.setAttribute("src", "images/play.svg");
        }
    });

    //✅ timeLine seeking
    let startX, startWidth;
    const maxWidth = lineBar.clientWidth;
    lineBar.addEventListener('click', (e) => {
        if (isDragging) return;
        updateProgress(e.clientX);
    });
    ball.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startWidth = progressBar.clientWidth;
        document.body.style.userSelect = 'none';
        ball.classList.add('dragging');
        lineBar.classList.add('dragging');
        updateProgress(e.clientX);
    });
    document.addEventListener('mouseup', () => {
        isDragging = false;
        document.body.style.userSelect = '';
        ball.classList.remove('dragging');
        lineBar.classList.remove('dragging');
    });
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        updateProgress(e.clientX);
    });
    function updateProgress(clientX) {
        let newWidth;
        if (isDragging) {
            let deltaX = clientX - startX;
            newWidth = Math.min(Math.max(startWidth + deltaX, 0), maxWidth);
        } else {
            newWidth = Math.min(Math.max(clientX - lineBar.getBoundingClientRect().left, 0), maxWidth);
        }
        progressBar.style.width = `${newWidth}px`;
        ball.style.left = `${newWidth - ball.offsetWidth}px`;
        audio.currentTime = (newWidth / maxWidth) * audio.duration;
    }
    //-------------------volume control-------------------------
    const volBar = document.querySelector('.volbar');
    const volProgress = document.querySelector('.volProgress');
    const volBall = document.querySelector('.volbar .ball');
    // const audio = document.querySelector('audio');
    const vol = document.querySelector('.vol')
    let isVolDragging = false;
    // let startWidth;
    const maxVolWidth = volBar.clientWidth;
    // ✅ Safe initial volume setup
    if (audio.readyState >= 1) {
        volProgress.style.width = `${audio.volume / 1 * 100}%`
        volimg();

    } else {
        audio.addEventListener('loadedmetadata', () => {
            volProgress.style.width = `${audio.volume / 1 * 100}%`
            volimg();
        });
    }
    // ✅ Volume adjustment via click
    vol.addEventListener('click', (e) => {
        if (isVolDragging) return;
        updateVolProgress(e.clientX);
        volimg();
    });
    // ✅ Volume adjustment via mouse wheel
    vol.addEventListener('wheel', (e) => {
        e.preventDefault();
        let delta = e.deltaY < 0 ? 0.05 : -0.05;
        audio.volume = Math.min(Math.max(audio.volume + delta, 0), 1);
        updateVolProgress(volBar.getBoundingClientRect().left + audio.volume * maxVolWidth);
        volimg();
    });
    // ✅ Volume adjustment via drag
    volBall.addEventListener('mousedown', (e) => {
        isVolDragging = true;
        startY = e.clientX;
        startWidth = volProgress.clientWidth;
        audio.volume = startWidth / maxVolWidth;
        document.body.style.userSelect = 'none';
        volBall.classList.add('dragging');
        vol.classList.add('dragging');
        updateVolProgress(e.clientX);
    });
    document.addEventListener('mouseup', () => {
        isVolDragging = false;
        document.body.style.userSelect = '';
        volBall.classList.remove('dragging');
        vol.classList.remove('dragging');
    });
    document.addEventListener('mousemove', (e) => {
        if (!isVolDragging) return;

        updateVolProgress(e.clientX);
        volimg();
    });
    // ✅ Volume ball visibility on drag
    // if(isVolDragging){
    //     volBall.style.opacity = '1';
    //     volProgress.style.backgroundColor = 'rgb(2, 171, 2)';
    // }

    // ✅ Volume icon update
    function volimg() {
        if (audio.volume === 0.0) {
            vol.querySelector('img').setAttribute('src', 'images/volmute.svg');
        }
        else if (audio.volume > 0.0 && audio.volume <= 0.3) {
            vol.querySelector('img').setAttribute('src', 'images/vollow.svg');
        }
        else if (audio.volume > 0.3 && audio.volume <= 0.6) {
            vol.querySelector('img').setAttribute('src', 'images/volmed.svg');
        }
        else {
            vol.querySelector('img').setAttribute('src', 'images/volhigh.svg');
        }
    }
    // ✅ Update volume progress and ball position
    function updateVolProgress(clientX) {
        let newWidth;

        if (isVolDragging) {
            let deltaX = clientX - startY;
            newWidth = Math.min(Math.max(startWidth + deltaX, 0), maxVolWidth);
        } else {
            newWidth = Math.min(Math.max(clientX - volBar.getBoundingClientRect().left, 0), maxVolWidth);
        }

        volProgress.style.width = `${newWidth}px`;
        volBall.style.left = `${newWidth - volBall.offsetWidth + 6}px`;
        audio.volume = newWidth / maxVolWidth;
    }
    //--------------------Audio track control--------------------
    // const next = document.querySelector('.next');
    // const prev = document.querySelector('.prev');
    // const audioTracks = [
    //     'audio/track1.mp3',
    //     'audio/track2.mp3',
    //     'audio/track3.mp3'
    // ];
    // let currentTrackIndex = 0;
    // next.addEventListener('click', () => {
    //     currentTrackIndex = (currentTrackIndex + 1) % audioTracks.length;
    //     audio.src = audioTracks[currentTrackIndex];
    //     audio.play();
    //     playbt.querySelector("img").setAttribute("src", "images/pause.svg");
    // });
    // prev.addEventListener('click', () => {
    //     currentTrackIndex = (currentTrackIndex - 1 + audioTracks.length) % audioTracks.length;
    //     audio.src = audioTracks[currentTrackIndex];
    //     audio.play();
    //     playbt.querySelector("img").setAttribute("src", "images/pause.svg");
    // });
    //--------------------TimeLine seeking control--------------------
    document.querySelector(".pre").addEventListener("click", async () => {
        // let a = await fetch('/generate');
        // let b = await a.text();
        // console.log(b);
        window.location.href = "/premeum";
    })

    // -------------------- INPUT FOCUS FUNCTION --------------------;
});
const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("myInput");

searchBtn.addEventListener("click", () => {
    const query = searchInput.value;
    // Dispatch a custom event with query
    window.dispatchEvent(new CustomEvent("searchTracks", { detail: query }));
});

// Optional: trigger search when Enter is pressed
searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        searchBtn.click();
    }
});

function focusInput() {
    document.getElementById("myInput").focus();
}