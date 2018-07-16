var THREE = require('three');
var vertexShader = require('webpack-glsl-loader!./shader/vertexShader.vert');
var fragmentShader = require('webpack-glsl-loader!./shader/fragmentShader.frag');

var clock = new THREE.Clock();
var scene = new THREE.Scene();

var uniforms = {
    time: { type: "f", value: 1.0 },
    resolution: { type: "v2", value: new THREE.Vector2() }
};

var boxCount = 5;
var boxSize = window.innerWidth / boxCount;
var windowWidth = window.innerWidth;

for (var x = 0; x < boxCount; x++) {
    for (var y = 0; y < boxCount; y++) {
        for (var z = 0; z < boxCount; z++) {
            var s = boxSize * 0.5;
            var geometry = new THREE.BoxBufferGeometry(s, s, s);

            var material = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: vertexShader,
                fragmentShader: fragmentShader
            });

            var boxMesh = new THREE.Mesh(geometry, material);
            boxMesh.position.x = x * boxSize - windowWidth / 2 + boxSize / 2;
            boxMesh.position.y = y * boxSize - windowWidth / 2 + boxSize / 2;
            boxMesh.position.z = z * boxSize - windowWidth / 2 + boxSize / 2;

            scene.add(boxMesh);
        }
    }
}

// Camera
const fov = 40;
const aspect = window.innerWidth / window.innerHeight;
const zNear = 1;
const zFar = 3000;
var camera = new THREE.PerspectiveCamera(fov, aspect, zNear, zFar);

var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xdddddd);
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);

var render = function () {
    // Get time diff since last update.
    // https://threejs.org/docs/#api/core/Clock.getDelta
    var delta = clock.getDelta();
    var time = clock.elapsedTime;

    var radius = windowWidth * 2;
    const rotationX = radius * Math.sin(time * 0.5);
    const rotationZ = radius * Math.cos(time * 0.5);

    camera.position.x = rotationX;
    camera.position.y = 1000;
    camera.position.z = rotationZ;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    for (var i = 0; i < scene.children.length; i++) {
        var object = scene.children[i];
        object.rotation.x += delta * 0.5;
        object.rotation.y += delta * 0.5;
    }

    uniforms.time.value = time;

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
