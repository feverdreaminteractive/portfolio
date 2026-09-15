import type { DrumTrack } from './tracks';

interface TrackRowProps {
  track: DrumTrack;
  steps: boolean[];
  currentStep: number;
  onToggleStep: (stepIndex: number) => void;
  onPreview: () => void;
}

export function TrackRow({ track, steps, currentStep, onToggleStep, onPreview }: TrackRowProps) {
  return (
    <div className="flex items-center gap-2 py-1">
      <button
        type="button"
        onClick={onPreview}
        className="w-20 sm:w-24 shrink-0 text-left text-xs sm:text-sm text-gray-300 hover:text-white transition-colors truncate"
        title={`Preview ${track.label}`}
      >
        {track.label}
      </button>
      <div className="grid gap-1 flex-1 min-w-0" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
        {steps.map((active, i) => {
          const isBeatStart = i % 4 === 0;
          const isCurrent = i === currentStep;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onToggleStep(i)}
              aria-pressed={active}
              className={[
                'aspect-square rounded-sm transition-all',
                isBeatStart ? 'border-white/20' : 'border-white/5',
                'border',
                isCurrent ? 'ring-2 ring-white/80' : '',
              ].join(' ')}
              style={{
                backgroundColor: active ? track.color : 'rgba(255,255,255,0.05)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
