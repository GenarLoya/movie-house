import path from "node:path";
import express from "express";

const app = express();
const PORT = 3000;
const cwd = process.cwd();

// Enable CORS for all requests
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Range");
  next();
});

app.use(
  "/hls",
  express.static(path.join(cwd, ".data", "media"), {
    setHeaders: (res, filePath) => {
      const ext = path.extname(filePath);
      if (ext === ".m3u8") {
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      } else if (ext === ".ts") {
        res.setHeader("Content-Type", "video/mp2t");
      }
    },
  }),
);

app.get("/video-web", (_req, res) => {
  res.sendFile(path.join(cwd, "public", "index.html"));
});

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
