//#define GLSLIFY 1
// Referenced from http://glslsandbox.com/e#48463.0

uniform sampler2D texture;
uniform float time;
uniform vec2 resolution;
uniform vec3 baseColor;

varying vec2 vUv;

vec2 directionalWaveNormal(vec2 uv, float amp, vec2 dir, float freq, float speed, float k) {
    float a = dot(uv, dir) * freq + time * speed;
    float b = 7.5 * k * freq * amp * pow((sin(a) + 1.0) * 0.5, k - 1.0) * cos(a);
    return vec2(dir.x * b, dir.y * b);
}

vec3 summedWaveNormal(vec2 uv) {
    vec2 sum = vec2(0.0);
    sum += directionalWaveNormal(uv, 0.5, normalize(vec2(1, 1)), 5.0, 1.5, 1.0);
    sum += directionalWaveNormal(uv, 0.25,normalize(vec2(1.4, 1.0)), 11.0, 2.4, 1.5);
    sum += directionalWaveNormal(uv, 0.125, normalize(vec2(-0.8, -1.0)), 10.0, 2.0, 2.0);
    sum += directionalWaveNormal(uv, 0.0625, normalize(vec2(1.3, 1.0)), 15.0, 4.0, 2.2);
    sum += directionalWaveNormal(uv, 0.03125, normalize(vec2(-1.7, -1.0)), 5.0, 1.8, 3.0);
    return normalize(vec3(-sum.x, -sum.y, 1.0));
}

void main( void ) {
    vec2 uv = (vUv.xy * resolution * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

    uv.y *= 8.0;

    vec3 normal = summedWaveNormal(uv);

    vec3 color = mix(baseColor * 5.0, vec3(0.2, 1.0, 1.0), dot(normal, normalize(vec3(0.2, 0.2, 0.5))) * 0.5);
    color = mix(color, vec3(0.9, 0.9, 2.0), pow(dot(normal, normalize(vec3(-2.0, -9.0, 0.5))) * 1.5 + 0.5, 1.0));

//    float alpha = step(0.1, 1.0 - (color.r + color.g + color.b) / 3.0);

    gl_FragColor = vec4(vec3(1.0) - color, 1.0);
}