import { PlaylistItem } from '../types';

export const SAMPLE_SUBTITLES_SRT = `1
00:00:01,500 --> 00:00:04,200
TRID Media Player - Hardware Accelerated Playback Engine

2
00:00:04,800 --> 00:00:08,100
Testing subtitle synchronization and timing offset controls.

3
00:00:08,600 --> 00:00:12,400
Use hotkeys [G] and [H] to shift subtitle delay in real-time.

4
00:00:13,000 --> 00:00:17,200
Audio equalizer with 10 frequency bands and up to 200% volume boost.

5
00:00:17,800 --> 00:00:22,500
Adjust video brightness, contrast, hue, and custom aspect ratios.

6
00:00:23,200 --> 00:00:28,000
Enjoy smooth playback of local files and HLS network streams!
`;

export const SAMPLE_PLAYLIST: PlaylistItem[] = [
  {
    id: 'sample-bbb',
    title: 'Big Buck Bunny (Animation 720p)',
    src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.720p.vp9.webm',
    type: 'video',
    format: 'WebM / 720p',
    duration: 596,
    author: 'Blender Foundation',
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&q=80',
    subtitleLabel: 'English (Synced Demo)',
  },
  {
    id: 'sample-tos',
    title: 'Tears of Steel (Sci-Fi 480p)',
    src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/cb/Tears_of_Steel_1080p.webm/Tears_of_Steel_1080p.webm.480p.vp9.webm',
    type: 'video',
    format: 'WebM / 480p',
    duration: 734,
    author: 'Mango Open Movie Project',
    thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80',
    subtitleLabel: 'English (Default)',
  },
  {
    id: 'sample-sintel',
    title: 'Sintel - The Animated Short Film',
    src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/f/f1/Sintel_movie_4K.webm/Sintel_movie_4K.webm.480p.vp9.webm',
    type: 'video',
    format: 'WebM / 480p',
    duration: 888,
    author: 'Durian Open Movie Project',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
  },
  {
    id: 'sample-hls-stream',
    title: 'HLS Live Network Stream (Adaptive Bitrate)',
    src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    type: 'stream',
    format: 'HLS (.m3u8)',
    isLive: true,
    author: 'Mux Big Buck Bunny HLS',
    thumbnail: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&q=80',
  },
  {
    id: 'sample-akamai-stream',
    title: 'Tears of Steel (Akamai HLS Live Stream)',
    src: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
    type: 'stream',
    format: 'HLS (.m3u8)',
    isLive: true,
    author: 'Akamai Live Test Stream',
    thumbnail: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=400&q=80',
  },
  {
    id: 'sample-flower-mp4',
    title: 'Blooming Flowers (Nature Clip)',
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    type: 'video',
    format: 'MP4 / H.264',
    duration: 5,
    author: 'MDN CC0 Media',
    thumbnail: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&q=80',
  },
  {
    id: 'sample-lofi-audio',
    title: 'Chill Lo-Fi Hip Hop Beats',
    src: 'https://commondatastorage.googleapis.com/codeskulptor-demos/riceracer_assets/music/race1.ogg',
    type: 'audio',
    format: 'OGG / Vorbis',
    duration: 138,
    author: 'TRID Audio Chill Room',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
  },
];
