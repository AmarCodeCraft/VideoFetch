import { useState, useEffect, useCallback } from 'react';
import {
  addOfflineVideo,
  deleteOfflineVideo,
  clearOfflineVideos,
  listOfflineVideos,
  getOfflineVideo,
  generateThumbnail,
  getStorageEstimate,
  OfflineVideoMeta,
} from '../utils/offlineDB';

export function useOfflineVideos() {
  const [videos, setVideos] = useState<OfflineVideoMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [storage, setStorage] = useState<{ usage: number; quota: number } | null>(null);

  const refresh = useCallback(async () => {
    try {
      const list = await listOfflineVideos();
      setVideos(list);
      const est = await getStorageEstimate();
      setStorage(est);
    } catch (err) {
      console.error('Failed to load offline videos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addVideo = useCallback(async (file: File) => {
    if (!file.type.startsWith('video/')) {
      throw new Error('Selected file is not a video');
    }

    const { thumbnail, duration } = await generateThumbnail(file).catch(() => ({
      thumbnail: '',
      duration: 0,
    }));

    const id = `vid_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    await addOfflineVideo({
      id,
      name: file.name,
      size: file.size,
      type: file.type,
      blob: file,
      thumbnail,
      duration,
      addedAt: Date.now(),
    });

    await refresh();
    return id;
  }, [refresh]);

  const removeVideo = useCallback(async (id: string) => {
    await deleteOfflineVideo(id);
    await refresh();
  }, [refresh]);

  const clearAll = useCallback(async () => {
    await clearOfflineVideos();
    await refresh();
  }, [refresh]);

  // Returns a blob URL for playback. Caller is responsible for revoking.
  const getPlaybackUrl = useCallback(async (id: string): Promise<string | null> => {
    const record = await getOfflineVideo(id);
    if (!record) return null;
    return URL.createObjectURL(record.blob);
  }, []);

  return {
    videos,
    loading,
    storage,
    addVideo,
    removeVideo,
    clearAll,
    getPlaybackUrl,
    refresh,
  };
}
