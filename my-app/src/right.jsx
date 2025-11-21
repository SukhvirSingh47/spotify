import { useEffect, useState } from "react";
import "./App"
// import "../style.css"; // keep your original CSS

export default function RightContainer() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    // --- Custom Scrollbar Logic ---
    const right = document.querySelector(".right");
    const container = document.querySelector(".Content");
    const thumb = document.querySelector(".custom-thumb");

    if (!right || !container || !thumb) return;

    const maxScroll = container.scrollHeight - container.clientHeight;
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
      thumb.style.opacity = "1";
    }

    function hideThumb() {
      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => (thumb.style.opacity = "0"), 1000);
    }

    container.addEventListener("scroll", updateThumb);
    container.addEventListener("mouseenter", showThumb);
    container.addEventListener("mouseleave", hideThumb);

    thumb.addEventListener("mousedown", (e) => {
      isDragging = true;
      startY = e.clientY;
      startScrollTop = container.scrollTop;
      document.body.style.userSelect = "none";
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      document.body.style.userSelect = "";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const deltaY = e.clientY - startY;
      const thumbHeight = thumb.clientHeight;
      const maxThumbTop = right.clientHeight - thumbHeight;
      const scrollRatio = maxScroll / maxThumbTop;
      container.scrollTop = startScrollTop + deltaY * scrollRatio;
      showThumb();
    });

    updateThumb();
    fetch("http://localhost:3000/api")
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => console.error("Error fetching message:", err))
    // Cleanup when component unmounts
    return () => {
      container.removeEventListener("scroll", updateThumb);
      container.removeEventListener("mouseenter", showThumb);
      container.removeEventListener("mouseleave", hideThumb);
    };
  }, []); // runs once after mount

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>Audius Music</h1>

      {/* SEARCH BAR */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search songs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: 10, width: 250 }}
        />
        <button onClick={searchTracks} style={{ padding: 10, marginLeft: 10 }}>
          Search
        </button>
      </div>

      {/* RESULTS */}
      <div>
        {tracks.map((t, i) => (
          <div
            key={t.id}
            onClick={() => playTrack(t.id, t.title)}
            style={{
              cursor: "pointer",
              borderBottom: "1px solid #ccc",
              padding: "10px 0",
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* SHIMMER WHILE LOADING */}
            {t.artworkLoading ? (
              <div style={shimmerStyle}></div>
            ) : (
              <img
                src={t.safeArtwork}
                alt=""
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 6,
                  marginRight: 15,
                }}
              />
            )}

            <div>
              <h3 style={{ margin: 0 }}>{t.title}</h3>
              <p style={{ margin: 0, opacity: 0.7 }}>
                {t.user?.name || "Unknown Artist"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* PLAYER */}
      {currentTrack && (
        <div style={{ marginTop: 40, padding: 20, border: "1px solid #ddd" }}>
          <h2>Now Playing</h2>
          <h3>{currentTrack.title}</h3>

          <img
            src={currentTrack.artwork}
            style={{
              width: 250,
              marginBottom: 20,
              borderRadius: 10,
            }}
          />

          <audio src={currentTrack.url} controls autoPlay style={{ width: "100%" }} />
        </div>
      )}

      {/* SHIMMER ANIMATION */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
