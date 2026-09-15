interface TransportControlsProps {
  isPlaying: boolean;
  bpm: number;
  onToggle: () => void;
  onBpmChange: (bpm: number) => void;
  onClear: () => void;
}

export function TransportControls({ isPlaying, bpm, onToggle, onBpmChange, onClear }: TransportControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <button
        type="button"
        onClick={onToggle}
        className={[
          'inline-flex items-center gap-2 rounded-full px-6 py-2 text-sm font-medium transition-colors',
          isPlaying
            ? 'bg-white text-black hover:bg-gray-200'
            : 'bg-purple-500 text-white hover:bg-purple-400',
        ].join(' ')}
      >
        {isPlaying ? (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="5" width="4" height="14" />
              <rect x="14" y="5" width="4" height="14" />
            </svg>
            Stop
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Play
          </>
        )}
      </button>

      <div className="flex items-center gap-2">
        <label htmlFor="bpm" className="text-sm text-gray-400">
          BPM
        </label>
        <input
          id="bpm"
          type="range"
          min={60}
          max={200}
          value={bpm}
          onChange={(e) => onBpmChange(Number(e.target.value))}
          className="w-32 accent-purple-500"
        />
        <span className="text-sm text-white w-10 tabular-nums">{bpm}</span>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-full px-4 py-2 transition-colors"
      >
        Clear
      </button>
    </div>
  );
}
