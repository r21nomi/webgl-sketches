import * as THREE from 'three';

var vertexShader = require('webpack-glsl-loader!./shader/vertexShader.vert');
var fragmentShader = require('webpack-glsl-loader!./shader/fragmentShader.frag');

let clock = new THREE.Clock();
let scene = new THREE.Scene();

const vertices = [];
const colors = [];
const particleCount = 30000;

const geometry = new THREE.BufferGeometry();

for (let i = 0; i < particleCount; i++) {
    const x = Math.floor(Math.random() * 1000 - 500);
    const y = Math.floor(Math.random() * 1000 - 500);
    const z = Math.floor(Math.random() * 1000 - 500);
    vertices.push(x, y, z);

    const r = Math.random();
    const g = Math.random();
    const b = Math.random();
    colors.push(r, g, b);
}

const verticesArray = new Float32Array(vertices);
geometry.addAttribute('position', new THREE.BufferAttribute(verticesArray, 3));

const colorsArray = new Float32Array(colors);
geometry.addAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

let uniforms = {
    time: {
        type: 'f',
        value: 0.0
    },
    size: {
        type: 'f',
        value: 32.0
    },
    texture: {
        type: 'f',
        value: THREE.ImageUtils.loadTexture('images/particle.png')
    }
};

const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
});

const points = new THREE.Points(geometry, material);
scene.add(points);

let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight);


let renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0x111111);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);

let render = function () {
    clock.getDelta();
    let time = clock.elapsedTime * 0.2;

    uniforms.time.value += 0.5;

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
