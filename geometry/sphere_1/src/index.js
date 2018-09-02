import * as THREE from 'three';

const vertexShader = require('webpack-glsl-loader!./shader/vertexShader.vert');
const fragmentShader = require('webpack-glsl-loader!./shader/fragmentShader.frag');

const clock = new THREE.Clock();
const scene = new THREE.Scene();

const backgroundColor = 0x000000;
scene.fog = new THREE.FogExp2(backgroundColor, 0.001);

const uniform = {
    time: {
        type: 'f',
        value: 1.0
    },
    resolution: {
        type: "v2",
        value: new THREE.Vector2()
    },
};

const objectGroup = new THREE.Group();

const createMesh = function (radius) {
    const geometry = new THREE.SphereBufferGeometry(radius, 100, 100);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: uniform.time,
            resolution: {
                type: "v2",
                value: new THREE.Vector2(radius, radius)
            },
            baseColor: {
                type: "v3",
                value: new THREE.Vector3(Math.random(), Math.random(), Math.random())
            }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    material.side = THREE.DoubleSide;

    return new THREE.Mesh(geometry, material);
};

const createMeshes = function (radius, count, step) {
    for (let i = 0; i < count; i++) {
        const mesh = createMesh(radius + i * step);

        mesh.position.x = 0;
        mesh.position.y = 0;
        mesh.position.z = 0;
        mesh.rotation.x = Math.random() * 360;
        mesh.rotation.y = Math.random() * 360;

        objectGroup.add(mesh);
    }

    return objectGroup;
};

const objCount = 4;
const objStep = 20;
const objMinRadius = window.innerHeight / 2 / 20;
const objMaxRadius = objMinRadius + ((objCount - 1) * objStep);
scene.add(createMeshes(objMinRadius, objCount, objStep));

// Camera
const cameraDistance = objMaxRadius * 3.0;
const fov = 45;
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100000);
const cameraLookAt = new THREE.Vector3(0, 0, 0);
camera.position.set(0, 0, cameraDistance);
camera.lookAt(cameraLookAt);

const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(backgroundColor);
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);

const render = function () {
    const delta = clock.getDelta();
    const time = clock.elapsedTime;

    uniform.time.value = time;

    var len = objectGroup.children.length;
    for (var i = 0; i < len; i++) {
        var object = objectGroup.children[i];
        if (object.type !== "Mesh") {
            continue;
        }
        const dir = (i % 2 === 0.0) ? 1.0 : -1.0;
        const step = delta * 0.5 * dir;
        object.rotation.x += step;
        object.rotation.y += step;
    }

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
