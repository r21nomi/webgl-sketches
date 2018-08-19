//#define GLSLIFY 1

attribute vec3 color;

uniform float time;
uniform float size;

varying vec4 vMvPosition;
varying vec3 vColor;

void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vMvPosition = mvPosition;
    vColor = color;

    gl_PointSize = (size + (sin(radians(time * 2.0)) * 10.0 - 10.0)) * (100.0 / length(mvPosition.xyz));
    gl_Position = projectionMatrix * mvPosition;
}
