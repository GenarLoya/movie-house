import express from "express";
import path from "path";
import fs from "fs";
import { spawn } from "node:child_process";

const app = express();
const PORT = 3000;
const cwd = process.cwd();

// Carpeta base para HLS
const HLS_BASE = path.join(cwd, ".data/streaming/hls");

// Asegurarse que la carpeta base exista
if (!fs.existsSync(HLS_BASE)) fs.mkdirSync(HLS_BASE, { recursive: true });

// Endpoint HLS dinámico
app.get("/hls/:videoId/out.m3u8", async (req, res) => {
  const { videoId } = req.params;
  const videoFile = path.join(cwd, ".data/media", `${videoId}.mp4`);

  if (!fs.existsSync(videoFile)) {
    return res.status(404).send("Video not found");
  }

  const hlsFolder = path.join(HLS_BASE, videoId);
  const playlistPath = path.join(hlsFolder, "out.m3u8");

  // Si ya existe la playlist, la servimos directamente
  if (fs.existsSync(playlistPath)) {
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    return fs.createReadStream(playlistPath).pipe(res);
  }

  // Si no existe, creamos la carpeta
  if (!fs.existsSync(hlsFolder)) fs.mkdirSync(hlsFolder, { recursive: true });

  console.log(`Generando HLS para videoId: ${videoId}`);

  // Generar HLS usando FFmpeg
  const ffmpeg = spawn("ffmpeg", [
    "-i",
    videoFile,
    "-c:v",
    "libx264",
    "-c:a",
    "aac",
    "-f",
    "hls",
    "-hls_time",
    "5", // duración de cada segmento
    "-hls_list_size",
    "0", // incluir todos los segmentos
    "-hls_segment_filename",
    path.join(hlsFolder, "out%d.ts"), // segmentos
    playlistPath, // playlist final
  ]);

  ffmpeg.stderr.on("data", (data) => console.log(data.toString()));
  ffmpeg.on("close", (code) => {
    if (code === 0) {
      console.log(`HLS generado para ${videoId}`);
      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      fs.createReadStream(playlistPath).pipe(res);
    } else {
      console.error(`FFmpeg fallo con código ${code}`);
      res.status(500).send("Error generando HLS");
    }
  });
});

// Servir los segmentos .ts dinámicamente
app.use("/hls", express.static(HLS_BASE));

// HTML simple para probar
app.get("/video-web", (_req, res) => {
  res.sendFile(path.join(cwd, "public", "index.html"));
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
