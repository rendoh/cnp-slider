const int LENGTH = 1;

uniform float uProgress;
uniform sampler2D uTextures[LENGTH];
varying vec2 vUv;

float calcStrength(float offset) {
  float p = uProgress - offset;
  return clamp(p - ((1. - vUv.x) - p) * 5., 0., 1.);
}

void main() {
  vec4 color;
  vec4 tex;

  tex = texture2D(uTextures[0], vUv);
  color = tex;

  // This part is dynamically rewritten on runtime
  #include <mix-textures>

  gl_FragColor = color;
}
