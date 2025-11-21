const clientId = "4ac9f66ec7f742848636a791d5c05512";
const redirectUri = "http://127.0.0.1:5173/callback";
const scopes = [
  "user-read-private",
  "user-read-email",
  "playlist-read-private",
  "playlist-modify-private",
  "user-library-read"
];

export const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
  redirectUri
)}&scope=${encodeURIComponent(scopes.join(" "))}`;
