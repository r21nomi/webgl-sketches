//#define GLSLIFY 1

uniform vec2 resolution;
uniform float time;
uniform float totalBoxCount;
uniform float id;
uniform float colorOffset;

varying vec2 vUv;

float random(in vec2 uv){
    return fract(sin(dot(uv, vec2(12.9898,78.233))) * 43758.5453);
}

float map(float value, float beforeMin, float beforeMax, float afterMin, float afterMax) {
    return afterMin + (afterMax - afterMin) * ((value - beforeMin) / (beforeMax - beforeMin));
}

float obliqueLine(vec2 uv){
    return length(fract((uv.x + uv.y + time) * 6.0 * colorOffset) * 2.0 - 1.0);
}

void main() {
    vec2 uv = 2.0 * vUv - 1.0;

    float floatId = mod(id / totalBoxCount, 0.5);

    float line = 0.3 / obliqueLine(uv);

    vec3 color = vec3(floatId, colorOffset, floatId) * line;

    gl_FragColor = vec4(color, 1.0);
}