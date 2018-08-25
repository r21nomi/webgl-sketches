import * as THREE from 'three';

let TWEEN = require('@tweenjs/tween.js');
let vertexShader = require('webpack-glsl-loader!./shader/vertexShader.vert');
let fragmentShader = require('webpack-glsl-loader!./shader/fragmentShader.frag');

let clock = new THREE.Clock();
let scene = new THREE.Scene();

let colorsPerFace = [
    0x008F2E, 0x5DDC00, 0x3B8900, 0x99FF1F, 0xBFFF59, 0x00BB7D
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
let cameraLookAt = new THREE.Vector3(objectPosition.x, objectPosition.y, objectPosition.z);
camera.position.set(0, 600, cameraDistance);
camera.lookAt(cameraLookAt);

let renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0x2B2B2B);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);

let uniforms = {
    time: {
        type: 'f',
        value: 0.0
    },
    size: {
        type: 'f',
        value: 32.0
    }
};

let points;

let createParticles = function () {
    let colorsPerFace = [
        "#7BFFEF", "#6FE8B8", "#7FFFAC", "#6FE873", "#FFDEAA"
    ];

    function hexToRgb(hex) {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
        };
    }

    const vertices = [];
    const colors = [];
    const particleCount = 20000;

    const geometry = new THREE.BufferGeometry();
    const dist = window.innerWidth * 3;

    for (let i = 0; i < particleCount; i++) {
        const x = Math.floor(Math.random() * dist - dist / 2);
        const y = Math.floor(Math.random() * dist - dist / 2);
        const z = Math.floor(Math.random() * dist - dist / 2);
        vertices.push(x, y, z);

        const rgbColor = hexToRgb(colorsPerFace[Math.floor(Math.random() * colorsPerFace.length)]);
        colors.push(rgbColor.r, rgbColor.g, rgbColor.b);
    }

    const verticesArray = new Float32Array(vertices);
    geometry.addAttribute('position', new THREE.BufferAttribute(verticesArray, 3));

    const colorsArray = new Float32Array(colors);
    geometry.addAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    points = new THREE.Points(geometry, material);
    scene.add(points);
};

createParticles();

let render = function (t) {
    TWEEN.update(t);

    let delta = clock.getDelta();
    let time = clock.elapsedTime;

    uniforms.time.value += 0.5;

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

    objectGroup.rotation.y += delta;
    points.rotation.y += delta * 0.1;

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
        .to({x: x, y: y, z: z}, 1000)
        .easing(TWEEN.Easing.Exponential.Out)
        .onUpdate(function () {
            camera.position.x = coords.x;
            camera.position.y = coords.y;
            camera.position.z = coords.z;
            camera.lookAt(cameraLookAt);
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
