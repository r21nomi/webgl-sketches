//#define GLSLIFY 1

uniform vec2 resolution;
uniform float time;
uniform float totalBoxCount;
uniform float id;

varying vec2 vUv;

void main(void) {
    vec2 uv = 2.0 * vUv - 1.0;

    float pluralRing =  sin(length(uv) * 20.0 + time * 10.0);

    float circle = step(0.5, pluralRing);

    vec3 color =vec3(1.0, circle * 0.2, circle * 0.7);

	gl_FragColor = vec4(color, 1.0);
}