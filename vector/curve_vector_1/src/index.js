// Referred to https://github.com/spite/looper/blob/master/loops/25.js

import * as THREE from 'three';

const clock = new THREE.Clock();
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x100A47);
scene.fog = new THREE.Fog(0x100A47, 1, 10000);

const objectGroup = new THREE.Group();

let sphere;

const map = (value, beforeMin, beforeMax, afterMin, afterMax) => {
    return afterMin + (afterMax - afterMin) * ((value - beforeMin) / (beforeMax - beforeMin));
};

const getPointByAngle = (angle) => {
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    return {x, y};
};

const createCurveGeometry = (origin, radius, angle, length, cylinderRadius) => {
    const p = new THREE.Vector3();
    const vertices = [];

    const step = 0.1;

    for (let a = angle, len = angle + length; a < len; a += step) {
        const res = getPointByAngle(a);
        const z = Math.sin(a);
        p.set(radius * res.x, 1.25 * radius * res.y, z);
        p.add(origin);

        vertices.push(p.clone());
    }

    const path = new THREE.CatmullRomCurve3(vertices);
    return new THREE.TubeGeometry(path, 2 * vertices.length, cylinderRadius, 18, false);
};

const values = [];
const curveMaterial = new THREE.MeshStandardMaterial({
    wireframe: false,
    color: 0xffcc00,
    metalness: 0.1,
    roughness: 0.1,
    side: THREE.DoubleSide
});

const whiteMaterial = curveMaterial.clone();
whiteMaterial.color.setHex(0xFF25FF);

const blackMaterial = curveMaterial.clone();
blackMaterial.color.setHex(0x4D1AB1);

const randomInRange = (min, max) => {
    return min + Math.random() * (max - min);
};

const createObjectData = (radius, length) => {
    const r = 0.5;
    const multiplier = Math.floor(randomInRange(1, 5));
    const origin = new THREE.Vector3(randomInRange(-r, r), randomInRange(-r, r), randomInRange(-r, r));
    const start = randomInRange(0, 2 * Math.PI);
    const cylinderRadius = 0.1 * length;
    const rotation = randomInRange(-0.5, 0.5);
    const material = Math.random() > 0.25 ? (Math.random() > 0.5 ? blackMaterial : whiteMaterial) : curveMaterial;
    return {
        origin, radius, start, length, cylinderRadius, rotation, material, multiplier
    };
};

const createCurveObjects = () => {
    for (let i = 0, len = 30; i < len; i++) {
        const radius = randomInRange(4.5, 15);
        const length = randomInRange(Math.PI / 8, Math.PI / 4);
        values.push(createObjectData(radius, length));
    }
    for (let i = 0, len = 10; i < len; i++) {
        const radius = randomInRange(4.5, 5);
        const length = randomInRange(Math.PI / 4, Math.PI / 2);
        values.push(createObjectData(radius, length));
    }

    values.forEach(v => {
        const geo = createCurveGeometry(v.origin, v.radius, v.start, v.length, v.cylinderRadius);
        const mesh = new THREE.Mesh(geo, v.material);
        mesh.rotation.y = v.rotation;
        mesh.castShadow = mesh.receiveShadow = true;
        objectGroup.add(mesh);
    });

    scene.add(objectGroup);
};

const createSphere = () => {
    const geometry = new THREE.SphereBufferGeometry(2.8, 30, 15);
    const material = new THREE.MeshToonMaterial({
        color: 0xFF9F13
    });
    sphere = new THREE.Mesh(geometry, material);
    sphere.position.x = 0;
    sphere.position.y = 0;
    sphere.position.z = 0;

    scene.add(sphere);
};

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 1, 1);
directionalLight.castShadow = true;
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const light = new THREE.HemisphereLight(0xffffff, 0x333333, 0.5);
scene.add(light);

// Camera
const fov = 45;
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(fov, aspect, 1, 10000);
camera.position.set(0, 0, 20);
camera.lookAt(objectGroup.position);

const renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);

const render = () => {
    clock.getDelta();
    const time = clock.elapsedTime;

    const len = objectGroup.children.length;
    for (let i = 0; i < len; i++) {
        const object = objectGroup.children[i];
        const v = values[i];
        if (object.type !== "Mesh") {
            continue;
        }

        const offset = time * v.multiplier * Math.PI / 5;
        object.geometry = createCurveGeometry(v.origin, v.radius, v.start + offset, v.length, v.cylinderRadius);
    }

    const rotationSpeed = time * 0.5;
    objectGroup.rotation.x = rotationSpeed;
    objectGroup.rotation.z = rotationSpeed;

    const scaleVal = map(Math.sin(time * 2.0), -1, 1, 0.8, 1.0);
    sphere.scale.x = scaleVal;
    sphere.scale.y = scaleVal;

    renderer.render(scene, camera);

    requestAnimationFrame(render);
};

const onResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
};

createSphere();
createCurveObjects();
onResize();
render();

window.addEventListener("resize", onResize);
