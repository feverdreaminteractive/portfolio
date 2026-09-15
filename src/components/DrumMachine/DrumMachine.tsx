import { useRef, useState } from 'react';
import { DRUM_TRACKS, DEFAULT_KIT_ID, createEmptyPattern, createDefaultPattern } from './tracks';
import { useSequencer } from './useSequencer';
import { TrackRow } from './TrackRow';
import { TransportControls } from './TransportControls';
import { KitSidebar } from './KitSidebar';
import { ReactiveVibeWindow, type ReactiveVibeWindowHandle } from './ReactiveVibeWindow';

export default function DrumMachine() {
  const [pattern, setPattern] = useState(createDefaultPattern);
  const [bpm, setBpm] = useState(120);
  const [kitId, setKitId] = useState(DEFAULT_KIT_ID);
  const vibeWindowRef = useRef<ReactiveVibeWindowHandle>(null);
  const { isPlaying, currentStep, isLoadingKit, toggle, triggerPreview } = useSequencer(
    pattern,
    bpm,
    kitId,
    (trackId) => vibeWindowRef.current?.triggerReaction(trackId)
  );

  const toggleStep = (trackId: string, stepIndex: number) => {
    setPattern((prev) => {
      const next = { ...prev, [trackId]: [...prev[trackId]] };
      next[trackId][stepIndex] = !next[trackId][stepIndex];
      return next;
    });
  };

  const clearPattern = () => setPattern(createEmptyPattern());

  return (
    <div className="bg-black text-white rounded-2xl border border-white/10 p-4 sm:p-6">
      <ReactiveVibeWindow ref={vibeWindowRef} />

      <div className="flex flex-col sm:flex-row gap-6">
        <KitSidebar selectedKitId={kitId} onSelectKit={setKitId} isLoadingKit={isLoadingKit} />

        <div className="flex-1 min-w-0">
          <TransportControls
            isPlaying={isPlaying}
            bpm={bpm}
            onToggle={toggle}
            onBpmChange={setBpm}
            onClear={clearPattern}
          />

          <div className="overflow-x-auto">
            <div className="min-w-[480px]">
              {DRUM_TRACKS.map((track) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  steps={pattern[track.id]}
                  currentStep={isPlaying ? currentStep : -1}
                  onToggleStep={(i) => toggleStep(track.id, i)}
                  onPreview={() => triggerPreview(track.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
