export interface DrumTrack {
  id: string;
  label: string;
  color: string;
}

export interface DrumKit {
  id: string;
  label: string;
  description: string;
}

export const STEPS_PER_TRACK = 16;

// Sample files live in public/audio/drum-machine/<kit>/ — swap any file here
// (same filename) to replace a placeholder with a real recorded sample.
export const DRUM_TRACKS: DrumTrack[] = [
  { id: 'kick', label: 'Kick', color: '#a855f7' },
  { id: 'snare', label: 'Snare', color: '#c084fc' },
  { id: 'hihat-closed', label: 'Hi-Hat', color: '#e9d5ff' },
  { id: 'hihat-open', label: 'Open Hat', color: '#d8b4fe' },
  { id: 'clap', label: 'Clap', color: '#f0abfc' },
  { id: 'tom', label: 'Tom', color: '#818cf8' },
  { id: 'rim', label: 'Rim', color: '#93c5fd' },
  { id: 'cowbell', label: 'Cowbell', color: '#67e8f9' },
];

export const DRUM_KITS: DrumKit[] = [
  { id: '808', label: '808', description: 'Deep, booming classic' },
  { id: '909', label: '909', description: 'Punchy analog dance kit' },
  { id: 'lofi', label: 'Lo-Fi', description: 'Warm, dusty, bitcrushed' },
];

export const DEFAULT_KIT_ID = 'lofi';

export function samplePath(kitId: string, trackId: string): string {
  return `/audio/drum-machine/${kitId}/${trackId}.wav`;
}

export type Pattern = Record<string, boolean[]>;

export function createEmptyPattern(): Pattern {
  const pattern: Pattern = {};
  for (const track of DRUM_TRACKS) {
    pattern[track.id] = new Array(STEPS_PER_TRACK).fill(false);
  }
  return pattern;
}

// A laid-back boom-bap groove: kick on 1 and the "a" of 3, backbeat snare on
// 2 and 4, straight-eighth hats with an open-hat pickup into the next loop.
const DEFAULT_STEPS: Record<string, number[]> = {
  kick: [0, 6, 10],
  snare: [4, 12],
  'hihat-closed': [0, 2, 4, 6, 8, 10, 12, 14],
  'hihat-open': [15],
};

export function createDefaultPattern(): Pattern {
  const pattern = createEmptyPattern();
  for (const [trackId, steps] of Object.entries(DEFAULT_STEPS)) {
    for (const step of steps) pattern[trackId][step] = true;
  }
  return pattern;
}
