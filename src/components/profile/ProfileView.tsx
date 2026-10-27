import React, { useState } from 'react';
import { Video, Heart, Bookmark, Edit3, Plus, Trash2, X, Check } from 'lucide-react';
import { VideoItem, Creator } from '../../types/video';
import { CURRENT_USER, loadCurrentUser, saveCurrentUser, deleteUserVideo } from '../../utils/storage';
import { soundEngine } from '../../utils/audioSynth';
import { getFilterStyleString } from '../../utils/filterStyles';

interface ProfileViewProps {
  videos: VideoItem[];
  onSelectVideo: (videoId: string) => void;
  onOpenRecord: () => void;
  onVideoDeleted: (videoId: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  videos,
  onSelectVideo,
  onOpenRecord,
  onVideoDeleted,
}) => {
  const [currentUser, setCurrentUser] = useState<Creator>(loadCurrentUser());
  const [activeTab, setActiveTab] = useState<'myVideos' | 'liked' | 'saved'>('myVideos');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editBio, setEditBio] = useState(currentUser.bio || '');

  const myVideos = videos.filter((v) => v.isUserCreated || v.creator.id === currentUser.id);
  const likedVideos = videos.filter((v) => v.isLiked);
  const savedVideos = videos.filter((v) => v.isSaved);

  const displayedVideos =
    activeTab === 'myVideos'
      ? myVideos
      : activeTab === 'liked'
      ? likedVideos
      : savedVideos;

  const totalLikes = myVideos.reduce((acc, v) => acc + v.stats.likes, 1280);

  const handleSaveProfile = () => {
    soundEngine.playTone(600, 'triangle', 0.1, 0.1);
    const updated = {
      ...currentUser,
      name: editName.trim() || currentUser.name,
      bio: editBio.trim() || currentUser.bio,
    };
    setCurrentUser(updated);
    saveCurrentUser(updated);
    setIsEditingProfile(false);
  };

  const handleDelete = (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation();
    soundEngine.playTone(320, 'sawtooth', 0.1, 0.1);
    if (confirm('Delete this video clip?')) {
      deleteUserVideo(videoId);
      onVideoDeleted(videoId);
    }
  };

  return (
    <div className="w-full h-full bg-neutral-950 flex flex-col overflow-y-auto no-scrollbar select-none pb-20">
      {/* Profile Header */}
      <div className="p-5 flex flex-col items-center text-center border-b border-neutral-900 bg-neutral-900/40">
        {/* Avatar */}
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-rose-500 to-amber-400 shadow-xl">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-full h-full rounded-full object-cover bg-neutral-800"
            />
          </div>
        </div>

        {/* Name and Handle */}
        <h2 className="text-base font-bold text-white flex items-center gap-1.5">
          <span>{currentUser.name}</span>
          <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white inline-flex items-center justify-center text-[9px] font-bold">
            ✓
          </span>
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5 font-mono">@{currentUser.username}</p>

        {/* Stats Row */}
        <div className="flex items-center gap-6 mt-4 py-2 px-4 bg-neutral-900/80 rounded-2xl border border-neutral-800/80">
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-white font-mono tabular-nums">142</span>
            <span className="text-[11px] text-neutral-400">Following</span>
          </div>
          <div className="w-px h-6 bg-neutral-800" />
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-white font-mono tabular-nums">8.9K</span>
            <span className="text-[11px] text-neutral-400">Followers</span>
          </div>
          <div className="w-px h-6 bg-neutral-800" />
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-white font-mono tabular-nums">
              {(totalLikes / 1000).toFixed(1)}K
            </span>
            <span className="text-[11px] text-neutral-400">Likes</span>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-neutral-300 mt-3 max-w-xs leading-relaxed">
          {currentUser.bio}
        </p>

        {/* Profile Action Buttons */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => {
              soundEngine.playTone(500, 'sine', 0.05, 0.08);
              setIsEditingProfile(true);
            }}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 border border-neutral-700 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Profile
          </button>

          <button
            onClick={onOpenRecord}
            className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-rose-500/25 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Record Clip
          </button>
        </div>
      </div>

      {/* Profile Tabs (My Videos | Liked | Saved) */}
      <div className="grid grid-cols-3 border-b border-neutral-800 bg-neutral-900/60 sticky top-0 z-20">
        <button
          onClick={() => {
            soundEngine.playTone(400, 'sine', 0.04, 0.05);
            setActiveTab('myVideos');
          }}
          className={`py-3 flex flex-col items-center gap-1 transition-colors border-b-2 ${
            activeTab === 'myVideos'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Video className="w-4 h-4" />
          <span className="text-[11px] font-semibold">Videos ({myVideos.length})</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playTone(400, 'sine', 0.04, 0.05);
            setActiveTab('liked');
          }}
          className={`py-3 flex flex-col items-center gap-1 transition-colors border-b-2 ${
            activeTab === 'liked'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span className="text-[11px] font-semibold">Liked ({likedVideos.length})</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playTone(400, 'sine', 0.04, 0.05);
            setActiveTab('saved');
          }}
          className={`py-3 flex flex-col items-center gap-1 transition-colors border-b-2 ${
            activeTab === 'saved'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span className="text-[11px] font-semibold">Saved ({savedVideos.length})</span>
        </button>
      </div>

      {/* Video Content Grid */}
      <div className="p-3">
        {displayedVideos.length === 0 ? (
          <div className="text-center py-16 text-neutral-500 text-xs">
            {activeTab === 'myVideos'
              ? 'You have not posted any clips yet. Tap "Record Clip" to make your first!'
              : activeTab === 'liked'
              ? 'No liked videos yet.'
              : 'No saved bookmarks yet.'}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {displayedVideos.map((video) => {
              const filterStyle = getFilterStyleString(video.filterSettings);
              return (
                <div
                  key={video.id}
                  onClick={() => {
                    soundEngine.playTone(520, 'sine', 0.05, 0.08);
                    onSelectVideo(video.id);
                  }}
                  className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-neutral-900 cursor-pointer border border-neutral-800 hover:border-neutral-700 transition-all shadow-md"
                >
                  {video.mediaType === 'image' ? (
                    <img
                      src={video.imageUrl || video.videoUrl}
                      alt={video.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      style={{ filter: filterStyle }}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <video
                      src={video.videoUrl}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      style={{ filter: filterStyle }}
                      muted
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10 pointer-events-none" />

                  {/* Delete button if user created */}
                  {video.isUserCreated && (
                    <button
                      onClick={(e) => handleDelete(e, video.id)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-colors"
                      title="Delete video"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}

                  {/* Stats badge */}
                  <div className="absolute bottom-1.5 left-2 flex items-center gap-1 text-[10px] text-white font-mono">
                    <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                    <span>{video.stats.likes}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setIsEditingProfile(false)}
          />
          <div className="relative w-full max-w-sm bg-neutral-900 rounded-3xl p-5 border border-neutral-800 shadow-2xl z-10 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <h3 className="text-sm font-bold text-white">Edit Profile</h3>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-neutral-800 text-xs text-white px-3 py-2 rounded-xl border border-neutral-700 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                  Bio Description
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full bg-neutral-800 text-xs text-white px-3 py-2 rounded-xl border border-neutral-700 focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
