// Refer to https://github.com/mrdoob/three.js/blob/dev/examples/webgl_shader2.html

var THREE = require('three');
var vertexShader = require('webpack-glsl-loader!./shader/vertexShader.vert');
var fragmentShader = require('webpack-glsl-loader!./shader/fragmentShader.frag');

var clock = new THREE.Clock();
var scene = new THREE.Scene();

// Camera
const fov = 40;
const aspect = window.innerWidth / window.innerHeight;
const zNear = 1;
const zFar = 3000;
var camera = new THREE.PerspectiveCamera(fov, aspect, zNear, zFar);
camera.position.z = 4;

var uniforms = {
    time: { type: "f", value: 1.0 },
    resolution: { type: "v2", value: new THREE.Vector2() }
};

var geometry = new THREE.BoxBufferGeometry(0.75, 0.75, 0.75);

var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
});

var mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

var renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);

var render = function () {
    // Get time diff since last update.
    // https://threejs.org/docs/#api/core/Clock.getDelta
    var delta = clock.getDelta();

    var object = scene.children[0];
    object.rotation.x += delta * 0.5;
    object.rotation.y += delta * 0.5;

    uniforms.time.value = clock.elapsedTime;

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

    uniforms.resolution.value.x = renderer.domElement.width;
    uniforms.resolution.value.y = renderer.domElement.height;
}
