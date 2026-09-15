import { fragmentShader } from './common';

// Ported verbatim from a real Quartz Composer patch (OpArtSeries1-11.qtz) --
// a single-pass generative pattern, no feedback/accumulation. The original
// patch left six control inputs (A-F) static at 0.0 and unconnected; here
// they're wired up as u_a..u_f so a host (ReactiveVibeWindow) can drive them
// live, VDMX "Audio Colors"-style: u_f is the hue offset, so sweeping it
// over time and spiking it on a hit reproduces that plugin's hue-shifts-
// with-the-signal feel even though this node itself just takes numbers.
export const OP_ART_FRAGMENT_SHADER = fragmentShader(
  `
uniform float u_a;
uniform float u_b;
uniform float u_c;
uniform float u_d;
uniform float u_e;
uniform float u_f;
`,
  `
vec3 opArtHsv(float h, float s, float v) {
  return mix(vec3(1.0), clamp(abs(fract(h + vec3(1.3, 0.75, 0.3) / 3.0) * 6.0 - 3.0) - 1.0, 0.0, 1.0), s) * v;
}

void main() {
  vec2 uv = 2.0 * v_uv - 1.0;

  uv *= 1.0 - length(uv * 0.5 + u_a);
  uv *= sin(length(cos(u_time + uv.x * 2.0 + u_b) * sin(u_time + uv.y * 2.0 + u_c)));
  uv += cos(uv.x * 16.0 + u_d) * sin(u_time + uv.y * 16.0 + u_e);

  float r = length(uv);
  outColor = r * vec4(opArtHsv(u_f - r * 5.0, 1.0, 1.0), 1.0);
}
`
);
