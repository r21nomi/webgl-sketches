var THREE = require('three');

var scene = new THREE.Scene();

var uniforms = {
    u_time: { type: "f", value: 1.0 },
    u_resolution: { type: "v2", value: new THREE.Vector2() },
    u_mouse: { type: "v2", value: new THREE.Vector2() }
};

var geometry = new THREE.PlaneBufferGeometry(2, 2);

var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent
});

var mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);

var camera = new THREE.Camera();
camera.position.z = 1;

var render = function () {
    uniforms.u_time.value += 0.05;
    renderer.render(scene, camera);

    requestAnimationFrame(render);
};

onResize();
render();

window.addEventListener('resize', onResize);

function onResize() {
    var width = window.innerWidth;
    var height = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    uniforms.u_resolution.value.x = renderer.domElement.width;
    uniforms.u_resolution.value.y = renderer.domElement.height;
}
