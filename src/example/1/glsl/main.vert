attribute vec2 uv;
attribute vec2 position;

uniform vec2 uRepeat1;
uniform vec2 uOffset1;
uniform vec2 uRepeat2;
uniform vec2 uOffset2;

varying vec2 vUv;
varying vec2 vUvMap1;
varying vec2 vUvMap2;

void main() {
  vUv = uv;

  vUvMap1 = uv;
  vUvMap1 *= uRepeat1;
  vUvMap1 += uOffset1;

  vUvMap2 = uv;
  vUvMap2 *= uRepeat2;
  vUvMap2 += uOffset2;

  gl_Position = vec4(position, 0, 1);
}