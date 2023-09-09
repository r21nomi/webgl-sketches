precision mediump float;

uniform vec2 resolution;
uniform float time;
uniform sampler2D texture;

varying vec2 vUv;
varying vec2 vResolution;

void main() {
    vec4 color = texture2D(texture, vUv);
    gl_FragColor = color;
}