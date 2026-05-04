import { saveAs } from 'file-saver';

export async function downloadThumbnail(url: string, quality: 'default' | 'medium' | 'high') {
  const filename = `thumbnail-${quality}.jpg`;

  // Method 1: Try fetch + blob (works if CORS allows it)
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (response.ok) {
      const blob = await response.blob();
      saveAs(blob, filename);
      return;
    }
  } catch {
    // CORS blocked — fall through to method 2
  }

  // Method 2: Open in new tab so user can right-click > Save Image
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function getVideoDownloadUrl(videoId: string, quality: '1080p' | '720p' | '480p' | '360p'): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Check if the yt-dlp backend is reachable.
 */
export async function isBackendOnline(): Promise<boolean> {
  try {
    const res = await fetch('/api/health', { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Download a YouTube video via the backend yt-dlp server.
 * Streams the MP4 bytes from the server, builds a Blob, and saves to disk.
 * Reports progress (bytes downloaded) via the optional onProgress callback.
 */
export async function downloadVideoViaBackend(
  videoId: string,
  quality: '1080p' | '720p' | '480p' | '360p',
  onProgress?: (loadedBytes: number) => void,
  signal?: AbortSignal
): Promise<void> {
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const heightCap = quality.replace('p', '');
  const endpoint = `/api/download?url=${encodeURIComponent(youtubeUrl)}&quality=${heightCap}`;

  const res = await fetch(endpoint, { signal });

  if (!res.ok) {
    let message = `Server responded ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch { /* not JSON */ }
    throw new Error(message);
  }

  if (!res.body) {
    throw new Error('Empty response from server');
  }

  // Try to extract filename from Content-Disposition
  let filename = `video-${videoId}-${quality}.mp4`;
  const cd = res.headers.get('Content-Disposition');
  const match = cd && /filename="?([^"]+)"?/i.exec(cd);
  if (match) filename = match[1];

  // Stream the body, accumulating into chunks for the Blob
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      received += value.byteLength;
      onProgress?.(received);
    }
  }

  const blob = new Blob(chunks as BlobPart[], { type: 'video/mp4' });
  saveAs(blob, filename);
}