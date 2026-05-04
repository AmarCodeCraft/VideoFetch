// Cross-platform install helper that skips the Python preinstall check
// in youtube-dl-exec (the yt-dlp binary is self-contained, so the check
// is unnecessary on systems without Python).
//
// Run: node setup.js
//   or: npm run setup

import { spawnSync } from 'node:child_process';

console.log('🔧 Installing server dependencies (skipping Python check)...\n');

const result = spawnSync('npm', ['install'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    YOUTUBE_DL_SKIP_PYTHON_CHECK: '1',
  },
});

if (result.status !== 0) {
  console.error('\n❌ Install failed');
  process.exit(result.status || 1);
}

console.log('\n✅ Server deps installed successfully');
