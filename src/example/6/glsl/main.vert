varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPattern;

attribute float aRandom;

uniform vec2 uResolution;
uniform float uTime;
uniform float uDisplace;
uniform float uSpread;
uniform float uNoise;


void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;

    // vPosition = vNormal + aRandom;
    vPosition += aRandom * (0.5 * sin(uTime) + 0.5) * vNormal;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
}