varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vColor;

uniform vec2 uResolution;
uniform float uTime;


void main() {

    gl_FragColor = vec4(vColor, 1.);
}