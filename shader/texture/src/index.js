"use strict";
/* jshint node: true */

import * as THREE from "three";

window.THREE = require("three");
const vertexShader = require('webpack-glsl-loader!./shader/vertex.vert');
const fragmentShader = require('webpack-glsl-loader!./shader/fragment.frag');

let uniforms = {
    time: {
        value: 0
    },
    texture: {
        type: 't',
        value: null
    }
};
let time = 0;
let clock = new THREE.Clock();

const scene = new THREE.Scene();
const bgColor = {
    r: 0.8,
    g: 0.0,
    b: 0.3
};
scene.background = new THREE.Color(bgColor.r, bgColor.g, bgColor.b);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);

const fov = 40;
const aspect = window.innerWidth / window.innerHeight;
const zNear = 0.1;
const zFar = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, zNear, zFar);
camera.position.set(0, 0, 5);

const init = () => {
    const geo = new THREE.PlaneBufferGeometry(1, 1, 1, 3);

    new THREE.TextureLoader().load("asset/particle.png", (t) => {
        uniforms.texture.value = t;
    });

    let mat = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: uniforms,
        transparent: true
    });

    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
};

const render = () => {
    time += clock.getDelta();

    uniforms.time.value = time;

    renderer.render(scene, camera);

    requestAnimationFrame(render);
};

const onResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
};

init();
onResize();
render();

window.addEventListener('resize', onResize);
