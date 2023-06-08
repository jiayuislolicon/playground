varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPattern;

uniform vec2 uResolution;
uniform float uTime;
uniform float uDisplace;
uniform float uSpread;
uniform float uNoise;

#define PI 3.14159265358979

// NOISE: https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float noise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}

float lines(vec2 uv, float offset) {
    return smoothstep(
        0., 0.5 + offset * 0.5,
        abs(0.5 * (sin(uv.x * 10.)) + offset * 2.));
}

// 如果不確定怎麼寫matrix，可以參照這裡: https://github.com/dmnsgn/glsl-rotate/blob/main/rotation-2d.glsl
mat2 rotate2D(float angle) {
    return mat2 (
        cos(angle), -sin(angle),
        sin(angle), cos(angle)
    );
}

void main() {
    vec3 color1 = vec3(120. / 255., 158. / 255., 113. / 255.);
    vec3 color2 = vec3(0., 0., 0.);
    vec3 color3 = vec3(224. / 255., 148. / 255., 66. / 255.);

    float n = noise(vPosition + uTime);
    vec2 baseUV = rotate2D(n) * vPosition.xy * 0.1;

    float basePattern = lines(baseUV * 2., 0.3);
    float secondPattern = lines(baseUV * 2., 0.1);

    vec3 baseColor = mix(color1, color3, basePattern);
    vec3 secondBaseColor = mix(baseColor, color2, secondPattern);



    gl_FragColor = vec4(secondBaseColor , 1.);
}