import React from 'react';
import { Heart } from 'lucide-react';

interface HeartAnimationProps {
  x: number;
  y: number;
  onAnimationEnd: () => void;
}

export const DoubleTapHeart: React.FC<HeartAnimationProps> = ({ x, y, onAnimationEnd }) => {
  return (
    <div
      className="absolute pointer-events-none z-30 transform -translate-x-1/2 -translate-y-1/2 animate-heart-burst"
      style={{ left: `${x}px`, top: `${y}px` }}
      onAnimationEnd={onAnimationEnd}
    >
      <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-[0_4px_16px_rgba(244,63,94,0.6)]" />
    </div>
  );
};
