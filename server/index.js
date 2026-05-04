// VideoFetch backend — wraps yt-dlp for YouTube video downloads.
// Run with: npm run dev:server  (auto-runs via `npm run dev`)

import express from 'express';
import cors from 'cors';
import youtubedl from 'youtube-dl-exec';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'videofetch-backend' });
});

// Get available formats for a video
app.get('/api/formats', async (req, res) => {
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing ?url=' });
  }

  try {
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
    });

    const formats = (info.formats || [])
      .filter((f) => f.vcodec !== 'none' && f.acodec !== 'none' && f.ext === 'mp4')
      .map((f) => ({
        format_id: f.format_id,
        ext: f.ext,
        height: f.height,
        width: f.width,
        filesize: f.filesize || f.filesize_approx,
        vcodec: f.vcodec,
        acodec: f.acodec,
        tbr: f.tbr,
        format_note: f.format_note,
      }));

    res.json({
      title: info.title,
      duration: info.duration,
      thumbnail: info.thumbnail,
      formats,
    });
  } catch (err) {
    console.error('formats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch video formats', details: err.message });
  }
});

// Stream the actual video file to the browser
app.get('/api/download', async (req, res) => {
  const { url, quality = '720' } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing ?url=' });
  }

  // Build a yt-dlp format selector that prefers MP4 + AAC
  // bv*[height<=Q][ext=mp4]+ba[ext=m4a] / b[height<=Q][ext=mp4]
  const heightCap = String(quality).replace('p', '');
  const formatSelector =
    `bv*[height<=${heightCap}][ext=mp4]+ba[ext=m4a]/` +
    `b[height<=${heightCap}][ext=mp4]/` +
    `best[height<=${heightCap}]`;

  try {
    // First, peek the title for a nice filename
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      skipDownload: true,
    });
    const safeTitle = (info.title || 'video').replace(/[\\/:*?"<>|]/g, '_').slice(0, 100);
    const filename = `${safeTitle}-${heightCap}p.mp4`;

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Spawn yt-dlp and pipe its stdout (the merged MP4) directly to the response
    const ytdlpProcess = youtubedl.exec(
      url,
      {
        format: formatSelector,
        output: '-', // stdout
        noWarnings: true,
        noCallHome: true,
        // Force a single MP4 file in stdout
        mergeOutputFormat: 'mp4',
      },
      { stdio: ['ignore', 'pipe', 'pipe'] }
    );

    ytdlpProcess.stdout.pipe(res);

    ytdlpProcess.stderr.on('data', (chunk) => {
      // yt-dlp logs progress to stderr — useful for debugging
      const line = chunk.toString();
      if (line.includes('ERROR')) {
        console.error('[yt-dlp]', line.trim());
      }
    });

    ytdlpProcess.on('error', (err) => {
      console.error('yt-dlp spawn error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'yt-dlp failed', details: err.message });
      } else {
        res.end();
      }
    });

    ytdlpProcess.on('exit', (code) => {
      if (code !== 0) {
        console.error(`yt-dlp exited with code ${code}`);
      }
    });

    // If client disconnects, kill the yt-dlp process
    req.on('close', () => {
      if (!ytdlpProcess.killed) {
        ytdlpProcess.kill('SIGKILL');
      }
    });
  } catch (err) {
    console.error('download error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to start download', details: err.message });
    }
  }
});

app.listen(PORT, () => {
  console.log(`\n🎬 VideoFetch backend running on http://localhost:${PORT}`);
  console.log(`   Health:    http://localhost:${PORT}/api/health`);
  console.log(`   Formats:   http://localhost:${PORT}/api/formats?url=...`);
  console.log(`   Download:  http://localhost:${PORT}/api/download?url=...&quality=720\n`);
});
