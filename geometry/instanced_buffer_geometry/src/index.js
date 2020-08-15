"use strict";
/* jshint node: true */

import * as THREE from "three";

window.THREE = require("three");
const vertexShader = require("webpack-glsl-loader!./shader/vertex.vert");
const fragmentShader = require("webpack-glsl-loader!./shader/fragment.frag");

const instanceNum = 10;
const delayOffset = 0.2;

let uniforms = [];
const textureTypes = [
    "texture1.png",
    "texture2.png",
    "texture3.png"
];
let time = 0;
let clock = new THREE.Clock();

const scene = new THREE.Scene();
const bgColor = {
    r: 1.0,
    g: 1.0,
    b: 1.0
};
scene.background = new THREE.Color(bgColor.r, bgColor.g, bgColor.b);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);

const fov = 60;
const aspect = window.innerWidth / window.innerHeight;
const zNear = 0.1;
const zFar = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, zNear, zFar);
camera.position.set(0, 0, 10);

const init = () => {
    const index = uniforms.length;
    const textureTypeNum = textureTypes.length;
    const geo = new THREE.InstancedBufferGeometry();
    const shape = new THREE.PlaneBufferGeometry(1, 1, 1, 3);
    const data = shape.attributes;

    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(data.position.array), 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(data.uv.array), 2));
    geo.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(data.normal.array), 3));
    geo.setIndex(new THREE.BufferAttribute(new Uint16Array(shape.index.array), 1));
    shape.dispose();

    let offsetPos = new THREE.InstancedBufferAttribute(new Float32Array(instanceNum * 3), 3, false, 1);
    let num = new THREE.InstancedBufferAttribute(new Float32Array(instanceNum * 1), 1, false, 1);
    let textureType = new THREE.InstancedBufferAttribute(new Float32Array(instanceNum * 1), 1, false, 1);
    let delay = new THREE.InstancedBufferAttribute(new Float32Array(instanceNum * 1), 1, false, 1);
    let sizeOffset = new THREE.InstancedBufferAttribute(new Float32Array(instanceNum * 1), 1, false, 1);

    const windowAspect = getWindowAspect();
    for (let i = 0; i < instanceNum; i++) {
        let range = {
            x: windowAspect.width * camera.position.z * 0.9,
            y: windowAspect.height * camera.position.z * 0.9,
            z: 0.5
        };
        const x = Math.random() * range.x - range.x / 2;
        const y = Math.random() * range.y - range.y / 2;
        const z = Math.random() * range.z - range.z / 2;
        offsetPos.setXYZ(i, x, y, z);
        num.setX(i, i);
        textureType.setX(i, i % textureTypeNum + 1);
        delay.setX(i, time + i * delayOffset);

        const maxSize = 2.0;
        const minSize = 0.3;
        sizeOffset.setX(i, Math.min(Math.max(Math.random() * instanceNum, minSize), maxSize));
    }

    geo.setAttribute("offsetPos", offsetPos);
    geo.setAttribute("num", num);
    geo.setAttribute("textureType", textureType);
    geo.setAttribute("delay", delay);
    geo.setAttribute("sizeOffset", sizeOffset);

    uniforms[index] = {
        time: {
            value: 0
        }
    };

    for (let i = 0; i < textureTypeNum; i++) {
        const param = `texture${i + 1}`;
        uniforms[index][param] = {
            type: 't',
            value: null
        };
        new THREE.TextureLoader().load(`asset/${textureTypes[i]}`, t => {
            uniforms[index][param].value = t;
        });
    }

    let mat = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: uniforms[index],
        transparent: true,
        depthWrite: true,
        depthTest: false
    });

    const mesh = new THREE.Mesh(geo, mat);

    scene.add(mesh);
};

const render = () => {
    time += clock.getDelta();

    uniforms.forEach(uniform => {
        uniform.time.value = time;
    });

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

const getWindowAspect = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (width > height) {
        return {
            width: width / height,
            height: 1
        };
    } else {
        return {
            width: 1,
            height: height / width
        };
    }
};

init();
onResize();
render();

window.addEventListener("resize", onResize);
