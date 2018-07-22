//#define GLSLIFY 1

uniform vec2 resolution;
uniform float time;
uniform float totalBoxCount;
uniform float id;

varying vec2 vUv;

float random(in vec2 uv){
	return fract(sin(dot(uv, vec2(12.9898,78.233))) * 43758.5453);
}

float map(float value, float beforeMin, float beforeMax, float afterMin, float afterMax) {
	return afterMin + (afterMax - afterMin) * ((value - beforeMin) / (beforeMax - beforeMin));
}

float obliqueLine(vec2 uv){
	return step(0.3, fract((uv.x + uv.y + time) * 2.0));
}

void main() {
    vec2 uv = 2.0 * vUv - 1.0;

    float floatId = mod(id / totalBoxCount, 0.5);

    vec2 scaledUv = uv * 2.0;
    vec2 repeatedUv = fract(scaledUv);
    repeatedUv -= 0.5;

    float line = obliqueLine(uv);

    vec3 lineColor = vec3(0.3, line * 0.6, 0.1);
    vec3 color = vec3(floatId, 0.2, 0.8) + lineColor;

    gl_FragColor = vec4(color, 1.0);
}