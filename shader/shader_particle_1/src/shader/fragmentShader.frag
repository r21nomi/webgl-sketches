#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

const float EPS = 0.0001;

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

float circle(vec2 uv) {
    return step(0.5, length(uv));
}

float smoothCircle(vec2 uv) {
    return smoothstep(0.1, 1.0, length(uv));
}

void main(void) {
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);

    uv /= 2.0;

    for (int i = 0; i < 200; i++) {
        float f1 = mod(float(i) * 0.51, 0.28);
        float f2 = mod(float(i) * 0.88, 0.29);

        float fft1 = f1;
        float fft2 = f2;

        float r = mod(float(i) * 5.0, 0.7);
        float a = fft1 - fft2;
        a *= time;

        vec2 center = vec2(cos(a), sin(a)) * r;

        float dist = length(uv - center);

        float particleRadius = 200.0;
        float brightness = 0.5 / pow(dist * particleRadius, 2.0);

        vec3 col = vec3(1.0, 0.1, 0.1) * brightness * fft1 * 10.0;
        col += vec3(0.0, 0.5, 0.9) * brightness * fft2 * 10.0;

        gl_FragColor += vec4(col, 1.0);
    }
}