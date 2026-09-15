#!/usr/bin/env python3
"""
Generates placeholder drum kits for the drum machine (public/audio/drum-machine/<kit>/).
Procedurally synthesized stand-ins, tuned per kit to approximate the character
of each machine -- swap in real samples later by dropping a same-named .wav
into the matching kit folder, no code changes needed.
"""
import math
import random
import struct
import wave
import os

SR = 44100
OUT_ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "audio", "drum-machine")


def write_wav(kit, name, samples):
    kit_dir = os.path.join(OUT_ROOT, kit)
    os.makedirs(kit_dir, exist_ok=True)
    path = os.path.join(kit_dir, f"{name}.wav")
    with wave.open(path, "w") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SR)
        frames = b"".join(struct.pack("<h", max(-32767, min(32767, int(s * 32767)))) for s in samples)
        f.writeframes(frames)
    print(f"wrote {path} ({len(samples)/SR:.3f}s)")


def env_exp(n, decay):
    return [math.exp(-decay * i / SR) for i in range(n)]


def sine(freq_start, freq_end, n, phase0=0.0):
    out = []
    for i in range(n):
        t = i / SR
        frac = i / n
        freq = freq_start + (freq_end - freq_start) * frac
        phase = phase0 + 2 * math.pi * freq * t
        out.append(math.sin(phase))
    return out


def square(freq, n):
    period = SR / freq
    return [1.0 if (i % period) < period / 2 else -1.0 for i in range(n)]


def noise(n):
    return [random.uniform(-1, 1) for _ in range(n)]


def highpass(samples, cutoff_ratio=0.02):
    out = []
    prev_in = 0.0
    prev_out = 0.0
    alpha = 1 - cutoff_ratio
    for s in samples:
        y = alpha * (prev_out + s - prev_in)
        prev_in = s
        prev_out = y
        out.append(y)
    return out


def lowpass(samples, cutoff_ratio=0.3):
    out = []
    prev = 0.0
    for s in samples:
        prev = prev + cutoff_ratio * (s - prev)
        out.append(prev)
    return out


def bitcrush(samples, bits=6, downsample=3):
    levels = 2 ** bits
    out = []
    held = 0.0
    for i, s in enumerate(samples):
        if i % downsample == 0:
            held = round(s * levels) / levels
        out.append(held)
    return out


def mix(*layers):
    n = max(len(l) for l in layers)
    out = [0.0] * n
    for l in layers:
        for i, v in enumerate(l):
            out[i] += v
    peak = max(abs(v) for v in out) or 1.0
    return [v / peak * 0.9 for v in out]


def pad(layer, n):
    return layer + [0.0] * (n - len(layer))


# ---- 808 -------------------------------------------------------------------

def kit_808():
    def kick():
        n = int(SR * 0.55)
        body = sine(120, 40, n)
        env = env_exp(n, 6)
        return [b * e for b, e in zip(body, env)]

    def snare():
        n = int(SR * 0.25)
        tone = sine(180, 160, n)
        tone_env = env_exp(n, 20)
        nz = highpass(noise(n), 0.1)
        nz_env = env_exp(n, 16)
        return mix([t * e for t, e in zip(tone, tone_env)], [x * e * 0.7 for x, e in zip(nz, nz_env)])

    def hihat_closed():
        n = int(SR * 0.05)
        layers = [square(f, n) for f in (205, 350, 540, 800, 1150, 1600)]
        combined = [sum(v[i] for v in layers) / len(layers) for i in range(n)]
        combined = highpass(combined, 0.4)
        env = env_exp(n, 70)
        return [x * e for x, e in zip(combined, env)]

    def hihat_open():
        n = int(SR * 0.4)
        layers = [square(f, n) for f in (205, 350, 540, 800, 1150, 1600)]
        combined = [sum(v[i] for v in layers) / len(layers) for i in range(n)]
        combined = highpass(combined, 0.4)
        env = env_exp(n, 6)
        return [x * e for x, e in zip(combined, env)]

    def clap():
        n = int(SR * 0.3)
        out = [0.0] * n
        burst_n = int(SR * 0.02)
        for off in (0, int(SR * 0.012), int(SR * 0.024), int(SR * 0.04)):
            nz = highpass(noise(burst_n), 0.15)
            env = env_exp(burst_n, 35)
            for i, (x, e) in enumerate(zip(nz, env)):
                idx = off + i
                if idx < n:
                    out[idx] += x * e * 0.6
        tail_env = env_exp(n, 8)
        nz_tail = highpass(noise(n), 0.15)
        return mix(out, [x * e * 0.4 for x, e in zip(nz_tail, tail_env)])

    def tom():
        n = int(SR * 0.4)
        body = sine(150, 70, n)
        env = env_exp(n, 7)
        return [b * e for b, e in zip(body, env)]

    def rim():
        n = int(SR * 0.06)
        tone = sine(1700, 1200, n)
        env = env_exp(n, 60)
        return [t * e for t, e in zip(tone, env)]

    def cowbell():
        n = int(SR * 0.35)
        a = sine(540, 540, n)
        b = sine(800, 800, n)
        env = env_exp(n, 9)
        return [((x + y) * 0.5) * e for x, y, e in zip(a, b, env)]

    return {
        "kick": kick(), "snare": snare(), "hihat-closed": hihat_closed(), "hihat-open": hihat_open(),
        "clap": clap(), "tom": tom(), "rim": rim(), "cowbell": cowbell(),
    }


# ---- 909 -------------------------------------------------------------------

