import { FilterSettings } from '../types/video';

export const FILTER_PRESETS: { id: string; label: string; filter: string; settings: FilterSettings }[] = [
  {
    id: 'none',
    label: 'Normal',
    filter: 'none',
    settings: { preset: 'none', brightness: 1, contrast: 1, saturation: 1, blur: 0, sepia: 0 },
  },
  {
    id: 'warm',
    label: 'Warm Film',
    filter: 'brightness(1.05) contrast(1.1) saturate(1.2) sepia(0.2)',
    settings: { preset: 'warm', brightness: 1.05, contrast: 1.1, saturation: 1.2, blur: 0, sepia: 0.2 },
  },
  {
    id: 'noir',
    label: 'Noir B&W',
    filter: 'grayscale(100%) contrast(1.3) brightness(0.95)',
    settings: { preset: 'noir', brightness: 0.95, contrast: 1.3, saturation: 0, blur: 0, sepia: 0 },
  },
  {
    id: 'cyber',
    label: 'Cyber Teal',
    filter: 'contrast(1.2) saturate(1.4) hue-rotate(15deg) brightness(1.05)',
    settings: { preset: 'cyber', brightness: 1.05, contrast: 1.2, saturation: 1.4, blur: 0, sepia: 0 },
  },
  {
    id: 'golden',
    label: 'Golden Hour',
    filter: 'sepia(0.25) saturate(1.3) contrast(1.08) brightness(1.05)',
    settings: { preset: 'golden', brightness: 1.05, contrast: 1.08, saturation: 1.3, blur: 0, sepia: 0.25 },
  },
  {
    id: 'retro',
    label: 'Vintage 90s',
    filter: 'contrast(1.15) brightness(0.95) saturate(0.85) sepia(0.35)',
    settings: { preset: 'retro', brightness: 0.95, contrast: 1.15, saturation: 0.85, blur: 0, sepia: 0.35 },
  },
  {
    id: 'vivid',
    label: 'Vivid Pop',
    filter: 'saturate(1.5) contrast(1.2) brightness(1.02)',
    settings: { preset: 'vivid', brightness: 1.02, contrast: 1.2, saturation: 1.5, blur: 0, sepia: 0 },
  },
];

export function getFilterStyleString(settings?: FilterSettings): string {
  if (!settings) return 'none';
  if (settings.preset !== 'none' && !settings.brightness && !settings.contrast) {
    const found = FILTER_PRESETS.find((p) => p.id === settings.preset);
    if (found) return found.filter;
  }

  const parts: string[] = [];
  if (settings.brightness !== 1) parts.push(`brightness(${settings.brightness})`);
  if (settings.contrast !== 1) parts.push(`contrast(${settings.contrast})`);
  if (settings.saturation !== 1) parts.push(`saturate(${settings.saturation})`);
  if (settings.sepia > 0) parts.push(`sepia(${settings.sepia})`);
  if (settings.blur > 0) parts.push(`blur(${settings.blur}px)`);

  return parts.length > 0 ? parts.join(' ') : 'none';
}
