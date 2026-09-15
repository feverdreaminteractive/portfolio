// Shader Lab's default shader. Ported from a real Quartz Composer patch
// (OpArtSeries1-11.qtz) and driven to mimic VDMX's "Audio Colors" plugin --
// continuously cycling hue with the warp knobs pulsing like simulated
// bass/mid/treble bands, since this editor has no live audio input to feed
// yet (see u_bass/u_mid/u_treble below -- swap those three lines for a real
// FFT feed later and everything downstream already reacts correctly).
export const AUDIO_COLORS_SHADER = `#ifdef GL_ES
precision highp float;
#endif

uniform float time;
uniform vec2 resolution;
uniform vec2 mouse;

vec3 hsv(float h, float s, float v) {
    return mix(vec3(1.0), clamp(abs(fract(h + vec3(1.3, 0.75, 0.3) / 3.0) * 6.0 - 3.0) - 1.0, 0.0, 1.0), s) * v;
}

void main(void) {
    // Simulated audio bands (0..1-ish) until a real FFT feed replaces these.
    float bass = 0.5 + 0.5 * sin(time * 1.7);
    float mid = 0.5 + 0.5 * sin(time * 3.1 + 1.7);
    float treble = 0.5 + 0.5 * sin(time * 6.3 + 4.2);

    vec2 uv = 2.0 * gl_FragCoord.xy / resolution - 1.0;
    uv.x *= resolution.x / resolution.y;

    float a = 0.15 + bass * 0.35 + (mouse.x - 0.5) * 0.3;
    float b = mid * 2.5;
    float c = mid * 2.5;
    float d = treble * 3.0;
    float e = treble * 3.0;

    uv *= 1.0 - length(uv * 0.5 + a);
    uv *= sin(length(cos(time + uv.x * 2.0 + b) * sin(time + uv.y * 2.0 + c)));
    uv += cos(uv.x * 16.0 + d) * sin(time + uv.y * 16.0 + e);

    float r = length(uv);

    // Hue drifts continuously and jumps forward on each simulated bass hit --
    // the actual "Audio Colors" signature: color, not just shape, tracks it.
    float hue = time * 0.08 + bass * 0.6 + mouse.y * 0.4 - r * 5.0;

    vec3 color = r * hsv(hue, 1.0, 1.0);
    gl_FragColor = vec4(color, 1.0);
}`;
