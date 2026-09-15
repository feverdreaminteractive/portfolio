import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { CompositorEngine } from '../FeedbackComposer/engine/CompositorEngine';
import PreviewPanel from '../FeedbackComposer/PreviewPanel';
import type { RenderGraph } from '../FeedbackComposer/engine/types';

// Single-node op-art pattern (ported from a real Quartz Composer patch --
// see registry/shaders/opart.ts) instead of VibeDesigner's feedback-loop
// presets. No accumulation buffer, just a pure function of time + six
// knobs, which is what makes it safe to drive those knobs directly from
// live drum energy every frame via setLiveParam.
const RENDER_GRAPH: RenderGraph = {
  nodes: [
    { id: 'op', registryKey: 'opArt', params: { a: 0.15, b: 0, c: 0, d: 0, e: 0, f: 0 } },
    { id: 'out', registryKey: 'output', params: {} },
  ],
  edges: [{ id: 'e1', source: 'op', sourceHandle: 'out', target: 'out', targetHandle: 'in' }],
};

// VDMX "Audio Colors"-style behavior: hue (u_f) drifts continuously on its
// own, and every drum hit adds a colored flash on top plus a warp pulse on
// the underlying pattern -- both decaying back to baseline each frame.
const HUE_DRIFT_SPEED = 0.05;
const BASE = { a: 0.15, b: 0, d: 0 };

const TRACK_REACTIONS: Record<string, { channel: 'a' | 'b' | 'd' | 'hue'; weight: number }> = {
  kick: { channel: 'a', weight: 1 },
  snare: { channel: 'b', weight: 1 },
  'hihat-closed': { channel: 'd', weight: 0.4 },
  'hihat-open': { channel: 'd', weight: 0.8 },
  clap: { channel: 'hue', weight: 1 },
  tom: { channel: 'a', weight: 0.5 },
  rim: { channel: 'd', weight: 0.5 },
  cowbell: { channel: 'hue', weight: 0.6 },
};

export interface ReactiveVibeWindowHandle {
  triggerReaction: (trackId: string) => void;
}

export const ReactiveVibeWindow = forwardRef<ReactiveVibeWindowHandle>(function ReactiveVibeWindow(_props, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CompositorEngine | null>(null);
  const energyRef = useRef({ a: 0, b: 0, d: 0, hue: 0 });
  const startRef = useRef(performance.now());

  useImperativeHandle(ref, () => ({
    triggerReaction(trackId: string) {
      const reaction = TRACK_REACTIONS[trackId];
      if (!reaction) return;
      energyRef.current[reaction.channel] += reaction.weight;
    },
  }));

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new CompositorEngine(canvasRef.current);
    engineRef.current = engine;
    engine.update(RENDER_GRAPH);
    return () => engine.dispose();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      engineRef.current?.resize(Math.max(1, width * dpr), Math.max(1, height * dpr), 1);
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let rafId: number;
    const tick = () => {
      const engine = engineRef.current;
      const energy = energyRef.current;
      if (engine) {
        const t = (performance.now() - startRef.current) / 1000;
        engine.setLiveParam('op', 'a', BASE.a + energy.a * 0.5);
        engine.setLiveParam('op', 'b', BASE.b + energy.b * 3);
        engine.setLiveParam('op', 'c', BASE.b + energy.b * 3);
        engine.setLiveParam('op', 'd', BASE.d + energy.d * 6);
        engine.setLiveParam('op', 'e', BASE.d + energy.d * 6);
        engine.setLiveParam('op', 'f', t * HUE_DRIFT_SPEED + energy.hue * 1.5);
      }
      // Exponential decay back to baseline every frame.
      energy.a *= 0.85;
      energy.b *= 0.82;
      energy.d *= 0.75;
      energy.hue *= 0.9;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return <PreviewPanel canvasRef={canvasRef} performMode={false} defaultSize={{ width: 300, height: 240 }} />;
});
