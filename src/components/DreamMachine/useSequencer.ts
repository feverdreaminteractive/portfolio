import { useCallback, useEffect, useRef, useState } from 'react';
import { DRUM_TRACKS, STEPS_PER_TRACK, samplePath, type Pattern } from './tracks';

const SCHEDULE_AHEAD_TIME = 0.1; // seconds
const LOOKAHEAD_INTERVAL = 25; // ms

interface ScheduledStep {
  step: number;
  time: number;
}

export function useSequencer(pattern: Pattern, bpm: number, kitId: string, onHit?: (trackId: string) => void) {
  const onHitRef = useRef(onHit);
  onHitRef.current = onHit;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isLoadingKit, setIsLoadingKit] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const buffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const loadedKitIdRef = useRef<string | null>(null);
  const kitIdRef = useRef(kitId);
  kitIdRef.current = kitId;

  const patternRef = useRef(pattern);
  patternRef.current = pattern;
  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;

  const nextStepRef = useRef(0);
  const nextNoteTimeRef = useRef(0);
  const timerIdRef = useRef<number | null>(null);
  const scheduledStepsRef = useRef<ScheduledStep[]>([]);
  const rafIdRef = useRef<number | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const loadBuffers = useCallback(async () => {
    const kit = kitIdRef.current;
    if (loadedKitIdRef.current === kit) return;
    const ctx = getAudioContext();
    setIsLoadingKit(true);
    try {
      await Promise.all(
        DRUM_TRACKS.map(async (track) => {
          const res = await fetch(samplePath(kit, track.id));
          const arrayBuffer = await res.arrayBuffer();
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
          buffersRef.current.set(track.id, audioBuffer);
        })
      );
      loadedKitIdRef.current = kit;
    } finally {
      setIsLoadingKit(false);
    }
  }, [getAudioContext]);

  const playSample = useCallback(
    (trackId: string, time: number) => {
      const ctx = audioContextRef.current;
      const buffer = buffersRef.current.get(trackId);
      if (!ctx || !buffer) return;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(time);
    },
    []
  );

  const scheduler = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    while (nextNoteTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD_TIME) {
      const step = nextStepRef.current;
      const time = nextNoteTimeRef.current;

      for (const track of DRUM_TRACKS) {
        if (patternRef.current[track.id]?.[step]) {
          playSample(track.id, time);
          // Fire the visual reaction when the sound actually becomes
          // audible, not when it's scheduled -- time is up to
          // SCHEDULE_AHEAD_TIME in the future relative to ctx.currentTime.
          const delayMs = Math.max(0, (time - ctx.currentTime) * 1000);
          const trackId = track.id;
          window.setTimeout(() => onHitRef.current?.(trackId), delayMs);
        }
      }

      scheduledStepsRef.current.push({ step, time });

      const secondsPerStep = 60.0 / bpmRef.current / 4;
      nextNoteTimeRef.current += secondsPerStep;
      nextStepRef.current = (step + 1) % STEPS_PER_TRACK;
    }
  }, [playSample]);

  const updateVisualStep = useCallback(() => {
    const ctx = audioContextRef.current;
    if (ctx) {
      const now = ctx.currentTime;
      let latest: ScheduledStep | null = null;
      scheduledStepsRef.current = scheduledStepsRef.current.filter((s) => {
        if (s.time <= now) {
          latest = s;
          return false;
        }
        return true;
      });
      if (latest) setCurrentStep(latest.step);
    }
    rafIdRef.current = requestAnimationFrame(updateVisualStep);
  }, []);

  const start = useCallback(async () => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') await ctx.resume();
    await loadBuffers();

    nextStepRef.current = 0;
    nextNoteTimeRef.current = ctx.currentTime + 0.05;
    scheduledStepsRef.current = [];

    timerIdRef.current = window.setInterval(scheduler, LOOKAHEAD_INTERVAL);
    rafIdRef.current = requestAnimationFrame(updateVisualStep);
    setIsPlaying(true);
  }, [getAudioContext, loadBuffers, scheduler, updateVisualStep]);

  const stop = useCallback(() => {
    if (timerIdRef.current !== null) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    setIsPlaying(false);
    setCurrentStep(-1);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      start();
    }
  }, [isPlaying, start, stop]);

  const triggerPreview = useCallback(
    async (trackId: string) => {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') await ctx.resume();
      await loadBuffers();
      playSample(trackId, ctx.currentTime);
      onHitRef.current?.(trackId);
    },
    [getAudioContext, loadBuffers, playSample]
  );

  // Preload a newly-selected kit's samples right away, so the first hit
  // after switching (playback or preview) isn't delayed by a fetch+decode.
  useEffect(() => {
    void loadBuffers();
  }, [kitId, loadBuffers]);

  useEffect(() => {
    return () => {
      stop();
      audioContextRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isPlaying, currentStep, isLoadingKit, toggle, triggerPreview };
}
