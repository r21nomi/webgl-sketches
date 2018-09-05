var THREE = require('three');

var clock = new THREE.Clock();
var scene = new THREE.Scene();
var cubes = [];

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor( 0x282373 );
document.body.appendChild(renderer.domElement);

const fov = 75;
const aspect = window.innerWidth / window.innerHeight;
const zNear = 0.1;
const zFar = 1000;
var camera = new THREE.PerspectiveCamera(fov, aspect, zNear, zFar);
camera.position.set(0, 400, 0);
camera.lookAt(new THREE.Vector3(0, 0, 0));

var light = new THREE.PointLight(0xFFFFFF);
light.position.set(0, 0, 0);
scene.add(light);

var boxGeometry = new THREE.BoxGeometry(20, 20, 20);

var boxCount = 12;
var boxSize = window.innerWidth / boxCount;
var windowWidth = window.innerWidth;

for (var x = 0; x < boxCount; x++) {
    for (var y = 0; y < boxCount; y++) {
        for (var z = 0; z < boxCount; z++) {

            var boxMaterial = new THREE.MeshLambertMaterial({color: 0xffcc00});
            var cube = new THREE.Mesh(boxGeometry, boxMaterial);
            cube.position.x = x * boxSize - windowWidth / 2;
            cube.position.y = y * boxSize - windowWidth / 2;
            cube.position.z = z * boxSize - windowWidth / 2;
            cubes.push(cube);
            scene.add(cube);
        }
    }
}

var render = function () {
    const time = clock.getElapsedTime();

    for (var i = 0; i < cubes.length; i++) {
        cubes[i].rotation.y += 0.1;

        const maxScaleValue = 1.5;
        const minScaleValue = 0.5;
        const scaleSpeed = time * 5.0 + (i * 10.0);
        const scale = Math.abs(Math.sin(scaleSpeed)) * maxScaleValue + minScaleValue;
        cubes[i].scale.x = scale;
        cubes[i].scale.y = scale;
        cubes[i].scale.z = scale;
    }
    camera.updateProjectionMatrix();

    var radius = 1000;
    const rotationX = radius * Math.sin(time);
    const rotationZ = radius * Math.cos(time);

    camera.position.x = rotationX;
    camera.position.z = rotationZ;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    light.position.x = rotationX;
    light.position.z = rotationZ;

    renderer.render(scene, camera);

    requestAnimationFrame(render);
};

render();

window.addEventListener('resize', onResize);

function onResize() {
    var width = window.innerWidth;
    var height = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}
