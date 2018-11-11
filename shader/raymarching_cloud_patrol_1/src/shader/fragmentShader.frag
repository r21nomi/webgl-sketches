/**
 * Refer to https://codepen.io/shubniggurath/pen/GwgZrB
 */
#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

varying vec2 vUv;

float map(float value, float beforeMin, float beforeMax, float afterMin, float afterMax) {
    return afterMin + (afterMax - afterMin) * ((value - beforeMin) / (beforeMax - beforeMin));
}

mat2 rotate2d(float angle){
    return mat2(cos(angle), -sin(angle),  sin(angle), cos(angle));
}

float cellDist(in vec3 p, float width) {
    p = fract(p);
    p -= 0.5;
    return length(max(abs(p) - width, 0.0));
}

float trigNoise3D(in vec3 p) {
    float res = 0.0;
    float sum = 0.0;

    float cellWidth = 0.1;
    float cell = cellDist(p * 5.0 + time * 2.1, cellWidth);
    vec3 t = sin(p * PI + cos(p * PI + 1.57 / 2.0)) * 0.5 + 0.5;
    p = p * 1.5 + (t - 1.5);
    res += (dot(t, vec3(0.333)));

    t = sin(p.yzx * PI + cos(p.zxy * PI + 1.57 / 2.0)) * 0.5 + 0.5;
    res += (dot(t, vec3(0.333))) * 0.7071;

    return (res / 1.7171) * 0.85 + cell * 0.15;
}

float world(in vec3 p) {
    float n = trigNoise3D(p * 0.1) * 10.0;
    p.y += n;
    return p.y;
}

vec3 path(float p) {
    return vec3(sin(p * 0.2) * 10.0, cos(p * 0.3), p);
}

void main( void ) {
    vec2 uv = 2.0 * vUv - 1.0;

    float modtime = time * 3.0;
    vec3 movement = path(modtime);

    vec3 cameraPosition = vec3(0.0, 0.0, -1.0) + movement;
    vec3 lookAt = vec3(0.0, 0.0, 0.0) + path(modtime);

    vec3 forward = normalize(lookAt - cameraPosition);
    vec3 right = normalize(vec3(forward.z, 0.0, -forward.x));
    vec3 up = normalize(cross(forward, right));

    float FOV = 1.0;

    vec3 rayOrigin = cameraPosition;
    vec3 rayDistance = normalize(forward + FOV * uv.x * right + FOV * uv.y * up);
    rayDistance.xy = rotate2d(movement.x * 0.05) * rayDistance.xy;

    vec3 lp = vec3(0.0, -10.0, 10.5);
    lp += rayOrigin;

    float localDensity = 0.1;
    float density = 0.1;
    float weighting = 0.0;

    float dist = 1.0;
    float currentRayLength = 0.0;

    const float distanceThreshold = 0.3;

    vec3 color = vec3(0.2);

    for (int i = 0; i < 64; i++) {
    if (currentRayLength > 80.0) {
        currentRayLength = 80.0;
        break;
    }
    vec3 sp = rayOrigin + rayDistance * currentRayLength;
    dist = world(sp);

    if (dist < 0.3) {
        dist = 0.25;
    }

    localDensity = (distanceThreshold - dist) * step(dist, distanceThreshold);
    weighting = (1.0 - density) * localDensity;

    vec3 ld = lp - sp;
    float lDist = max(length(ld), 000.1);
    ld /= lDist;

    float atten = 1.0 / (lDist * 0.125 + lDist * lDist * 0.55);
    color += weighting * atten * 1.25;

    currentRayLength += max(dist * 0.2, 0.02);
    }

    vec3 sunDir = normalize(lp - rayOrigin);
    float sunF = 1.0 - dot(rayDistance, sunDir);

    color = mix(
        mix(vec3(0.5), vec3(1.0), color * density * 5.0),
        vec3(0.0),
        color
    );

    color = mix(color, vec3(4.0), (5.0 - density) * 0.01 * (1.0 + sunF * 0.5));
    color = mix(
        color,
        mix(vec3(0.4, 0.3, 0.2) * 3.0, vec3(1.0, 0.0, 0.8) * 0.7, sunF * sunF),
        currentRayLength * 0.01
    );

    color *= color * color * color * 3.0;
    color.g *= map(sin(time), -1.0, 1.0, 0.3, 0.5);

    gl_FragColor = vec4(color, 1.0);
}