import * as THREE from 'three';

const NAMES = {
    POINT: "point"
};
const clock = new THREE.Clock();
const scene = new THREE.Scene();
scene.background = new THREE.Color(`#ff0000`);

const getStageSize = () => {
    const s = Math.min(window.innerWidth, window.innerHeight);
    return {
        width: s,
        height: s
    };
};

const toRadian = (degree) => {
    return degree * Math.PI / 180;
};

const objectGroup = new THREE.Group();

const createMeshes = () => {
    const mesh1 = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(
            getStageSize().width,
            getStageSize().height
        ),
        new THREE.MeshBasicMaterial({
            color: `#ffcc00`
        })
    );
    mesh1.position.x = 0;
    mesh1.position.y = 0;
    mesh1.position.z = 0;
    // mesh1.rotation.z = toRadian(45);

    objectGroup.add(mesh1);

    const mesh2 = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(20, 20),
        new THREE.MeshBasicMaterial({
            color: `#0000ff`
        })
    );
    mesh2.name = NAMES.POINT;
    mesh2.position.x = 0;
    mesh2.position.y = 0;
    objectGroup.add(mesh2);

    // Move objects to left edge of window.
    // objectGroup.position.x = -window.innerWidth / 2;

    return objectGroup;
};

scene.add(createMeshes());

// Camera
const fov = 45;
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(fov, aspect, 1, 10000);
const stageHeight = window.innerHeight;
// Make camera distance same as actual pixel value.
const z = stageHeight / Math.tan(fov * Math.PI / 360) / 2;
camera.position.z = z;

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
        if (object.name === NAMES.POINT) {
            // object.rotation.z += delta;
            object.rotation.z = toRadian(time * 360 % 360);
        }
    }

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

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
}
