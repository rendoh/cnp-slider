uniform float uTime;
uniform float uProgress;
uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
varying vec2 vUv;

void main() {
  vec4 color1 = texture2D(uTexture1, vUv);
  vec4 color2 = texture2D(uTexture2, vUv);
  gl_FragColor = mix(color1, color2, clamp(uProgress - (vUv.x - uProgress) * 5., 0., 1.));
}
