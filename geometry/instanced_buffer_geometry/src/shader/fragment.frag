varying vec2 vUv;
varying float vTextureType;

uniform sampler2D texture1;
uniform sampler2D texture2;
uniform sampler2D texture3;

void main() {
    vec4 c = vec4(1.0, 0.0, 0.0, 1.0);

    if (vTextureType <= 1.1) {
        c = texture2D(texture1, vUv);
    } else if (vTextureType <= 2.1) {
        c = texture2D(texture2, vUv);
    } else if (vTextureType <= 3.1) {
        c = texture2D(texture3, vUv);
    }

    gl_FragColor = vec4(c);
}
