# 📄 Media Processing System

## Technical Specification

---

## 1. Purpose & Scope

This document defines the **architecture, data models, processing flow, and responsibilities** of a media ingestion and streaming system.

The system supports:

* Large media uploads
* Asynchronous HLS generation
* Movies and TV series
* Centralized media tracking via a single `MediaFile` entity

Out of scope (for now):

* Subtitles
* DRM
* DASH
* Transcoding profiles customization
* User permissions

---

## 2. Core Design Principles

1. **Single Source of Truth**

   * `MediaFile` represents both original and processed media

2. **Async Processing**

   * Upload ≠ Transcoding
   * HLS is always generated in background

3. **Filesystem-first Media**

   * Database stores references, not media data

4. **Deterministic State Machine**

   * Media processing has explicit states

---

## 3. Domain Models (Prisma)

### 3.1 MediaFile

**Description**
Represents a physical media file and all its derived artifacts.

```prisma
model MediaFile {
  id             String   @id @default(uuid())

  // Original file
  originalPath   String
  originalSize   BigInt
  mimeType       String
  duration       Float?

  // HLS output
  hlsPath        String?
  manifestPath  String?

  // Processing
  status         MediaStatus
  errorMessage   String?

  // Relations
  movie          Movie?
  episode        Episode?

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

```prisma
enum MediaStatus {
  UPLOADED
  PROCESSING
  READY
  FAILED
}
```

---

### 3.2 Movie

```prisma
model Movie {
  id          String     @id @default(uuid())
  title       String
  description String?
  releaseDate DateTime?

  mediaFileId String     @unique
  mediaFile   MediaFile  @relation(fields: [mediaFileId], references: [id])

  createdAt   DateTime   @default(now())
}
```

---

### 3.3 Series / Season / Episode

```prisma
model Series {
  id          String   @id @default(uuid())
  title       String
  description String?

  seasons     Season[]
  createdAt   DateTime @default(now())
}
```

```prisma
model Season {
  id        String   @id @default(uuid())
  number    Int

  seriesId  String
  series    Series   @relation(fields: [seriesId], references: [id])

  episodes  Episode[]
}
```

```prisma
model Episode {
  id          String     @id @default(uuid())
  number      Int
  title       String?

  seasonId    String
  season      Season    @relation(fields: [seasonId], references: [id])

  mediaFileId String     @unique
  mediaFile   MediaFile  @relation(fields: [mediaFileId], references: [id])
}
```

---

## 4. Filesystem Layout

```
/media
├── originals
│   └── {mediaFileId}.mp4
└── hls
    └── {mediaFileId}
        ├── master.m3u8
        ├── 1080p.m3u8
        ├── 720p.m3u8
        ├── segments
        │   ├── 000.ts
        │   ├── 001.ts
        │   └── ...
```

---

## 5. Upload & Processing Flow

### 5.1 Upload Flow (Synchronous)

```text
Client
  ↓ (stream upload)
API /upload
  ↓
Write file to disk
  ↓
Create MediaFile (status=UPLOADED)
  ↓
Enqueue HLS job
  ↓
HTTP 200 OK
```

**Key Rules**

* No FFmpeg during upload
* Upload must be stream-based
* API response must be immediate

---

### 5.2 HLS Processing Flow (Asynchronous)

```text
BullMQ Worker
  ↓
Load MediaFile
  ↓
Update status → PROCESSING
  ↓
Run FFmpeg
  ↓
Generate HLS files
  ↓
Update MediaFile paths
  ↓
Update status → READY
```

**On failure**

* status → FAILED
* errorMessage populated

---

## 6. Queue Specification (BullMQ)

### 6.1 Queue Name

```
hls-transcoding
```

---

### 6.2 Job Payload

```ts
interface HlsJobPayload {
  mediaFileId: string
  originalPath: string
}
```

---

### 6.3 Retry Policy

| Parameter        | Value       |
| ---------------- | ----------- |
| attempts         | 3           |
| backoff          | exponential |
| removeOnComplete | true        |

---

## 7. Worker Responsibilities

### hls.worker.ts

**Must**

* Be stateless
* Never accept HTTP
* Handle only one job type

**Steps**

1. Validate MediaFile exists
2. Lock via status change
3. Execute FFmpeg
4. Persist result
5. Exit cleanly

---

## 8. HLS Service Specification

### hls.service.ts

**Responsibilities**

* Build FFmpeg command
* Create directories
* Validate outputs
* Return manifest path

**FFmpeg Constraints**

* HLS v3+
* Independent segments
* Multiple renditions

---

## 9. API Contracts

### 9.1 Upload Endpoint

```
POST /media/upload
Content-Type: multipart/form-data
```

**Response**

```json
{
  "mediaFileId": "uuid",
  "status": "UPLOADED"
}
```

---

### 9.2 MediaFile Status Endpoint

```
GET /media-files/:id
```

```json
{
  "id": "uuid",
  "status": "READY",
  "manifestUrl": "/stream/hls/uuid/master.m3u8"
}
```

---

## 10. Streaming Access

**Protocol**

* HLS (HTTP)

**Consumers**

* VLC
* Browser (HLS.js)
* Mobile apps

---

## 11. State Machine

```text
UPLOADED → PROCESSING → READY
                ↓
              FAILED
```

State transitions are **worker-only**.

---

## 12. Non-Functional Requirements

* Upload must support files > 20GB
* Worker must be horizontally scalable
* MediaFile updates must be idempotent
* No blocking operations in HTTP layer

---

## 13. Future Extensions (Explicitly Deferred)

* Subtitles
* Multiple audio tracks
* DASH
* DRM
* GPU FFmpeg
* CDN offloading

---

## 14. Summary

This system:

* Uses `MediaFile` as a unified abstraction
* Decouples upload from processing
* Uses BullMQ for reliability
* Stores media on disk, metadata in DB
* Produces deterministic, debuggable HLS output
