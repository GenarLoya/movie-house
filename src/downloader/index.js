import fs from "node:fs";
import path from "nodepath";
import WebTorrent, { type Torrent, type TorrentFile } from "webtorrent";

interface DownloadItem {
  magnet: string;
  target: string;
}

const CONFIG_FILE = path.join(".data", "config", "download_stack.json");
const MEDIA_DIR = path.join(".data", "media");

const client = new WebTorrent();

function getAvailablePath(filePath: string): string {
  if (!fs.existsSync(filePath)) return filePath;

  const { dir, name, ext } = path.parse(filePath);
  let counter = 1;
  let newPath: string;
  do {
    newPath = path.join(dir, `${name} (${counter})${ext}`);
    counter++;
  } while (fs.existsSync(newPath));
  return newPath;
}

function ensureCorrectExtension(filePath: string, actualExt: string): string {
  const { dir, name, ext } = path.parse(filePath);
  if (ext.toLowerCase() !== actualExt.toLowerCase()) {
    const corrected = path.join(dir, `${name}${actualExt}`);
    fs.renameSync(filePath, corrected);
    return corrected;
  }
  return filePath;
}

// Leer el JSON con los torrents
const downloadStack: DownloadItem[] = JSON.parse(
  fs.readFileSync(CONFIG_FILE, "utf-8"),
);

downloadStack.forEach(({ magnet, target }) => {
  client.add(magnet, (torrent: Torrent) => {
    const file: TorrentFile = torrent.files[0];
    const ext = path.extname(file.name);

    let targetPath = path.join(MEDIA_DIR, target);

    targetPath = getAvailablePath(targetPath);

    console.log(`Descargando ${file.name} → ${targetPath}`);

    fs.mkdirSync(path.dirname(targetPath), { recursive: true });

    const writeStream = fs.createWriteStream(targetPath);
    const stream = file.createReadStream();

    stream.pipe(writeStream);

    writeStream.on("finish", () => {
      const finalPath = ensureCorrectExtension(targetPath, ext);
      console.log("Archivo guardado en:", finalPath);
    });

    stream.on("error", (err: Error) => {
      console.error("Error en el stream:", err);
    });
  });
});
