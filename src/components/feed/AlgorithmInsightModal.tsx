import React, { useState } from 'react';
import {
  X,
  Sliders,
  TrendingUp,
  UserCheck,
  Eye,
  Clock,
  Sparkles,
  RotateCcw,
  Check,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  VideoItemWithScore,
  AlgorithmConfig,
  AlgorithmMode,
  UserEngagementProfile,
} from '../../types/video';
import {
  recommendationEngine,
  ALGORITHM_PRESETS,
} from '../../utils/recommendationEngine';
import { soundEngine } from '../../utils/audioSynth';

interface AlgorithmInsightModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVideo: VideoItemWithScore;
  onConfigChanged: () => void;
}

export const AlgorithmInsightModal: React.FC<AlgorithmInsightModalProps> = ({
  isOpen,
  onClose,
  currentVideo,
  onConfigChanged,
}) => {
  const [config, setConfig] = useState<AlgorithmConfig>(recommendationEngine.getConfig());
  const [profile, setProfile] = useState<UserEngagementProfile>(recommendationEngine.getProfile());
  const [activeTab, setActiveTab] = useState<'why' | 'tune' | 'profile'>('why');
  const [showAdvancedSliders, setShowAdvancedSliders] = useState(false);

  if (!isOpen) return null;

  const breakdown = currentVideo.recommendationBreakdown || recommendationEngine.scoreVideo(currentVideo);

  const handleSelectMode = (mode: AlgorithmMode) => {
    soundEngine.playTone(550, 'triangle', 0.08, 0.12);
    const newConfig = { ...ALGORITHM_PRESETS[mode] };
    setConfig(newConfig);
    recommendationEngine.saveConfig(newConfig);
    onConfigChanged();
  };

  const handleWeightChange = (key: keyof AlgorithmConfig, value: number) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
    recommendationEngine.saveConfig(updated);
    onConfigChanged();
  };

  const handleResetProfile = () => {
    soundEngine.playTone(320, 'sawtooth', 0.1, 0.12);
    if (confirm('Reset your personalized interest profile back to initial default?')) {
      recommendationEngine.resetProfile();
      setProfile(recommendationEngine.getProfile());
      onConfigChanged();
    }
  };

  const topInterests = Object.entries(profile.hashtagWeights)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      {/* Sheet Content */}
      <div className="relative w-full max-w-lg mx-auto bg-neutral-900 border-t border-neutral-800 rounded-t-3xl max-h-[82vh] h-[640px] flex flex-col shadow-2xl z-10 animate-in slide-in-from-bottom duration-200 text-white select-none">
        {/* Grab Handle */}
        <div className="w-10 h-1 bg-neutral-700 rounded-full mx-auto mt-2.5 mb-1 cursor-grab" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs font-bold text-neutral-100">For You Algorithm Insights</h3>
              <p className="text-[10px] text-neutral-400">
                Mode: <span className="text-rose-400 capitalize font-medium">{config.mode.replace('_', ' ')}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Tabs (Why this video | Tune Algorithm | Your Profile) */}
        <div className="flex items-center gap-1 p-1 mx-4 mt-3 bg-neutral-800/80 rounded-xl border border-neutral-700/60 text-xs">
          <button
            onClick={() => setActiveTab('why')}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'why' ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Why This Clip?
          </button>
          <button
            onClick={() => setActiveTab('tune')}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'tune' ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Tune Feed
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'profile' ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Your Profile
          </button>
        </div>

        {/* Tab 1: WHY THIS VIDEO */}
        {activeTab === 'why' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {/* Top Score Summary Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-neutral-900 to-neutral-900 border border-rose-500/30 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                  Recommendation Score
                </p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-black font-mono text-white tabular-nums">
                    {breakdown.totalScore}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">/ 100</span>
                </div>
                <p className="text-[11px] text-neutral-300 mt-1">
                  Ranked high based on topic alignment &amp; viral share velocity.
                </p>
              </div>

              <div className="w-16 h-16 rounded-full border-4 border-rose-500 flex items-center justify-center bg-rose-500/10 font-mono text-xs font-bold text-white shadow-lg shadow-rose-500/20">
                {breakdown.totalScore}%
              </div>
            </div>

            {/* Why reasons list */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-300">Key Ranking Drivers</span>
              <div className="space-y-1.5">
                {breakdown.reasons.map((reason, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-neutral-800/70 border border-neutral-700/60 text-xs text-neutral-200"
                  >
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Factor Breakdown Bars */}
            <div className="space-y-3 pt-1">
              <span className="text-xs font-bold text-neutral-300">Algorithmic Factor Weights</span>

              <div className="space-y-2.5 bg-neutral-800/40 p-3.5 rounded-2xl border border-neutral-800">
                {/* 1. Topic & Personalization */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-neutral-300">
                      <UserCheck className="w-3.5 h-3.5 text-rose-400" />
                      Topic &amp; Creator Affinity
                    </span>
                    <span className="font-mono text-neutral-200 tabular-nums">
                      {breakdown.personalizationScore} / 100
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${breakdown.personalizationScore}%` }}
                    />
                  </div>
                </div>

                {/* 2. Popularity & Share Velocity */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-neutral-300">
                      <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                      Viral Engagement Velocity
                    </span>
                    <span className="font-mono text-neutral-200 tabular-nums">
                      {breakdown.popularityScore} / 100
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full"
                      style={{ width: `${breakdown.popularityScore}%` }}
                    />
                  </div>
                </div>

                {/* 3. Watch Time & Loops */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-neutral-300">
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      Watch Duration &amp; Retention
                    </span>
                    <span className="font-mono text-neutral-200 tabular-nums">
                      {breakdown.watchTimeAffinity} / 100
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${breakdown.watchTimeAffinity}%` }}
                    />
                  </div>
                </div>

                {/* 4. Freshness */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-neutral-300">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      Freshness &amp; Recency Decay
                    </span>
                    <span className="font-mono text-neutral-200 tabular-nums">
                      {breakdown.freshnessScore} / 100
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-400 rounded-full"
                      style={{ width: `${breakdown.freshnessScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: TUNE ALGORITHM */}
        {activeTab === 'tune' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-neutral-200">Recommendation Mode</h4>
              <p className="text-[11px] text-neutral-400">
                Choose how your For You feed balances personalization vs trending discoveries.
              </p>
            </div>

            {/* Mode selection cards */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                {
                  id: 'balanced',
                  title: 'Balanced',
                  desc: 'Equal balance of your interests, viral hits, and fresh uploads.',
                  tag: 'Standard',
                },
                {
                  id: 'viral_trending',
                  title: 'Viral & Trending',
                  desc: 'Prioritizes clips with highest global shares, likes, and comment velocity.',
                  tag: 'High Velocity',
                },
                {
                  id: 'deep_personalized',
                  title: 'Deep Niche',
                  desc: 'Heavily tuned to your specific watch duration, followed accounts, and hashtags.',
                  tag: 'Customized',
                },
                {
                  id: 'fresh_explore',
                  title: 'Fresh Explore',
                  desc: 'Surfaces newest uploads, rising creators, and diverse unexplored topics.',
                  tag: 'Discovery',
                },
              ].map((m) => {
                const isSelected = config.mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMode(m.id as AlgorithmMode)}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      isSelected
                        ? 'bg-rose-950/30 border-rose-500 shadow-md shadow-rose-500/10'
                        : 'bg-neutral-800/60 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{m.title}</span>
                      {isSelected && <Check className="w-4 h-4 text-rose-400" />}
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-snug">{m.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Advanced slider toggle */}
            <div className="pt-2">
              <button
                onClick={() => setShowAdvancedSliders((prev) => !prev)}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{showAdvancedSliders ? 'Hide Advanced Tuning' : 'Custom Weight Controls'}</span>
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform ${showAdvancedSliders ? 'rotate-90' : ''}`}
                />
              </button>

              {showAdvancedSliders && (
                <div className="mt-3 p-3.5 bg-neutral-800/60 rounded-2xl border border-neutral-700/60 space-y-3.5 animate-in slide-in-from-top-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-neutral-300">
                      <span>Personalization Affinity</span>
                      <span className="font-mono">{Math.round(config.personalizationWeight * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="0.8"
                      step="0.05"
                      value={config.personalizationWeight}
                      onChange={(e) =>
                        handleWeightChange('personalizationWeight', parseFloat(e.target.value))
                      }
                      className="w-full accent-rose-500 h-1.5 bg-neutral-900 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-neutral-300">
                      <span>Popularity &amp; Virality</span>
                      <span className="font-mono">{Math.round(config.popularityWeight * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="0.8"
                      step="0.05"
                      value={config.popularityWeight}
                      onChange={(e) =>
                        handleWeightChange('popularityWeight', parseFloat(e.target.value))
                      }
                      className="w-full accent-cyan-400 h-1.5 bg-neutral-900 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-neutral-300">
                      <span>Exploration &amp; Diversity</span>
                      <span className="font-mono">{Math.round(config.explorationRate * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.5"
                      step="0.05"
                      value={config.explorationRate}
                      onChange={(e) =>
                        handleWeightChange('explorationRate', parseFloat(e.target.value))
                      }
                      className="w-full accent-amber-400 h-1.5 bg-neutral-900 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: YOUR PROFILE & INTERESTS */}
        {activeTab === 'profile' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-neutral-200">Your Engagement Footprint</h4>
                <p className="text-[10px] text-neutral-400">
                  Learned from your watch duration, loops, likes, and shares.
                </p>
              </div>

              <button
                onClick={handleResetProfile}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-rose-400 text-[11px] font-semibold rounded-lg flex items-center gap-1"
                title="Reset profile"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-neutral-800/50 rounded-xl border border-neutral-800">
                <span className="text-lg font-bold font-mono text-white tabular-nums">
                  {profile.totalClipsWatched}
                </span>
                <p className="text-[10px] text-neutral-400 mt-0.5">Clips Watched</p>
              </div>
              <div className="p-3 bg-neutral-800/50 rounded-xl border border-neutral-800">
                <span className="text-lg font-bold font-mono text-rose-400 tabular-nums">
                  {profile.likedVideoIds.length}
                </span>
                <p className="text-[10px] text-neutral-400 mt-0.5">Likes Given</p>
              </div>
              <div className="p-3 bg-neutral-800/50 rounded-xl border border-neutral-800">
                <span className="text-lg font-bold font-mono text-cyan-400 tabular-nums">
                  {Math.round(profile.averageCompletionRate * 100)}%
                </span>
                <p className="text-[10px] text-neutral-400 mt-0.5">Avg Completion</p>
              </div>
            </div>

            {/* Top Hashtag Affinities */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-neutral-300">Top Topic Affinities</span>
              <div className="space-y-1.5">
                {topInterests.length === 0 ? (
                  <p className="text-xs text-neutral-500 py-3 text-center">
                    Watch more clips to build your personalized topic map!
                  </p>
                ) : (
                  topInterests.map(([tag, weight]) => (
                    <div
                      key={tag}
                      className="flex items-center justify-between p-2 rounded-xl bg-neutral-800/40 border border-neutral-800 text-xs"
                    >
                      <span className="font-semibold text-neutral-200">#{tag}</span>
                      <span className="font-mono text-rose-400 text-[11px] font-bold">
                        +{weight} pts
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Info notice */}
            <div className="p-3 bg-neutral-800/30 rounded-xl border border-neutral-800 flex items-start gap-2 text-[11px] text-neutral-400">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                As you watch videos to completion, double tap to like, or share clips, TokStudio’s Monolith algorithm dynamically adjusts your feed in real-time.
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-900 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95"
          >
            Apply &amp; Enjoy Feed
          </button>
        </div>
      </div>
    </div>
  );
};
