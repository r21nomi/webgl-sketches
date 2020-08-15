attribute vec3 offsetPos;
attribute float textureType;
attribute float delay;
attribute float sizeOffset;

varying vec3 vViewPosition;
varying vec2 vUv;
varying float vTextureType;
uniform float time;

float PI = 3.141592653589793;

highp mat2 rotate(float rad){
    return mat2(cos(rad),sin(rad),-sin(rad),cos(rad));
}

float ease_out_back(float x) {
    float t=x; float b=0.; float c=1.; float d=1.;
    float s = 1.70158;
    return c*((t=t/d-1.)*t*((s+1.)*t + s) + 1.) + b;
}

void main() {
    vUv = uv;
    vTextureType = textureType;

    vec3 pos = position;

    float duration = 1.0;
    if (delay > time) {
        duration = 0.0;
    } else {
        duration = ease_out_back(min(1.0, (time - delay) * 0.4));
    }
    pos.xy *= rotate(time * 0.1);
    pos *= duration * sizeOffset;

    vec4 mvPosition = modelViewMatrix * vec4(pos + offsetPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    vViewPosition = -mvPosition.xyz;
}