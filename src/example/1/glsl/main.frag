precision highp float;

uniform float uOffset;
uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform sampler2D uDisplacementTexture;

varying vec2 vUv;
varying vec2 vUvMap1;
varying vec2 vUvMap2;

const float displacementCoef = 0.4; // 定義扭曲強度

void main() {
  vec4 displacementTexture = texture2D(uDisplacementTexture, vUv);

  // 計算位移量
  float displaceForce1 = displacementTexture.r * uOffset * displacementCoef;
  // 位移圖片，不一定要用 + 的，可以更改算式做不同方向
  vec2 uvDisplaced1 = vec2(vUvMap1.x + displaceForce1, vUvMap1.y + displaceForce1); 
  vec4 displaceTexture1 = texture2D(uTexture1, uvDisplaced1);

  // 為了讓兩張圖效果的方向反轉，這裏的需要寫成 1 - uOffset
  float displaceForce2 = displacementTexture.r * (1. - uOffset) * displacementCoef;
  vec2 uvDisplaced2 = vec2(vUvMap2.x + displaceForce2, vUvMap1.y + displaceForce2);
  vec4 displaceTexture2 = texture2D(uTexture2, uvDisplaced2);

  // 讓兩張 texture 融合在一起
  gl_FragColor = (displaceTexture1 * (1. - uOffset) + displaceTexture2 * (uOffset));
}