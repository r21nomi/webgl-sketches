var THREE = require('three');
var vertexShader = require('webpack-glsl-loader!./shader/vertexShader.vert');
var fragmentShader = require('webpack-glsl-loader!./shader/fragmentShader.frag');

var scene = new THREE.Scene();

var uniforms = {
    time: { type: "f", value: 1.0 },
    resolution: { type: "v2", value: new THREE.Vector2() }
};

var geometry = new THREE.PlaneBufferGeometry(2, 2);

var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
});

var mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);

var camera = new THREE.Camera();
camera.position.z = 1;

var render = function () {
    uniforms.time.value += 0.05;
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
