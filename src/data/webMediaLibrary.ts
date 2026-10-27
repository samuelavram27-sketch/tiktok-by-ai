export interface WebMediaItem {
  id: string;
  type: 'video' | 'image';
  title: string;
  source: string; // e.g. "Google Open Media", "Pexels Creative", "Wikimedia Public", "Google Cloud Storage"
  url: string;
  thumbnail: string;
  duration?: number;
  category: string;
  tags: string[];
}

export const WEB_MEDIA_LIBRARY: WebMediaItem[] = [
  // --- VIDEOS ---
  {
    id: 'web-vid-1',
    type: 'video',
    title: 'Neon Tokyo Night Drive',
    source: 'Google Video Cache',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: '/src/assets/images/photo_post_tokyo_sunset_1793111322605.jpg',
    duration: 15,
    category: 'city',
    tags: ['tokyo', 'neon', 'night', 'city', 'drive', 'cyberpunk', 'aesthetic'],
  },
  {
    id: 'web-vid-2',
    type: 'video',
    title: 'Extreme Skateboarding Park Run',
    source: 'Google Media Sample',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: '/src/assets/images/photo_post_streetwear_fit_1793111322576.jpg',
    duration: 15,
    category: 'skate',
    tags: ['skate', 'action', 'kickflip', 'park', 'extreme', 'tricks', 'urban'],
  },
  {
    id: 'web-vid-3',
    type: 'video',
    title: 'Analog Synth Sound Lab',
    source: 'Creative Audio Loop',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnail: '/src/assets/images/photo_post_cozy_setup_1793111323244.jpg',
    duration: 15,
    category: 'music',
    tags: ['music', 'synth', 'studio', 'beats', 'producer', 'creative'],
  },
  {
    id: 'web-vid-4',
    type: 'video',
    title: 'High Speed Bullrun Roadtrip',
    source: 'Google Media Bucket',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    thumbnail: '/src/assets/images/photo_post_tokyo_sunset_1793111322605.jpg',
    duration: 20,
    category: 'travel',
    tags: ['travel', 'car', 'sunset', 'speed', 'cinematic', 'nature'],
  },
  {
    id: 'web-vid-5',
    type: 'video',
    title: 'Cyberpunk VFX Sci-Fi Demo',
    source: 'Blender Foundation Public',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnail: '/src/assets/images/photo_post_cozy_setup_1793111323244.jpg',
    duration: 12,
    category: 'tech',
    tags: ['tech', 'coding', 'vfx', 'scifi', 'developer', 'algorithm', 'tokstudio'],
  },
  {
    id: 'web-vid-6',
    type: 'video',
    title: 'Artisan Food Cooking Melt',
    source: 'Google Sample Vault',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnail: '/src/assets/images/photo_post_matcha_cafe_1793111323203.jpg',
    duration: 15,
    category: 'food',
    tags: ['food', 'cooking', 'recipe', 'chef', 'pasta', 'delicious'],
  },

  // --- PHOTOS ---
  {
    id: 'web-img-1',
    type: 'image',
    title: 'Tokyo Sunset Skyline',
    source: 'Google Image Index',
    url: '/src/assets/images/photo_post_tokyo_sunset_1793111322605.jpg',
    thumbnail: '/src/assets/images/photo_post_tokyo_sunset_1793111322605.jpg',
    category: 'city',
    tags: ['tokyo', 'sunset', 'skyline', 'japan', 'city', 'clouds', 'dusk'],
  },
  {
    id: 'web-img-2',
    type: 'image',
    title: 'Brutalist Streetwear Fit',
    source: 'Fashion Editorial Index',
    url: '/src/assets/images/photo_post_streetwear_fit_1793111322576.jpg',
    thumbnail: '/src/assets/images/photo_post_streetwear_fit_1793111322576.jpg',
    category: 'fashion',
    tags: ['fashion', 'streetwear', 'ootd', 'sneakers', 'style', 'urban', 'black'],
  },
  {
    id: 'web-img-3',
    type: 'image',
    title: 'Ceremonial Matcha & Pastry',
    source: 'Cafe Culture Index',
    url: '/src/assets/images/photo_post_matcha_cafe_1793111323203.jpg',
    thumbnail: '/src/assets/images/photo_post_matcha_cafe_1793111323203.jpg',
    category: 'food',
    tags: ['matcha', 'cafe', 'latte', 'croissant', 'coffee', 'breakfast', 'aesthetic'],
  },
  {
    id: 'web-img-4',
    type: 'image',
    title: 'Cozy Dusk Creator Desk',
    source: 'Studio Setup Gallery',
    url: '/src/assets/images/photo_post_cozy_setup_1793111323244.jpg',
    thumbnail: '/src/assets/images/photo_post_cozy_setup_1793111323244.jpg',
    category: 'tech',
    tags: ['setup', 'desk', 'workspace', 'keyboard', 'camera', 'cozy', 'minimalist'],
  },
];
