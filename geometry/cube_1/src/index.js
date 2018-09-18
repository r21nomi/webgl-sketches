import * as THREE from 'three';

const clock = new THREE.Clock();
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
scene.fog = new THREE.Fog(0x222222, 1, 10000);

const objectGroup = new THREE.Group();

const boxGeometry = new THREE.BoxBufferGeometry(100, 100, 100);
const boxMaterial = new THREE.MeshNormalMaterial();

const cameraDistance = 5000;

const createMesh = () => {
    return new THREE.Mesh(boxGeometry, boxMaterial);
};

const createMeshes = (count) => {
    for (let i = 0; i < count; i++) {
        const mesh = createMesh();
        const x = Math.random() * cameraDistance - cameraDistance / 2;
        const y = Math.random() * cameraDistance - cameraDistance / 2;
        const z = Math.random() * cameraDistance - cameraDistance / 2;

        mesh.position.x = x;
        mesh.position.y = y;
        mesh.position.z = z;

        mesh.rotation.x = Math.random() * 2 * Math.PI;
        mesh.rotation.y = Math.random() * 2 * Math.PI;

        objectGroup.add(mesh);
    }

    return objectGroup;
};

scene.add(createMeshes(800));

// Camera
const fov = 45;
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(fov, aspect, 1, 10000);

const renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);

const render = () => {
    const delta = clock.getDelta();
    const time = clock.elapsedTime;

    const len = objectGroup.children.length;
    for (let i = 0; i < len; i++) {
        const object = objectGroup.children[i];
        if (object.type !== "Mesh") {
            continue;
        }
        object.rotation.x += delta;
    }

    camera.position.x = cameraDistance * Math.sin(time * 30 * (Math.PI / 180));
    camera.position.z = cameraDistance * Math.cos(time * 30 * (Math.PI / 180));
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    renderer.render(scene, camera);

    requestAnimationFrame(render);
};

onResize();
render();

window.addEventListener("resize", onResize);

function onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
}
