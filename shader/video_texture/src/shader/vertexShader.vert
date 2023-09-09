precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute vec2 size;
attribute vec2 padding;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float time;

varying vec2 vUv;
varying vec2 vResolution;

void main() {
    vUv = uv;
    vResolution = vec2(size.x, size.y);

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
}