precision mediump float;

uniform vec2 resolution;
uniform float time;
uniform float isDev;
uniform float isThumbnail;
uniform float animaZOffset;
uniform float id;
uniform sampler2D texture;
uniform vec2 textureResolution;

varying vec2 vUv;
varying vec2 vResolution;

const float PI = 3.1415926535897932384626433832795;

void main() {
    vec2 uv = (vUv.xy * vResolution * 2.0 - vResolution.xy) / min(vResolution.x, vResolution.y);
    vec2 uv3 = (vUv.xy * vResolution) / min(vResolution.x, vResolution.y);

    vec2 uv2 = uv + vec2(cos(time), sin(time)) * 0.3;
    float f = step(0.5, 1.0 - length(uv2));

    if (f == 0.0) discard;

    float ff = step(0.5, fract(length(uv2) * 10.0 - time * 5.0));
    vec3 color = mix(vec3(0.0, 0.0, uv3.x), vec3(0.91), ff);

    gl_FragColor = vec4(color, 1.0);
}