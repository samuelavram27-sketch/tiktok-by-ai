import React from 'react';
import { Heart, MessageCircle, UserPlus, Flame, Sparkles } from 'lucide-react';

const NOTIFICATIONS = [
  {
    id: 'n-1',
    type: 'like',
    user: 'Alex Rivera',
    username: 'alex_creates',
    avatar: '/src/assets/images/creator_avatar_alex_1793110430531.jpg',
    action: 'liked your clip "TokStudio vibes ✨"',
    time: '5m ago',
    icon: Heart,
    iconColor: 'text-rose-500 bg-rose-500/10',
  },
  {
    id: 'n-2',
    type: 'comment',
    user: 'Maya Chen',
    username: 'mayabeats',
    avatar: '/src/assets/images/creator_avatar_maya_1793110432014.jpg',
    action: 'commented: "The synth loop sync is crazy good! 🔥"',
    time: '24m ago',
    icon: MessageCircle,
    iconColor: 'text-blue-500 bg-blue-500/10',
  },
  {
    id: 'n-3',
    type: 'follow',
    user: 'Liam Walker',
    username: 'liamstreet',
    avatar: '/src/assets/images/creator_avatar_liam_1793110432063.jpg',
    action: 'started following you',
    time: '1h ago',
    icon: UserPlus,
    iconColor: 'text-emerald-500 bg-emerald-500/10',
  },
  {
    id: 'n-4',
    type: 'trend',
    user: 'TokStudio Editorial',
    username: 'tokstudio',
    avatar: '/src/assets/images/creator_avatar_sophia_1793110432586.jpg',
    action: 'featured your clip in #TokStudioClips spotlight!',
    time: '3h ago',
    icon: Flame,
    iconColor: 'text-amber-500 bg-amber-500/10',
  },
];

export const ActivityView: React.FC = () => {
  return (
    <div className="w-full h-full bg-neutral-950 flex flex-col overflow-y-auto no-scrollbar select-none pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-neutral-900/90 backdrop-blur-md px-4 py-3.5 border-b border-neutral-800 flex items-center justify-between">
        <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-rose-500" />
          <span>Notifications &amp; Activity</span>
        </h2>
        <span className="text-[11px] text-neutral-400">All activity</span>
      </div>

      {/* Notifications list */}
      <div className="p-4 space-y-3">
        {NOTIFICATIONS.map((n) => {
          const Icon = n.icon;
          return (
            <div
              key={n.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative shrink-0">
                  <img
                    src={n.avatar}
                    alt={n.user}
                    className="w-11 h-11 rounded-full object-cover bg-neutral-800"
                  />
                  <div
                    className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${n.iconColor}`}
                  >
                    <Icon className="w-3 h-3" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs text-neutral-200 leading-snug">
                    <span className="font-bold text-white mr-1">{n.user}</span>
                    {n.action}
                  </p>
                  <p className="text-[10px] text-neutral-500 font-mono mt-0.5">{n.time}</p>
                </div>
              </div>

              {n.type === 'follow' && (
                <button className="ml-3 px-3 py-1 bg-rose-500 text-white rounded-full text-xs font-semibold hover:bg-rose-600 transition-colors shrink-0">
                  Follow
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
