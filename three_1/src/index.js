var THREE = require('three');

var clock = new THREE.Clock();
var scene = new THREE.Scene();
var cubes = [];

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x111111, 1);
document.body.appendChild(renderer.domElement);

var camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 100, 100);
camera.lookAt(new THREE.Vector3(0, 0, 0));
camera.position.y = 30;

var light = new THREE.PointLight(0xFFFFFF);
light.position.set(10, 0, 25);
scene.add(light);

var boxGeometry = new THREE.BoxGeometry(20, 50, 20);

var boxCount = 12;
for (var i = 0; i < boxCount; i++) {
    var boxMaterial = new THREE.MeshLambertMaterial({color: 0xffcc00});
    var cube = new THREE.Mesh(boxGeometry, boxMaterial);
    var angle = 360 / boxCount * Math.PI / 180 * i;
    cube.position.x = Math.cos(angle) * 100;
    cube.position.z = Math.sin(angle) * 100;
    cubes.push(cube);
    scene.add(cube);
}

var render = function () {
    requestAnimationFrame(render);

    for (var i = 0; i < cubes.length; i++) {
        cubes[i].rotation.y += 0.1;
    }
    camera.updateProjectionMatrix();

    var radius = 100;
    camera.position.x = radius * Math.sin(clock.getElapsedTime());
    camera.position.z = radius * Math.cos(clock.getElapsedTime());
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    renderer.render(scene, camera);
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
