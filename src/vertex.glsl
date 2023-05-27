#include ./curl-noise
uniform float uTime;
uniform float uProgress;
uniform float uPixelRatio;
varying vec2 vUv;

const float PI = 3.1415926535897932384626433832795;

float easeInOutSine(float x) {
  return -(cos(PI * x) - 1.) / 2.;
}

void main() {
  vec3 pos = position;
  float range = .5;
  vec3 distortion = easeInOutSine(1. - min(distance(uv.x - (uProgress - .5) * range, uProgress) * (2. / range), 1.)) * curlNoise(vec3(position * 0.07 + uTime * .3)) * 50.;
  pos = pos + distortion;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos.xyz, 1.0);
  gl_PointSize = uPixelRatio;
  vUv = uv;
}
