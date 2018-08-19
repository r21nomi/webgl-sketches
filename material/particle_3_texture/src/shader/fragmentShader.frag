//#define GLSLIFY 1

uniform sampler2D texture;
uniform float time;

varying vec4 vMvPosition;
varying vec3 vColor;

void main() {
    float opacity = 200.0 / length(vMvPosition.xyz);

    gl_FragColor = vec4(vColor, opacity) * texture2D(texture, gl_PointCoord);
}
