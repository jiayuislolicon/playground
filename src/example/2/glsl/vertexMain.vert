  vec3 coords = normal;
  coords.y += uTime;
  vec3 noisePattern = vec3(noise(coords));
  float pattern = wave(noisePattern);

  vDisplacement = pattern;

  float displacement = vDisplacement / 10.0;
  // 這裡會這麼改寫可以參照原本的檔案<displacementmap_vertex>
  // 最後一行計算，乘上我們想要的扭曲變化
  transformed += normalize(objectNormal) * displacement;

