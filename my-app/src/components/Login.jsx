import { AUTH_URL } from "../auth";

export default function Login() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <h1 className="text-3xl mb-6">Spotify Clone</h1>
      <a href={AUTH_URL}>
        <button className="bg-green-500 hover:bg-green-600 px-6! py-3! rounded-lg">
          Login with Spotify
        </button>
      </a>
    </div>
  );
}
