import * as THREE from 'three';

const clock = new THREE.Clock();
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();

let camera, geometry;

const init = () => {
    scene.background = new THREE.Color(0x551199);
    scene.fog = new THREE.FogExp2(0x551199, 0.0003);

    initCamera();

    document.body.appendChild(renderer.domElement);
};

const initCamera = () => {
    const fov = 45;
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(fov, aspect, 1, 10000);
    camera.position.y = 120;

    createMesh();
};

const createMesh = () => {
    geometry = new THREE.PlaneBufferGeometry(20000, 20000, 128, 128);
    geometry.rotateX(-Math.PI / 2);

    const texture = new THREE.TextureLoader().load('images/paper.jpg');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 5);

    const material = new THREE.MeshBasicMaterial({
        color: 0xFF028A,
        map: texture,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
};

const render = () => {
    clock.getDelta();
    const time = clock.getElapsedTime();

    const position = geometry.attributes.position;

    for (let i = 0, len = position.count; i < len; i++) {
        let y = 30 * Math.sin(i / 2 + (time * 5 + i));

        if (i % 14 === 0) {
            y *= 3;
        }
        position.setY(i, y);
    }

    position.needsUpdate = true;

    const cameraDistance = 500;
    const cameraTime = time * 0.2;
    camera.position.x = cameraDistance * Math.sin(cameraTime);
    camera.position.z = cameraDistance * Math.cos(cameraTime);
    camera.lookAt(new THREE.Vector3(0, camera.position.y, 0));

    renderer.render(scene, camera);

    requestAnimationFrame(render);
};

const onResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setPixelRatio(window.deviceRatio);
    renderer.setSize(width, height);
};

window.addEventListener('resize', onResize);

init();

onResize();
render();
