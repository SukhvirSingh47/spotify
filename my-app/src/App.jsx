import { useEffect, useState } from "react";
const FALLBACK_IMG = "https://picsum.photos/500?random=1";

const loadImageSafely = (url) => {
  return new Promise((resolve) => {
    if (!url) return resolve({ ok: false, url: FALLBACK_IMG });
    const img = new Image();
    img.src = url;
    img.onload = () => resolve({ ok: true, url });
    img.onerror = () => resolve({ ok: false, url: FALLBACK_IMG });
  });
};

export default function App() {
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);

  // Listen for plain HTML search events
  useEffect(() => {
    const handleSearch = (e) => {
      const newQuery = e.detail;
      setQuery(newQuery);
      searchTracks(newQuery); // Pass query to search
    };

    window.addEventListener("searchTracks", handleSearch);

    return () => window.removeEventListener("searchTracks", handleSearch);
  }, []);

  const searchTracks = async (q) => {
    if (!q?.trim()) return;
    try {
      const nodeRes = await fetch("https://api.audius.co");
      const nodeJson = await nodeRes.json();
      const discoveryNode = nodeJson.data[0];

      const res = await fetch(
        `${discoveryNode}/v1/tracks/search?query=${encodeURIComponent(
          q
        )}&app_name=yourapp`
      );

      const json = await res.json();

      const processed = await Promise.all(
        (json?.data || []).map(async (t) => {
          const raw =
            t.artwork?.["150x150"] ||
            t.artwork?.["480x480"] ||
            t.artwork?.["1000x1000"] ||
            null;

          const result = raw ? await loadImageSafely(raw) : { url: FALLBACK_IMG };

          return {
            ...t,
            safeArtwork: result.url,
            artworkLoading: false,
          };
        })
      );

      setTracks(processed);
    } catch (err) {
      console.log(err);
      alert("Search failed");
    }
  };

 const playTrack = async (trackId, trackTitle) => {
  try {
    const nodeRes = await fetch("https://api.audius.co");
    const nodeJson = await nodeRes.json();
    const discoveryNode = nodeJson.data[0];

    const trackRes = await fetch(
      `${discoveryNode}/v1/tracks/${trackId}?app_name=yourapp`
    );
    const fullTrack = await trackRes.json();

    if (!fullTrack.data) {
      alert("Track not found");
      return;
    }

    const streamUrl = `${discoveryNode}/v1/tracks/${trackId}/stream?app_name=yourapp`;

    const raw =
      fullTrack.data?.artwork?.["480x480"] ||
      fullTrack.data?.artwork?.["1000x1000"] ||
      fullTrack.data?.artwork?.["150x150"] ||
      null;

    const result = await loadImageSafely(raw);

    // Dispatch event for external player
    const event = new CustomEvent("playExternalTrack", {
      detail: {
        title: trackTitle,
        url: streamUrl,
        artwork: result.url,
      },
    });
    window.dispatchEvent(event);

    setCurrentTrack({
      title: trackTitle,
      url: streamUrl,
      artwork: result.url,
    });
  } catch (err) {
    console.error(err);
    alert("Error fetching stream URL");
  }
};


  const shimmerStyle = {
    width: 60,
    height: 60,
    borderRadius: 6,
    background: "linear-gradient(90deg, #eee, #ddd, #eee)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.3s infinite",
  };

  return (
    <div style={{ padding: 30, fontFamily: "Arial", overflowY: "scroll", height: "100vh"}}>
      <h1>Audius Music</h1>

      {/* RESULTS */}
      <div>
        {tracks.map((t) => (
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
            <div>
              <h3 style={{ margin: 0 }}>{t.title}</h3>
              <p style={{ margin: 0, opacity: 0.7 }}>
                {t.user?.name || "Unknown Artist"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* {currentTrack && (
        <div style={{ marginTop: 40, padding: 20, border: "1px solid #ddd" }}>
          <h2>Now Playing</h2>
          <h3>{currentTrack.title}</h3>
          <img
            src={currentTrack.artwork}
            style={{ width: 250, marginBottom: 20, borderRadius: 10 }}
          />
          <audio src={currentTrack.url}/>
        </div>
      )} */}

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
