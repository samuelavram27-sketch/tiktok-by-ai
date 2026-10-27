export interface Creator {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  isFollowing: boolean;
  verified?: boolean;
  bio?: string;
}

export interface SoundTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  bpm: number;
  genre: string;
  coverArt?: string;
  synthesizeNotes: string[];
}

export interface TextOverlay {
  id: string;
  text: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  color: string;
  hasBackground: boolean;
  style: 'classic' | 'neon' | 'typewriter' | 'marker';
  size: 'sm' | 'md' | 'lg' | 'xl';
}

export interface StickerOverlay {
  id: string;
  emoji: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  scale: number;
}

export interface FilterSettings {
  preset: string; // 'none' | 'warm' | 'noir' | 'cyber' | 'golden' | 'vivid' | 'retro'
  brightness: number; // 0.5 to 1.5, default 1
  contrast: number; // 0.5 to 1.5, default 1
  saturation: number; // 0 to 2, default 1
  blur: number; // 0 to 5px, default 0
  sepia: number; // 0 to 1, default 0
}

export interface VideoItem {
  id: string;
  mediaType?: 'video' | 'image';
  videoUrl?: string;
  imageUrl?: string;
  coverUrl?: string;
  caption: string;
  hashtags: string[];
  creator: Creator;
  stats: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    views: number;
  };
  isLiked?: boolean;
  isSaved?: boolean;
  sound: SoundTrack;
  filterSettings?: FilterSettings;
  textOverlays?: TextOverlay[];
  stickers?: StickerOverlay[];
  speed?: number;
  trimStart?: number;
  trimEnd?: number;
  createdAt: number;
  isUserCreated?: boolean;
}

export interface CommentItem {
  id: string;
  videoId: string;
  creator: {
    name: string;
    username: string;
    avatarUrl: string;
    verified?: boolean;
  };
  text: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
  replies?: CommentItem[];
}

export interface RecommendationBreakdown {
  totalScore: number;
  popularityScore: number;
  personalizationScore: number;
  watchTimeAffinity: number;
  topicAffinity: number;
  creatorAffinity: number;
  freshnessScore: number;
  diversityBonus: number;
  reasons: string[];
}

export interface VideoItemWithScore extends VideoItem {
  recommendationBreakdown?: RecommendationBreakdown;
}

export interface UserEngagementProfile {
  hashtagWeights: Record<string, number>;
  creatorWeights: Record<string, number>;
  soundWeights: Record<string, number>;
  watchHistory: Record<
    string,
    {
      totalSecondsWatched: number;
      maxCompletionRate: number;
      loopCount: number;
      isSkipped: boolean;
      timestamp: number;
    }
  >;
  likedVideoIds: string[];
  sharedVideoIds: string[];
  commentedVideoIds: string[];
  savedVideoIds: string[];
  followedCreatorIds: string[];
  totalClipsWatched: number;
  averageCompletionRate: number;
}

export type AlgorithmMode = 'balanced' | 'viral_trending' | 'deep_personalized' | 'fresh_explore';

export interface AlgorithmConfig {
  mode: AlgorithmMode;
  popularityWeight: number; // 0 to 1
  personalizationWeight: number; // 0 to 1
  freshnessWeight: number; // 0 to 1
  completionWeight: number; // 0 to 1
  explorationRate: number; // 0 to 1
}

