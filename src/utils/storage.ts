import { VideoItem, CommentItem, Creator } from '../types/video';
import { INITIAL_VIDEOS } from '../data/mockVideos';

const STORAGE_KEYS = {
  VIDEOS: 'tokstudio_videos_v1',
  LIKED: 'tokstudio_liked_v1',
  SAVED: 'tokstudio_saved_v1',
  FOLLOWING: 'tokstudio_following_v1',
  COMMENTS: 'tokstudio_comments_v1',
  CURRENT_USER: 'tokstudio_current_user_v1',
};

export const CURRENT_USER: Creator = {
  id: 'me',
  name: 'Sam Creates',
  username: 'sam_creativestudio',
  avatarUrl: '/src/assets/images/creator_avatar_alex_1793110430531.jpg',
  isFollowing: false,
  verified: true,
  bio: 'Content creator & visual artist ✨ Creating daily clips on TokStudio 🚀',
};

const DEFAULT_COMMENTS: Record<string, CommentItem[]> = {
  'vid-1': [
    {
      id: 'c-101',
      videoId: 'vid-1',
      creator: {
        name: 'Jordan Miller',
        username: 'jordan_vibe',
        avatarUrl: '/src/assets/images/creator_avatar_liam_1793110432063.jpg',
      },
      text: 'The color grading on this is unreal! What camera lens are you shooting with? 🎥🔥',
      timestamp: '2h ago',
      likes: 420,
    },
    {
      id: 'c-102',
      videoId: 'vid-1',
      creator: {
        name: 'Elena Rostova',
        username: 'elenarost',
        avatarUrl: '/src/assets/images/creator_avatar_maya_1793110432014.jpg',
      },
      text: 'Night city aesthetic is top tier. Need a tutorial on this transition! ✨',
      timestamp: '4h ago',
      likes: 184,
    },
    {
      id: 'c-103',
      videoId: 'vid-1',
      creator: {
        name: 'Devin Cole',
        username: 'devin_runs',
        avatarUrl: '/src/assets/images/creator_avatar_sophia_1793110432586.jpg',
      },
      text: 'Loop is so clean I watched this 5 times already 🔁',
      timestamp: '5h ago',
      likes: 92,
    },
  ],
  'vid-2': [
    {
      id: 'c-201',
      videoId: 'vid-2',
      creator: {
        name: 'Marcus K',
        username: 'synthwave_marcus',
        avatarUrl: '/src/assets/images/creator_avatar_alex_1793110430531.jpg',
      },
      text: 'That bass filter sweep sent chills!! Please put this on streaming platforms! 🎧🙌',
      timestamp: '1h ago',
      likes: 215,
    },
  ],
  'vid-3': [
    {
      id: 'c-301',
      videoId: 'vid-3',
      creator: {
        name: 'Chloe Zhang',
        username: 'chloez_lens',
        avatarUrl: '/src/assets/images/creator_avatar_maya_1793110432014.jpg',
      },
      text: 'Golden hour London is unmatched. Beautiful framing and candid subject! 📸',
      timestamp: '3h ago',
      likes: 78,
    },
  ],
};

export function loadVideos(): VideoItem[] {
  try {
    const custom = localStorage.getItem(STORAGE_KEYS.VIDEOS);
    const customVideos: VideoItem[] = custom ? JSON.parse(custom) : [];
    // Combine custom videos first so user-created clips show at the top of the feed
    return [...customVideos, ...INITIAL_VIDEOS];
  } catch (err) {
    console.error('Failed to load videos from storage', err);
    return INITIAL_VIDEOS;
  }
}

export function saveUserVideo(newVideo: VideoItem) {
  try {
    const custom = localStorage.getItem(STORAGE_KEYS.VIDEOS);
    const customVideos: VideoItem[] = custom ? JSON.parse(custom) : [];
    const updated = [newVideo, ...customVideos];
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save video to localStorage', err);
  }
}

export function deleteUserVideo(videoId: string) {
  try {
    const custom = localStorage.getItem(STORAGE_KEYS.VIDEOS);
    if (!custom) return;
    const customVideos: VideoItem[] = JSON.parse(custom);
    const updated = customVideos.filter((v) => v.id !== videoId);
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete video', err);
  }
}

export function loadComments(videoId: string): CommentItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const stored: Record<string, CommentItem[]> = raw ? JSON.parse(raw) : DEFAULT_COMMENTS;
    return stored[videoId] || DEFAULT_COMMENTS[videoId] || [];
  } catch {
    return DEFAULT_COMMENTS[videoId] || [];
  }
}

export function addComment(videoId: string, text: string): CommentItem {
  const newComment: CommentItem = {
    id: `c-${Date.now()}`,
    videoId,
    creator: {
      name: CURRENT_USER.name,
      username: CURRENT_USER.username,
      avatarUrl: CURRENT_USER.avatarUrl,
      verified: true,
    },
    text,
    timestamp: 'Just now',
    likes: 0,
    isLiked: false,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const stored: Record<string, CommentItem[]> = raw ? JSON.parse(raw) : { ...DEFAULT_COMMENTS };
    const currentList = stored[videoId] || DEFAULT_COMMENTS[videoId] || [];
    stored[videoId] = [newComment, ...currentList];
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(stored));
  } catch (err) {
    console.error('Failed to save comment', err);
  }

  return newComment;
}

export function loadCurrentUser(): Creator {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return CURRENT_USER;
}

export function saveCurrentUser(user: Creator) {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } catch {
    // fallback
  }
}
