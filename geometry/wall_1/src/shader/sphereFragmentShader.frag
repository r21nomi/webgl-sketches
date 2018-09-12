#define GLSLIFY 1

uniform sampler2D texture;
uniform float time;
uniform vec2 resolution;

varying vec2 vUv;

void main( void ) {
    vec2 uv = (vUv.xy * resolution * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

    uv *= sin(length(uv * fract(time) * 10.0));

    float r = 0.15 * abs(sin(time * cos(time * 5.0))) / abs(0.5 - length(uv));
    float g = 0.18 * abs(sin(time * cos(time * 5.0)) + 1.0) / abs(0.46 - length(uv));
    float b = 0.15 * abs(sin(time * cos(time * 5.0))) / abs(0.54 - length(uv));

    gl_FragColor = vec4(vec3(r, g * 0.1, b), 1.0);
}