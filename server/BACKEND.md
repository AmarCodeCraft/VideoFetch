# yt-dlp Backend Setup

VideoFetch now includes a small Express backend that wraps **yt-dlp** to download YouTube videos as real MP4 files.

## Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────┐
│  React (Vite)    │────▶│  Express Backend │────▶│  yt-dlp  │
│  localhost:5173  │     │  localhost:3001  │     │  binary  │
└──────────────────┘     └──────────────────┘     └──────────┘
        │                         ▲
        │   /api/* (Vite proxy)   │
        └─────────────────────────┘
```

## Repo Layout

```
VideoFetch/
├── package.json        ← root orchestration (concurrently)
├── frontend/           ← React + Vite app
│   ├── package.json
│   └── src/
└── server/             ← Express + yt-dlp backend
    ├── package.json
    └── index.js
```

## One-Time Install

From the **repo root**:

```bash
npm run install:all
```

This runs `npm install` in all three locations (root, frontend, server). On first install the `youtube-dl-exec` package in `server/` auto-downloads the yt-dlp binary.

> The `youtube-dl-exec` package automatically downloads the yt-dlp binary on first install. If you're behind a corporate proxy and the auto-download fails, install yt-dlp manually:
>
> **Windows (PowerShell as admin):**
> ```powershell
> winget install yt-dlp
> ```
>
> **macOS:**
> ```bash
> brew install yt-dlp
> ```

### FFmpeg (recommended)

For best quality (1080p+ which requires merging separate video and audio streams), install **ffmpeg**:

- **Windows:** `winget install Gyan.FFmpeg`
- **macOS:** `brew install ffmpeg`
- **Linux:** `sudo apt install ffmpeg`

Without ffmpeg, downloads fall back to lower quality streams that have audio+video pre-merged (typically max 720p).

## Run

From the **repo root**:

```bash
npm run dev
```

This starts **both** servers in parallel:
- **CLIENT** on http://localhost:5173 (Vite)
- **SERVER** on http://localhost:3001 (Express + yt-dlp)

You'll see colored prefixed output:
```
[CLIENT]  ➜  Local:   http://localhost:5173/
[SERVER]  🎬 VideoFetch backend running on http://localhost:3001
```

To run them separately (from the root):
```bash
npm run dev:client    # frontend only
npm run dev:server    # backend only
```

Or run each from its own folder:
```bash
cd frontend && npm run dev
cd server   && npm run dev
```

## Test the Backend Manually

```bash
# Health check
curl http://localhost:3001/api/health

# List available formats for a video
curl "http://localhost:3001/api/formats?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ"

# Download a video to disk (720p)
curl -o video.mp4 "http://localhost:3001/api/download?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&quality=720"
```

## API Endpoints

### `GET /api/health`
Returns `{ ok: true, service: 'videofetch-backend' }`. Used to detect if the backend is reachable.

### `GET /api/formats?url=<youtube_url>`
Returns metadata + available MP4 formats:
```json
{
  "title": "Video title",
  "duration": 213,
  "thumbnail": "https://i.ytimg.com/...",
  "formats": [
    { "format_id": "22", "ext": "mp4", "height": 720, "filesize": 12345678, ... }
  ]
}
```

### `GET /api/download?url=<youtube_url>&quality=<360|480|720|1080>`
Streams an MP4 file. Sets:
- `Content-Type: video/mp4`
- `Content-Disposition: attachment; filename="<sanitized title>-<quality>p.mp4"`

The browser handles it as a normal file download. The frontend reads the stream chunk-by-chunk to show progress.

## How It's Wired in the Frontend

When you click a quality button (1080p / 720p / 480p / 360p) on a video card:

1. `DownloadOptions.tsx` calls `downloadVideoViaBackend(videoId, quality)` from `src/utils/download.ts`
2. That hits `/api/download?...` (proxied by Vite to `localhost:3001`)
3. The server spawns `yt-dlp` with the right format selector and pipes the MP4 stdout to the response
4. The frontend reads the response stream, accumulates chunks, and saves the final Blob via `file-saver`
5. Live byte-count progress is shown in the toast and an inline status row

The download can be **cancelled** mid-flight via the **Cancel** button — this aborts the fetch and kills the yt-dlp process server-side.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Backend not running` toast | The Express server isn't on port 3001. Run `npm run dev`. |
| `yt-dlp spawn error` in server console | Run `npx youtube-dl-exec --update` or install yt-dlp via winget/brew. |
| 1080p downloads fail or come without audio | Install **ffmpeg** (see above). |
| `ERROR: Sign in to confirm your age` | Some videos require auth. Add `cookies-from-browser: 'chrome'` to the yt-dlp options in `server/index.js`. |
| Downloads are slow | Normal — yt-dlp downloads at YouTube's allowed rate. Try a lower quality. |

## Legal Reminder

Only download videos:
- You own
- Are public domain or CC-licensed
- Have explicit creator permission to download
- Are permitted under your local fair-use laws (e.g. personal copies of public-domain content)

This backend is for personal/educational use. Don't redistribute downloaded copyrighted content.
