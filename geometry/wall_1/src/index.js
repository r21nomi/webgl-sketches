import * as THREE from 'three';

let TWEEN = require('@tweenjs/tween.js');

const vertexShader = require('webpack-glsl-loader!./shader/vertexShader.vert');
const fragmentShader = require('webpack-glsl-loader!./shader/fragmentShader.frag');
const sphereFragmentShader = require('webpack-glsl-loader!./shader/sphereFragmentShader.frag');

const clock = new THREE.Clock();
const scene = new THREE.Scene();

const wallSize = 2000;

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

const objSize = 20;

const createMesh = (radius) => {
    const geometry = new THREE.SphereBufferGeometry(radius, 100, 100);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: uniform.time,
            resolution: {
                type: "v2",
                value: new THREE.Vector2(radius, radius)
            }
        },
        vertexShader: vertexShader,
        fragmentShader: sphereFragmentShader,
    });
    material.side = THREE.DoubleSide;

    return new THREE.Mesh(geometry, material);
};

const createMeshes = (radius, count) => {
    for (let i = 0; i < count; i++) {
        const degree = 2 * Math.PI * i / count;
        const mesh = createMesh(objSize);
        const x = radius * Math.cos(degree);
        const y = radius * (Math.random() * 2 - 1);
        const z = radius * Math.sin(degree);

        mesh.position.x = x;
        mesh.position.y = y;
        mesh.position.z = z;
        mesh.rotation.y = Math.random() * 360 * (Math.PI / 180);

        objectGroup.add(mesh);
    }

    return objectGroup;
};

scene.add(createMeshes(wallSize / 6, 48));
scene.add(createMeshes(wallSize / 4, 48));
scene.add(createMeshes(wallSize / 3, 48));

const createWall = (baseColor) => {
    const material = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(wallSize, wallSize, 32, 32),
        new THREE.ShaderMaterial({
            uniforms: {
                time: uniform.time,
                resolution: {
                    type: "v2",
                    value: new THREE.Vector2(wallSize, wallSize)
                },
                baseColor: {
                    type: "v3",
                    value: baseColor
                }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
        })
    );
    material.side = THREE.DoubleSide;

    return material;
};

const wallColor = new THREE.Vector3(0.0, 0.2, 0.3);

const floor = createWall(wallColor);
floor.position.y = -wallSize / 2;
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const roof = createWall(wallColor);
roof.position.y = wallSize / 2;
roof.rotation.x = Math.PI / 2;
scene.add(roof);

const wallRear = createWall(wallColor);
wallRear.position.z = -wallSize / 2;
scene.add(wallRear);

const wallRight = createWall(wallColor);
wallRight.position.x = wallSize / 2;
wallRight.rotation.y = -Math.PI / 2;
scene.add(wallRight);

const wallFront = createWall(wallColor);
wallFront.position.z = wallSize / 2;
wallFront.rotation.y = Math.PI;
scene.add(wallFront);

const wallLeft = createWall(wallColor);
wallLeft.position.x = -wallSize / 2;
wallLeft.rotation.y = Math.PI / 2;
scene.add(wallLeft);

// Camera
const fov = 45;
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(fov, aspect, 1, 9000);
const lookAt = new THREE.Vector3(0, 0, 0);
camera.position.set(0, 0, 0);
camera.lookAt(lookAt);

const renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);

const render = (t) => {
    TWEEN.update(t);

    const delta = clock.getDelta();
    const time = clock.elapsedTime;

    uniform.time.value = time;

    const len = objectGroup.children.length;
    for (let i = 0; i < len; i++) {
        const object = objectGroup.children[i];
        if (object.type !== "Mesh") {
            continue;
        }
        object.rotation.x += delta * 4;
    }

    lookAt.x = Math.sin(time * 30 * (Math.PI / 180));
    lookAt.y = Math.sin(time * 30 * (Math.PI / 180));
    lookAt.z = Math.cos(time * 20 * (Math.PI / 180));
    camera.lookAt(lookAt);
    renderer.render(scene, camera);

    requestAnimationFrame(render);
};

const tween = () => {
    const time = clock.elapsedTime;

    const x = Math.sin(time * 80 * Math.random() * (Math.PI / 180));
    const y = Math.sin(time * 80 * Math.random() * (Math.PI / 180));
    const z = Math.cos(time * 80 * Math.random() * (Math.PI / 180));

    const coords = {
        x: lookAt.x,
        y: lookAt.y,
        z: lookAt.z
    };

    new TWEEN.Tween(coords)
        .to({x: x, y: y, z: z}, 1000)
        .easing(TWEEN.Easing.Exponential.Out)
        .onUpdate(function () {
            lookAt.x = coords.x;
            lookAt.y = coords.y;
            lookAt.z = coords.z;
            camera.lookAt(lookAt);
        })
        .onComplete(function () {
            tween();
        })
        .start();
};

onResize();
render();
// tween();

window.addEventListener("resize", onResize);

function onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
}
