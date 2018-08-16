const THREE = require("three");

let clock = new THREE.Clock();
let scene = new THREE.Scene();

let geometry = new THREE.Geometry();

const SIZE = 3000;
const LENGTH = 2000;

for (let i = 0; i < LENGTH; i++) {
    geometry.vertices.push(new THREE.Vector3(
        SIZE * (Math.random() - 0.5),
        SIZE * (Math.random() - 0.5),
        SIZE * (Math.random() - 0.5)
    ));
}

const material = new THREE.PointsMaterial({
    size: 10,
    color: 0xFFFFFF
});

const mesh = new THREE.Points(geometry, material);

scene.add(mesh);

let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight);


let renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0x111111);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);

let render = function () {
    clock.getDelta();
    let time = clock.elapsedTime * 0.2;

    let cameraDistance = 100;
    camera.position.x = cameraDistance * Math.sin(time);
    camera.position.z = cameraDistance * Math.cos(time);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    renderer.render(scene, camera);

    requestAnimationFrame(render);
};

onResize();
render();

window.addEventListener("resize", onResize);

function onResize() {
    let width = window.innerWidth;
    let height = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
}
