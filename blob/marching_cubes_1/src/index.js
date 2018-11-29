/* globals THREE */

window.THREE = require("three");
require("three/examples/js/MarchingCubes.js");

let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;

let scene, camera, clock, marchingCubes, renderer, light, pointLight, ambientLight;

const blobsCount = 20;

const init = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xff0099);

    clock = new THREE.Clock();

    // Camera
    camera = new THREE.PerspectiveCamera(45, windowWidth / windowHeight, 1, 10000);
    camera.position.set(0, 0, 300);

    // Light
    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0.5, 0.5, 1.0);
    scene.add(light);

    pointLight = new THREE.PointLight(0x0022DE);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);

    // Renderer
    const resolution = 48;
    const material = new THREE.MeshPhongMaterial({color: 0xff00ff, specular: 0x111111, shininess: 10});

    marchingCubes = new THREE.MarchingCubes(resolution, material, true, true);
    marchingCubes.position.set(0, 0, 0);
    marchingCubes.scale.set(100, 100, 100);

    scene.add(marchingCubes);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(windowWidth, windowHeight);

    document.body.appendChild(renderer.domElement);

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    renderer.autoClear = false;
};

const updateCubes = (object, time) => {
    object.reset();

    let i, ballx, bally, ballz, subtract, strength;
    subtract = 18;
    strength = 1.2 / ((Math.sqrt(blobsCount) - 1) / 4 + 1);

    for (i = 0; i < blobsCount; i++) {
        ballx = Math.sin(i + 1.26 * time * (1.03 + 0.5 * Math.cos(0.21 * i))) * 0.27 + 0.5;
        bally = Math.cos(i + 1.12 * time * Math.cos(1.22 + 0.1424 * i)) * 0.27 + 0.5;
        ballz = Math.cos(i + 1.32 * time * 0.1 * Math.sin((0.92 + 0.53 * i))) * 0.27 + 0.5;
        object.addBall(ballx, bally, ballz, strength, subtract);
    }
};

const render = () => {
    const delta = clock.getDelta();
    const time = clock.elapsedTime;

    updateCubes(marchingCubes, time);

    const cameraX = 300 * Math.sin(time * 80 * (Math.PI / 180));
    const cameraZ = 300 * Math.cos(time * 80 * (Math.PI / 180));

    camera.position.x = cameraX;
    camera.position.y = cameraX;
    camera.position.z = cameraZ;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    light.position.x = cameraX;
    light.position.z = cameraZ;

    renderer.render(scene, camera);

    requestAnimationFrame(render);
};

const onResize = () => {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    camera.aspect = windowWidth / windowHeight;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(windowWidth, windowHeight);
};

window.addEventListener("resize", onResize);

init();
onResize();
render();