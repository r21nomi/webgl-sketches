//#define GLSLIFY 1

uniform sampler2D texture;
uniform float time;
uniform vec2 resolution;

varying vec2 vUv;

float random(in vec2 uv){
    return fract(sin(dot(uv, vec2(12.9898,78.233))) * 43758.5453);
}

float randomTile(in vec2 uv) {
    return random(floor(uv));
}

void main( void ) {
    vec2 uv = (vUv.xy * resolution * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

    uv *= 8.0;
    vec2 newUv = fract(uv);

    vec3 color = vec3(0.0);
    color.r += random(floor(uv));
    color.gb += sin(randomTile(uv) * time * 5.0);

    gl_FragColor = vec4(color, 1.0);
}
