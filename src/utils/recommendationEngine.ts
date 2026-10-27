import {
  VideoItem,
  VideoItemWithScore,
  RecommendationBreakdown,
  UserEngagementProfile,
  AlgorithmConfig,
  AlgorithmMode,
} from '../types/video';

const PROFILE_STORAGE_KEY = 'tokstudio_user_engagement_profile_v2';
const CONFIG_STORAGE_KEY = 'tokstudio_algorithm_config_v2';

export const DEFAULT_ALGORITHM_CONFIG: AlgorithmConfig = {
  mode: 'balanced',
  popularityWeight: 0.3,
  personalizationWeight: 0.4,
  freshnessWeight: 0.15,
  completionWeight: 0.15,
  explorationRate: 0.15,
};

export const ALGORITHM_PRESETS: Record<AlgorithmMode, AlgorithmConfig> = {
  balanced: {
    mode: 'balanced',
    popularityWeight: 0.3,
    personalizationWeight: 0.4,
    freshnessWeight: 0.15,
    completionWeight: 0.15,
    explorationRate: 0.15,
  },
  viral_trending: {
    mode: 'viral_trending',
    popularityWeight: 0.6,
    personalizationWeight: 0.2,
    freshnessWeight: 0.1,
    completionWeight: 0.1,
    explorationRate: 0.1,
  },
  deep_personalized: {
    mode: 'deep_personalized',
    popularityWeight: 0.15,
    personalizationWeight: 0.6,
    freshnessWeight: 0.1,
    completionWeight: 0.15,
    explorationRate: 0.05,
  },
  fresh_explore: {
    mode: 'fresh_explore',
    popularityWeight: 0.15,
    personalizationWeight: 0.25,
    freshnessWeight: 0.4,
    completionWeight: 0.1,
    explorationRate: 0.35,
  },
};

const DEFAULT_PROFILE: UserEngagementProfile = {
  hashtagWeights: {
    tokstudio: 8,
    cinematic: 5,
    producer: 4,
    coding: 4,
  },
  creatorWeights: {},
  soundWeights: {},
  watchHistory: {},
  likedVideoIds: ['vid-2'],
  sharedVideoIds: [],
  commentedVideoIds: [],
  savedVideoIds: ['vid-3'],
  followedCreatorIds: ['user-maya'],
  totalClipsWatched: 4,
  averageCompletionRate: 0.82,
};

class RecommendationEngine {
  private profile: UserEngagementProfile;
  private config: AlgorithmConfig;

  constructor() {
    this.profile = this.loadProfile();
    this.config = this.loadConfig();
  }

