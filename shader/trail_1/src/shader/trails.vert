uniform float time;
uniform vec3 bgColor;
uniform sampler2D texturePosition;
varying vec4 vColor;

// https://github.com/dmnsgn/glsl-rotate/blob/master/rotation-3d.glsl
mat4 rotation3d(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat4(
        oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s, 0.0,
        oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s, 0.0,
        oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c, 0.0,
        0.0, 0.0, 0.0, 1.0
    );
}

void main() {
    vec3 pos = texture2D(texturePosition, uv).xyz;
    vec3 headPos = texture2D(texturePosition, vec2(0.0)).xyz;

    vec3 trailColor = vec3(uv.y, 0.1, 0.6);
    vec3 c = mix(trailColor, bgColor, smoothstep(0.0, 1.0, uv.x));
    vColor = vec4(c, 1.0);

    vec3 vPos = pos + position - headPos;
    vPos = (rotation3d(vec3(1.0, 1.0, 1.0), time * 0.2) * vec4(vPos, 1.0)).xyz;

    vec4 mvPosition = modelViewMatrix * vec4(vPos, 1.0);

    gl_Position = projectionMatrix * mvPosition;
}
