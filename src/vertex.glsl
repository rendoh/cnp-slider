#include ./curl-noise

const int LENGTH = 1;

uniform float uTime;
uniform float uProgress;
uniform float uPixelRatio;
uniform float uDistortionRange;
uniform float uDistortionStrength;
uniform float uDistortionFrequency;
varying vec2 vUv;

const float PI = 3.1415926535897932384626433832795;

float easeInOutSine(float x) {
  return -(cos(PI * x) - 1.) / 2.;
}

void main() {
  vec3 pos = position;
  float progress = 1. - fract(uProgress);
  vec3 distortion = easeInOutSine(1. - min(distance(uv.x - (progress - .5) * uDistortionRange, progress) * (2. / uDistortionRange), 1.)) * curlNoise(vec3(position * uDistortionFrequency + uTime * .3)) * uDistortionStrength;
  pos = pos + distortion;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos.xyz, 1.0);
  gl_PointSize = uPixelRatio;
  vUv = uv;
}
