//#define GLSLIFY 1

uniform vec2 resolution;
uniform float time;

varying vec2 vUv;

float map(float value, float beforeMin, float beforeMax, float afterMin, float afterMax) {
	return afterMin + (afterMax - afterMin) * ((value - beforeMin) / (beforeMax - beforeMin));
}

void main() {
    vec2 uv = 2.0 * vUv - 1.0;

    vec2 scaledUv = uv * 4.0;
    vec2 repeatedUv = fract(scaledUv);
    repeatedUv -= 0.5;

    float radius = map(sin(time * 1.2), -1.0, 1.0, 0.2, 0.4);
    float circle = step(radius, length(repeatedUv));

    vec3 color = vec3(circle, circle, 1.0);

    gl_FragColor = vec4(color, 1.0);
}