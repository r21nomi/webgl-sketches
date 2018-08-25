import * as THREE from 'three';

let TWEEN = require('@tweenjs/tween.js');

let clock = new THREE.Clock();
let scene = new THREE.Scene();

let colorsPerFace = [
    0x286B47, 0xACFFD2, 0x58EB9C, 0x486B58, 0x45B87A
];

let originalVerticesArray = [];
let objectGroup = new THREE.Group();

function createObject(radius, position) {
    // Object
    let originalVertices = [];
    let geometry = new THREE.IcosahedronGeometry(radius);

    for (let i = 0, len = geometry.faces.length; i < len; i++) {
        let face = geometry.faces[i];
        face.color.setHex(colorsPerFace[Math.floor(Math.random() * colorsPerFace.length)]);
    }

    for (let i = 0, len = geometry.vertices.length; i < len; i++) {
        let vertex = geometry.vertices[i];

        originalVertices.push({
            x: vertex.x,
            y: vertex.y
        });
    }

    let material = new THREE.MeshBasicMaterial({
        vertexColors: THREE.FaceColors
    });

    let obj = new THREE.Mesh(geometry, material);
    obj.position.x = position.x;
    obj.position.y = position.y;
    obj.position.z = position.z;
    obj.castShadow = true;

    originalVerticesArray.push(originalVertices);

    return obj;
}

let objectRadius = window.innerHeight / 3;
let objectPosition = {
    x: 0,
    y: 200,
    z: 0
};

let object = createObject(objectRadius, objectPosition);

objectGroup.add(object);

scene.add(objectGroup);

// Floor
let floor = new THREE.Mesh(
    new THREE.PlaneGeometry(3000, 3000, 1, 1),
    new THREE.ShadowMaterial({
        opacity: 0.1
    })
);
floor.position.y = 0;
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
floor.opacity = 0.9;
scene.add(floor);

// Light
let light = new THREE.SpotLight(0xffffff);
light.position.set(0, 450, 0);
light.castShadow = true;
scene.add(light);

// Camera
let fov = 45;
let aspect = window.innerWidth / window.innerHeight;
let cameraDistance = 1000;
let camera = new THREE.PerspectiveCamera(fov, aspect);
camera.position.set(0, 600, cameraDistance);
camera.lookAt(new THREE.Vector3(0, 0, 0));

let renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0x2B2B2B);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);

let render = function (t) {
    TWEEN.update(t);

    clock.getDelta();
    let time = clock.elapsedTime;

    let len = objectGroup.children.length;
    for (let i = 0; i < len; i++) {
        let object = objectGroup.children[i];

        let geometry = object.geometry;
        geometry.verticesNeedUpdate = true;

        let originalVertices = originalVerticesArray[i];

        for (let i = 0, len = geometry.vertices.length; i < len; i++) {
            let t = time * 8 + i * 300;
            let offset = 20;
            geometry.vertices[i].x = originalVertices[i].x + Math.sin(t) * offset;
            geometry.vertices[i].y = originalVertices[i].y + Math.sin(t * 0.8) * offset;
        }
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
};

let tween = function () {
    let time = clock.elapsedTime;

    let x = cameraDistance * Math.sin(time * 300 * Math.random());
    let y = camera.position.y;
    let z = cameraDistance * Math.cos(time * 100 * Math.random());

    const coords = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z
    };
    new TWEEN.Tween(coords)
        .to({x: x, y: y, z: z}, 800)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(function () {
            camera.position.x = coords.x;
            camera.position.y = coords.y;
            camera.position.z = coords.z;
            camera.lookAt(new THREE.Vector3(0, 0, 0));
        })
        .onComplete(function () {
            tween();
        })
        .start();
};

tween();

onResize();
render();

window.addEventListener("resize", onResize);

function onResize() {
    let width = window.innerWidth;
    let height = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
}
