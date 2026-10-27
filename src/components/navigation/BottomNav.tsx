import React from 'react';
import { Home, Compass, Plus, Bell, User } from 'lucide-react';
import { soundEngine } from '../../utils/audioSynth';

export type NavTab = 'home' | 'explore' | 'activity' | 'profile';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenRecord: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenRecord,
}) => {
  const handleTabClick = (tab: NavTab) => {
    soundEngine.playTone(450, 'sine', 0.03, 0.06);
    onSelectTab(tab);
  };

  const handleRecordClick = () => {
    soundEngine.playTone(660, 'triangle', 0.08, 0.12);
    onOpenRecord();
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-t border-neutral-900 max-w-lg mx-auto select-none">
      <div className="grid grid-cols-5 items-center h-15 px-2">
        {/* TAB 1: HOME */}
        <button
          onClick={() => handleTabClick('home')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
            currentTab === 'home' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
          }`}
          aria-label="Home Feed"
        >
          <Home className={`w-5 h-5 ${currentTab === 'home' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] font-medium tracking-tight mt-1">Home</span>
        </button>

        {/* TAB 2: EXPLORE */}
        <button
          onClick={() => handleTabClick('explore')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
            currentTab === 'explore' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
          }`}
          aria-label="Discover & Explore"
        >
          <Compass className={`w-5 h-5 ${currentTab === 'explore' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] font-medium tracking-tight mt-1">Discover</span>
        </button>

        {/* TAB 3: CENTER RECORD BUTTON (+) */}
        <button
          onClick={handleRecordClick}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center group"
          aria-label="Record video clip"
        >
          <div className="relative w-11 h-8 rounded-xl flex items-center justify-center group-hover:scale-105 active:scale-95 transition-transform">
            {/* TikTok inspired color split border accents */}
            <div className="absolute inset-0 -left-1 bg-cyan-400 rounded-xl opacity-90" />
            <div className="absolute inset-0 -right-1 bg-rose-500 rounded-xl opacity-90" />
            <div className="relative w-full h-full bg-white rounded-xl flex items-center justify-center text-black z-10 shadow-sm">
              <Plus className="w-5 h-5 stroke-[2.8]" />
            </div>
          </div>
        </button>

        {/* TAB 4: ACTIVITY */}
        <button
          onClick={() => handleTabClick('activity')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
            currentTab === 'activity' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
          }`}
          aria-label="Notifications"
        >
          <div className="relative">
            <Bell className={`w-5 h-5 ${currentTab === 'activity' ? 'stroke-[2.5]' : ''}`} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-1">Activity</span>
        </button>

        {/* TAB 5: PROFILE */}
        <button
          onClick={() => handleTabClick('profile')}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
            currentTab === 'profile' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
          }`}
          aria-label="User Profile"
        >
          <User className={`w-5 h-5 ${currentTab === 'profile' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] font-medium tracking-tight mt-1">Profile</span>
        </button>
      </div>
    </nav>
  );
};
