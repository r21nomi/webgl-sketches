#define GLSLIFY 1

varying vec2 vUv;

uniform sampler2D texture;
uniform float time;
uniform vec2 resolution;
uniform vec3 baseColor;

const float PI = 3.14159;
const float N = 90.0;

float random(float n) {
    return fract(abs(sin(n * 55.753) * 367.34));
}

void main(){
    vec2 uv = (vUv.xy * resolution * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

    uv *= 8.0;

    float brightness = 0.0;
    float speed = time * 1.0;

    for (float i = 0.0;  i < N;  i++) {
        brightness += 0.002 / abs(sin(PI * uv.x) * sin(PI * uv.y) * sin(PI * speed + random(floor(uv.x )) + random(floor(uv.y))));
    }

    gl_FragColor = vec4(baseColor * brightness, 1.0);
}