def kit_909():
    def kick():
        n = int(SR * 0.35)
        body = sine(160, 50, n)
        env = env_exp(n, 16)
        click_n = int(SR * 0.008)
        click = mix(pad(noise(click_n), n), [0.0] * n)
        click_env = pad(env_exp(click_n, 50), n)
        return mix([b * e for b, e in zip(body, env)], [c * e * 0.5 for c, e in zip(click, click_env)])

    def snare():
        n = int(SR * 0.22)
        tone = mix(sine(180, 180, n), sine(330, 330, n))
        tone_env = env_exp(n, 22)
        nz = highpass(noise(n), 0.2)
        nz_env = env_exp(n, 10)
        return mix([t * e for t, e in zip(tone, tone_env)], [x * e for x, e in zip(nz, nz_env)])

    def hihat_closed():
        n = int(SR * 0.05)
        nz = highpass(noise(n), 0.5)
        env = env_exp(n, 65)
        return [x * e for x, e in zip(nz, env)]

    def hihat_open():
        n = int(SR * 0.45)
        nz = highpass(noise(n), 0.5)
        env = env_exp(n, 5)
        return [x * e for x, e in zip(nz, env)]

    def clap():
        n = int(SR * 0.22)
        out = [0.0] * n
        burst_n = int(SR * 0.015)
        for off in (0, int(SR * 0.009), int(SR * 0.018)):
            nz = highpass(noise(burst_n), 0.25)
            env = env_exp(burst_n, 45)
            for i, (x, e) in enumerate(zip(nz, env)):
                idx = off + i
                if idx < n:
                    out[idx] += x * e * 0.7
        return out

    def tom():
        n = int(SR * 0.28)
        body = sine(200, 100, n)
        nz = highpass(noise(n), 0.3)
        env = env_exp(n, 11)
        return mix([b * e for b, e in zip(body, env)], [x * e * 0.15 for x, e in zip(nz, env)])

    def rim():
        n = int(SR * 0.07)
        tone = sine(950, 550, n)
        click_n = int(SR * 0.003)
        click = pad(noise(click_n), n)
        click_env = pad(env_exp(click_n, 90), n)
        tone_env = env_exp(n, 45)
        return mix([t * e for t, e in zip(tone, tone_env)], [c * e for c, e in zip(click, click_env)])

    def cowbell():
        n = int(SR * 0.3)
        a = sine(587, 587, n)
        b = sine(845, 845, n)
        env = env_exp(n, 12)
        return [((x + y) * 0.5) * e for x, y, e in zip(a, b, env)]

    return {
        "kick": kick(), "snare": snare(), "hihat-closed": hihat_closed(), "hihat-open": hihat_open(),
        "clap": clap(), "tom": tom(), "rim": rim(), "cowbell": cowbell(),
    }


# ---- Lo-Fi (modern) ----------------------------------------------------------

def kit_lofi():
    def dusty(layer):
        return bitcrush(lowpass(layer, 0.35), bits=7, downsample=2)

    def kick():
        n = int(SR * 0.3)
        body = sine(130, 55, n)
        env = env_exp(n, 14)
        return dusty([b * e for b, e in zip(body, env)])

    def snare():
        n = int(SR * 0.18)
        tone = sine(170, 150, n)
        tone_env = env_exp(n, 22)
        nz = highpass(noise(n), 0.08)
        nz_env = env_exp(n, 15)
        return dusty(mix([t * e for t, e in zip(tone, tone_env)], [x * e * 0.6 for x, e in zip(nz, nz_env)]))

    def hihat_closed():
        n = int(SR * 0.045)
        nz = highpass(noise(n), 0.25)
        env = env_exp(n, 55)
        return dusty([x * e for x, e in zip(nz, env)])

    def hihat_open():
        n = int(SR * 0.28)
        nz = highpass(noise(n), 0.25)
        env = env_exp(n, 7)
        return dusty([x * e for x, e in zip(nz, env)])

    def clap():
        n = int(SR * 0.22)
        out = [0.0] * n
        burst_n = int(SR * 0.02)
        for off in (0, int(SR * 0.014), int(SR * 0.028)):
            nz = highpass(noise(burst_n), 0.1)
            env = env_exp(burst_n, 30)
            for i, (x, e) in enumerate(zip(nz, env)):
                idx = off + i
                if idx < n:
                    out[idx] += x * e * 0.55
        return dusty(out)

    def tom():
        n = int(SR * 0.25)
        body = sine(140, 75, n)
        env = env_exp(n, 9)
        return dusty([b * e for b, e in zip(body, env)])

    def rim():
        n = int(SR * 0.06)
        tone = sine(800, 500, n)
        env = env_exp(n, 45)
        return dusty([t * e for t, e in zip(tone, env)])

    def cowbell():
        n = int(SR * 0.25)
        a = sine(500, 500, n)
        b = sine(740, 740, n)
        env = env_exp(n, 11)
        return dusty([((x + y) * 0.5) * e for x, y, e in zip(a, b, env)])

    return {
        "kick": kick(), "snare": snare(), "hihat-closed": hihat_closed(), "hihat-open": hihat_open(),
        "clap": clap(), "tom": tom(), "rim": rim(), "cowbell": cowbell(),
    }


KITS = {
    "808": kit_808,
    "909": kit_909,
    "lofi": kit_lofi,
}


def main():
    for kit_id, builder in KITS.items():
        samples = builder()
        for name, data in samples.items():
            write_wav(kit_id, name, data)


if __name__ == "__main__":
    main()
