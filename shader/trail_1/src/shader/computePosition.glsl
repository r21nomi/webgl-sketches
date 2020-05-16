void main() {
    if (gl_FragCoord.x <= 1.0) {
        // Head of a trail
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec3 position = texture2D(texturePosition, uv).xyz;
        vec3 velocity = texture2D(textureVelocity, uv).xyz;

        position += velocity * 0.0001;
        gl_FragColor = vec4(position, 1.0);

    } else {
        // continued part of a trail
        // vec2(1.0, 0.0) means previous position of trail
        vec2 uv = (gl_FragCoord.xy - vec2(1.0, 0.0)) / resolution.xy;
        vec3 position = texture2D(texturePosition, uv).xyz;

        gl_FragColor = vec4(position, 1.0);
    }
}
