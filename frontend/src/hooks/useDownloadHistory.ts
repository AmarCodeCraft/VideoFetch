import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'videofetch_downloads';

export interface DownloadRecord {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  quality: string;
  size: number;
  filename: string;
  downloadedAt: number;
}

function readStorage(): DownloadRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(records: DownloadRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save download history:', err);
  }
}

export function useDownloadHistory() {
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);

  useEffect(() => {
    setDownloads(readStorage());

    // Sync across tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setDownloads(readStorage());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addDownload = useCallback((record: DownloadRecord) => {
    setDownloads((prev) => {
      const next = [record, ...prev.filter((d) => !(d.videoId === record.videoId && d.quality === record.quality))].slice(0, 50);
      writeStorage(next);
      return next;
    });
  }, []);

  const removeDownload = useCallback((videoId: string, quality: string) => {
    setDownloads((prev) => {
      const next = prev.filter((d) => !(d.videoId === videoId && d.quality === quality));
      writeStorage(next);
      return next;
    });
  }, []);

  const clearDownloads = useCallback(() => {
    setDownloads([]);
    writeStorage([]);
  }, []);

  return { downloads, addDownload, removeDownload, clearDownloads };
}