  private loadProfile(): UserEngagementProfile {
    try {
      const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (err) {
      console.warn('Could not load user profile', err);
    }
    return { ...DEFAULT_PROFILE };
  }

  private saveProfile() {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(this.profile));
    } catch {
      // ignore
    }
  }

  private loadConfig(): AlgorithmConfig {
    try {
      const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return { ...DEFAULT_ALGORITHM_CONFIG };
  }

  public saveConfig(config: AlgorithmConfig) {
    this.config = config;
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch {
      // ignore
    }
  }

  public getConfig(): AlgorithmConfig {
    return { ...this.config };
  }

  public getProfile(): UserEngagementProfile {
    return { ...this.profile };
  }

  public resetProfile() {
    this.profile = { ...DEFAULT_PROFILE };
    this.saveProfile();
  }

  /**
   * Record real-time user watch duration, completion, and loops for a clip
   */
  public recordWatchEvent(
    videoId: string,
    watchSeconds: number,
    clipDuration: number,
    loopCount: number = 0
  ) {
    if (clipDuration <= 0) return;
    const completionRate = Math.min(3, watchSeconds / clipDuration);
    const isSkipped = watchSeconds < 1.5 && completionRate < 0.2;

    const existing = this.profile.watchHistory[videoId] || {
      totalSecondsWatched: 0,
      maxCompletionRate: 0,
      loopCount: 0,
      isSkipped: false,
      timestamp: Date.now(),
    };

    const newCompletionRate = Math.max(existing.maxCompletionRate, completionRate);
    const newLoops = Math.max(existing.loopCount, loopCount);

    this.profile.watchHistory[videoId] = {
      totalSecondsWatched: existing.totalSecondsWatched + watchSeconds,
      maxCompletionRate: newCompletionRate,
      loopCount: newLoops,
      isSkipped,
      timestamp: Date.now(),
    };

    this.profile.totalClipsWatched += 1;
    // Update running average completion rate
    this.profile.averageCompletionRate =
      this.profile.averageCompletionRate * 0.9 + Math.min(1, newCompletionRate) * 0.1;

    this.saveProfile();
  }

  /**
   * Track high-intent interaction (like, comment, share, save, follow)
   */
  public recordInteraction(
    type: 'like' | 'unlike' | 'share' | 'comment' | 'save' | 'unsave' | 'follow' | 'unfollow',
    video: VideoItem
  ) {
    const videoId = video.id;
    const creatorId = video.creator.id;

    switch (type) {
      case 'like':
        if (!this.profile.likedVideoIds.includes(videoId)) {
          this.profile.likedVideoIds.push(videoId);
        }
        this.boostInterests(video, 6, 8, 3);
        break;
      case 'unlike':
        this.profile.likedVideoIds = this.profile.likedVideoIds.filter((id) => id !== videoId);
        this.boostInterests(video, -4, -5, -2);
        break;
      case 'share':
        if (!this.profile.sharedVideoIds.includes(videoId)) {
          this.profile.sharedVideoIds.push(videoId);
        }
        // Shares are the highest multiplier on TikTok
        this.boostInterests(video, 12, 15, 6);
        break;
      case 'comment':
        if (!this.profile.commentedVideoIds.includes(videoId)) {
          this.profile.commentedVideoIds.push(videoId);
        }
        this.boostInterests(video, 8, 10, 4);
        break;
      case 'save':
        if (!this.profile.savedVideoIds.includes(videoId)) {
          this.profile.savedVideoIds.push(videoId);
        }
        this.boostInterests(video, 9, 12, 5);
        break;
      case 'unsave':
        this.profile.savedVideoIds = this.profile.savedVideoIds.filter((id) => id !== videoId);
        break;
      case 'follow':
        if (!this.profile.followedCreatorIds.includes(creatorId)) {
          this.profile.followedCreatorIds.push(creatorId);
        }
        this.profile.creatorWeights[creatorId] =
          (this.profile.creatorWeights[creatorId] || 0) + 25;
        break;
      case 'unfollow':
        this.profile.followedCreatorIds = this.profile.followedCreatorIds.filter(
          (id) => id !== creatorId
        );
        this.profile.creatorWeights[creatorId] = Math.max(
          0,
          (this.profile.creatorWeights[creatorId] || 0) - 15
        );
        break;
    }

    this.saveProfile();
  }

  private boostInterests(
    video: VideoItem,
    hashtagDelta: number,
    creatorDelta: number,
    soundDelta: number
  ) {
    video.hashtags.forEach((tag) => {
      const clean = tag.toLowerCase().replace('#', '');
      this.profile.hashtagWeights[clean] = Math.max(
        0,
        (this.profile.hashtagWeights[clean] || 0) + hashtagDelta
      );
    });

    const creatorId = video.creator.id;
    this.profile.creatorWeights[creatorId] = Math.max(
      0,
      (this.profile.creatorWeights[creatorId] || 0) + creatorDelta
    );

    const soundId = video.sound?.id;
    if (soundId) {
      this.profile.soundWeights[soundId] = Math.max(
        0,
        (this.profile.soundWeights[soundId] || 0) + soundDelta
      );
    }
  }

  /**
   * Core algorithm: Computes multi-factor score and explanation breakdown for a video
   */
  public scoreVideo(video: VideoItem): RecommendationBreakdown {
    const reasons: string[] = [];
    const cfg = this.config;

    // 1. Popularity & Engagement Velocity Score (0 - 100)
    // Formula: (likes * 1 + comments * 3.5 + shares * 5 + saves * 3) / views ratio
    const totalViews = Math.max(video.stats.views, 100);
    const engagementUnits =
      video.stats.likes * 1.0 +
      video.stats.comments * 3.5 +
      video.stats.shares * 5.0 +
      video.stats.saves * 3.0;

    const engagementRate = (engagementUnits / totalViews) * 100;
    // Scale typical rate (5% to 30%) to 0 - 100
    const rawPopScore = Math.min(100, engagementRate * 4.2);
    const popularityScore = Math.round(rawPopScore);

    if (popularityScore > 75) {
      reasons.push('High viral share velocity & save rate');
    } else if (popularityScore > 50) {
      reasons.push('Popular in community');
    }

    // 2. Personalization & Topic Affinity Score (0 - 100)
    let topicPoints = 0;
    let matchedTag: string | null = null;
    let maxTagWeight = 0;

    video.hashtags.forEach((tag) => {
      const clean = tag.toLowerCase().replace('#', '');
      const weight = this.profile.hashtagWeights[clean] || 0;
      if (weight > 0) {
        topicPoints += weight * 4.5;
        if (weight > maxTagWeight) {
          maxTagWeight = weight;
          matchedTag = clean;
        }
      }
    });

    const topicAffinity = Math.min(60, Math.round(topicPoints));
    if (matchedTag) {
      reasons.push(`Matches your interest in #${matchedTag}`);
    }

    // Creator affinity
    let creatorPoints = 0;
    const isFollowed =
      video.creator.isFollowing || this.profile.followedCreatorIds.includes(video.creator.id);
    if (isFollowed) {
      creatorPoints += 30;
      reasons.push(`You follow @${video.creator.username}`);
    }
    const cWeight = this.profile.creatorWeights[video.creator.id] || 0;
    creatorPoints += Math.min(25, cWeight * 2);
    const creatorAffinity = Math.min(45, Math.round(creatorPoints));

    const personalizationScore = Math.min(100, topicAffinity + creatorAffinity);

    // 3. Watch Time & Loop Retention Score (0 - 100)
    let watchTimeScore = 30; // base prior
    const history = this.profile.watchHistory[video.id];
    if (history) {
      if (history.loopCount >= 1) {
        watchTimeScore = 95;
        reasons.push('You replayed this clip multiple times');
      } else if (history.maxCompletionRate >= 0.85) {
        watchTimeScore = 80;
        reasons.push('High completion rate in previous watch');
      } else if (history.isSkipped) {
        watchTimeScore = 10;
        reasons.push('Previously skipped quickly');
      }
    } else {
      // Prior based on average completion of similar topics
      if (topicAffinity > 20) {
        watchTimeScore = 65;
        reasons.push('Predicted high watch duration');
      }
    }

    // 4. Freshness & Recency Score (0 - 100)
    const hoursOld = Math.max(0, (Date.now() - video.createdAt) / 3600000);
    // Exponential half-life decay (36 hours)
    let freshnessScore = Math.round(100 * Math.exp(-0.02 * hoursOld));

    // Brand new user-created clip gets cold-start incubation boost
    if (video.isUserCreated) {
      freshnessScore = 100;
      reasons.push('New user original clip');
    } else if (hoursOld < 6) {
      reasons.push('Fresh upload in the last 6 hours');
    }

    // 5. Diversity / Exploration Bonus (0 - 25)
    // Injects freshness to prevent recommendation rut
    let diversityBonus = 0;
    const hasBeenWatched = !!this.profile.watchHistory[video.id];
    if (!hasBeenWatched) {
      diversityBonus = Math.round(cfg.explorationRate * 35);
      if (diversityBonus > 5 && reasons.length < 2) {
        reasons.push('Exploration candidate for discovery');
      }
    }

    // Compute Weighted Total Score
    const weightedTotal =
      popularityScore * cfg.popularityWeight +
      personalizationScore * cfg.personalizationWeight +
      watchTimeScore * cfg.completionWeight +
      freshnessScore * cfg.freshnessWeight +
      diversityBonus;

    const totalScore = Math.round(weightedTotal);

    if (reasons.length === 0) {
      reasons.push('Trending on TokStudio');
    }

    return {
      totalScore,
      popularityScore,
      personalizationScore,
      watchTimeAffinity: watchTimeScore,
      topicAffinity,
      creatorAffinity,
      freshnessScore,
      diversityBonus,
      reasons: reasons.slice(0, 3),
    };
  }

  /**
   * Re-ranks and sorts a feed of videos using the scoring model and diversity rules
   */
  public rankFeed(videos: VideoItem[]): VideoItemWithScore[] {
    // 1. Compute scores for all candidate clips
    const scored: VideoItemWithScore[] = videos.map((v) => ({
      ...v,
      recommendationBreakdown: this.scoreVideo(v),
    }));

    // 2. Sort by total algorithmic score descending
    scored.sort(
      (a, b) =>
        (b.recommendationBreakdown?.totalScore || 0) -
        (a.recommendationBreakdown?.totalScore || 0)
    );

    // 3. Apply Diversity & Spacing Filter:
    // Avoid showing the exact same creator in consecutive slots
    const finalFeed: VideoItemWithScore[] = [];
    const pool = [...scored];

    while (pool.length > 0) {
      const lastCreator = finalFeed.length > 0 ? finalFeed[finalFeed.length - 1].creator.id : null;
      let pickIdx = pool.findIndex((item) => item.creator.id !== lastCreator);
      if (pickIdx === -1) {
        pickIdx = 0; // Fallback if only one creator remains
      }
      finalFeed.push(pool.splice(pickIdx, 1)[0]);
    }

    return finalFeed;
  }
}

export const recommendationEngine = new RecommendationEngine();
