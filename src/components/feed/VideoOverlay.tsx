import React from 'react';
import { TextOverlay, StickerOverlay } from '../../types/video';

interface VideoOverlayProps {
  textOverlays?: TextOverlay[];
  stickers?: StickerOverlay[];
}

export const VideoOverlay: React.FC<VideoOverlayProps> = ({ textOverlays, stickers }) => {
  const getStyleClasses = (style: string) => {
    switch (style) {
      case 'neon':
        return 'font-extrabold tracking-wider drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]';
      case 'typewriter':
        return 'font-mono tracking-tight';
      case 'marker':
        return 'font-black tracking-normal uppercase';
      default:
        return 'font-bold tracking-tight';
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'text-xs md:text-sm';
      case 'lg':
        return 'text-lg md:text-2xl';
      case 'xl':
        return 'text-2xl md:text-3xl';
      default:
        return 'text-sm md:text-base';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {/* Dynamic text overlays */}
      {textOverlays?.map((item) => (
        <div
          key={item.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-100"
          style={{ left: `${item.x}%`, top: `${item.y}%` }}
        >
          <div
            className={`px-3 py-1.5 rounded-lg text-center ${
              item.hasBackground ? 'bg-black/60 backdrop-blur-xs' : ''
            } ${getStyleClasses(item.style)} ${getSizeClasses(item.size)}`}
            style={{ color: item.color }}
          >
            {item.text}
          </div>
        </div>
      ))}

      {/* Dynamic sticker emojis */}
      {stickers?.map((sticker) => (
        <div
          key={sticker.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 select-none"
          style={{
            left: `${sticker.x}%`,
            top: `${sticker.y}%`,
            fontSize: `${sticker.scale * 2.25}rem`,
          }}
        >
          {sticker.emoji}
        </div>
      ))}
    </div>
  );
};
