import { spawn } from "node:child_process";
import path from "node:path";
import express from "express";

const app = express();
const PORT = 3000;
const cwd = process.cwd();

app.use("/hls", express.static(path.join(cwd, ".data", "media")));

app.get("/video-web", (_req, res) => {
  res.sendFile(path.join(cwd, "public", "index.html"));
});

app.get("/live", (req, res) => {
  const videoPath = path.join(cwd, ".data", "media", "ForBiggerEscapes.mp4");

  // Lanzamos FFmpeg para crear el stream en tiempo real
  const ffmpeg = spawn("ffmpeg", [
    "-re", // reproducir a velocidad real
    "-i",
    videoPath, // input
    "-c:v",
    "libx264", // video
    "-c:a",
    "aac", // audio
    "-f",
    "mpegts", // contenedor compatible con VLC/ffplay
    "pipe:1", // salida al stdout
  ]);

  res.writeHead(200, {
    "Content-Type": "video/mp2t",
  });

  ffmpeg.stdout.on("data", (chunk) => {
    console.log(`Enviando chunk de ${chunk.length} bytes`);
  });

  ffmpeg.stdout.pipe(res);

  // Si el cliente se desconecta, matamos FFmpeg
  req.on("close", () => {
    console.log("Cleint disconnection");
    ffmpeg.kill();
  });

  // Cuando FFmpeg termina, cerramos la respuesta HTTP
  ffmpeg.on("close", () => {
    console.log("FFmpeg closed");
    res.end();
  });
});

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
