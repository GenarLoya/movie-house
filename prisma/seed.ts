import { prisma } from "../src/db/prisma";

async function main() {
  console.log("Seeding database...");

  // Create MediaFiles
  const mediaFile1 = await prisma.mediaFile.create({
    data: {
      type: "MOVIE",
      status: "READY",
      originalPath: "/media/originals/movie1.mp4",
      container: "MP4",
      sizeBytes: 5000000000,
      durationSec: 7200,
      hlsPath: "/media/hls/movie1",
      hlsStatus: "READY",
    },
  });

  const mediaFile2 = await prisma.mediaFile.create({
    data: {
      type: "EPISODE",
      status: "READY",
      originalPath: "/media/originals/episode1.mp4",
      container: "MP4",
      sizeBytes: 1500000000,
      durationSec: 1800,
      hlsPath: "/media/hls/episode1",
      hlsStatus: "READY",
    },
  });

  // Create a Movie
  const movie = await prisma.movie.create({
    data: {
      title: "Inception",
      description: "A mind-bending thriller by Christopher Nolan.",
      releaseYear: 2010,
      mediaFileId: mediaFile1.id,
    },
  });

  // Create a Series
  const series = await prisma.series.create({
    data: {
      title: "Breaking Bad",
      description:
        "A high school chemistry teacher turned methamphetamine producer.",
    },
  });

  // Create a Season
  const season = await prisma.season.create({
    data: {
      number: 1,
      seriesId: series.id,
    },
  });

  // Create an Episode
  const episode = await prisma.episode.create({
    data: {
      title: "Pilot",
      number: 1,
      description: "The first episode of Breaking Bad.",
      seasonId: season.id,
      mediaFileId: mediaFile2.id,
    },
  });

  console.log("Database seeded successfully!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
