import mongoose from "mongoose";
import express from "express";
import Employee from "./model/employees.js";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import axios from "axios";

let conn = await mongoose.connect("mongodb://localhost:27017/company");
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientId = "4ac9f66ec7f742848636a791d5c05512";
const clientSecret = "a76c331c4f3b45f09a519d85dff857f8";
const redirectUri = "http://127.0.0.1:5173/callback";

const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "src")));

// ----------------------------------------------------------------------
// Test API route
// ----------------------------------------------------------------------
app.get('/api', async (req, res) => {
  try {
    const employee = await Employee.findOne();
    if (!employee) {
      return res.json({ message: "No employee found in database!" });
    }
    res.json({ message: `Employee name: ${employee.name} Employee city:${employee.city}` });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error reading from database" });
  }
});

// ----------------------------------------------------------------------
// Spotify Login – exchange code for token
// ----------------------------------------------------------------------
app.post("/login", async (req, res) => {
  try {
    const { code } = req.body;
    console.log("Backend received code:", code);

    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", redirectUri);
    params.append("client_id", clientId);
    params.append("client_secret", clientSecret);

    const response = await axios.post("https://accounts.spotify.com/api/token", params);

    console.log("Spotify Response:", response.data);
    res.json(response.data);

  } catch (error) {
    console.error("Token Error:", error.response?.data || error.message);
    res.status(400).send("Error getting token");
  }
});

// ----------------------------------------------------------------------
// Fetch playlists of authenticated user
// ----------------------------------------------------------------------
app.get("/me/playlists", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    console.log("Received token from frontend:", token);

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const response = await axios.get("https://api.spotify.com/v1/me/playlists", {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    res.json(response.data);

  } catch (err) {
    console.error("Playlist error:", err.response?.data || err);
    res.status(400).json({ error: "Error fetching playlists" });
  }
});

// ----------------------------------------------------------------------
// Fetch tracks inside a playlist
// ----------------------------------------------------------------------
app.get("/playlist/:id", async (req, res) => {
  try {
    const playlistId = req.params.id;
    const token = req.headers.authorization?.split(" ")[1];

    console.log("Tracks request token:", token);

    if (!token) {
      return res.status(401).json({ error: "No token provided for tracks" });
    }

    const response = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    res.json(response.data);

  } catch (error) {
    console.error("Track error:", error.response?.data || error.message);
    res.status(400).send("Error fetching tracks");
  }
});

app.listen(port, () => {
  console.log(`Express.js server listening at http://localhost:${port}`);
});
