"use strict";
/* jshint node: true */
/* globals THREE */

window.THREE = require("three");
require("three/examples/js/misc/GPUComputationRenderer.js");

const comShaderPosition = require('webpack-glsl-loader!./shader/computePosition.glsl');
const comShaderVelocity = require('webpack-glsl-loader!./shader/computeVelocity.glsl');
const vertexShader = require('webpack-glsl-loader!./shader/trails.vert');
const fragmentShader = require('webpack-glsl-loader!./shader/trails.frag');

const scene = new THREE.Scene();
const bgColor = {
    r: 0.9,
    g: 0.8,
    b: 0.7
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
camera.position.set(0, 0, 0.8);

let len = 300;
let num = 600;
let uniform = {
    time: {
        type: "f",
        value: 1.0
    },
    bgColor: {
        type: "v3",
        value: new THREE.Vector3(bgColor.r, bgColor.g, bgColor.b)
    },
    texturePosition: { value: null },
    textureVelocity: { value: null }
};
let time = 0;
let clock = new THREE.Clock();
let computeShaderTex = {
    position:{
        texture: null,
        uniforms: null,
    },
    velocity:{
        texture: null,
        uniforms: null,
    },
};
let computeRenderer;

const initComputeRenderer = () => {
    computeRenderer = new THREE.GPUComputationRenderer(len, num, renderer);

    // Create texture
    let initPosTex = computeRenderer.createTexture();
    let intVelTex = computeRenderer.createTexture();

    // Initialize trails positions
    const texArray = initPosTex.image.data;  // length is (len * num * 4)
    let rangeVal = 0.1;
    let range = new THREE.Vector3(rangeVal, rangeVal, rangeVal);
    for (let i = 0; i < texArray.length; i += len * 4) {  // 4 means xyzw
        let x = Math.random() * range.x - range.x / 2;
        let y = Math.random() * range.y - range.y / 2;
        let z = Math.random() * range.z - range.z / 2;
        // x = 0;
        // y = 0;
        // z = 0;

        for (let j = 0; j < len * 4; j += 4) {
            texArray[i + j + 0] = x;
            texArray[i + j + 1] = y;
            texArray[i + j + 2] = z;
            texArray[i + j + 3] = 0.0;
        }
    }

    // Bind texture and shader to renderer
    computeShaderTex.position.texture = computeRenderer.addVariable("texturePosition", comShaderPosition, initPosTex);
    computeShaderTex.velocity.texture = computeRenderer.addVariable("textureVelocity", comShaderVelocity, intVelTex);

    computeRenderer.setVariableDependencies(computeShaderTex.position.texture, [computeShaderTex.position.texture, computeShaderTex.velocity.texture] );
    computeShaderTex.position.uniforms = computeShaderTex.position.texture.material.uniforms;

    computeRenderer.setVariableDependencies(computeShaderTex.velocity.texture, [computeShaderTex.position.texture, computeShaderTex.velocity.texture] );
    computeShaderTex.velocity.uniforms = computeShaderTex.velocity.texture.material.uniforms;
    computeShaderTex.velocity.uniforms.time = uniform.time;

    computeRenderer.init();
}

const createTrails = () => {
    const geo = new THREE.BufferGeometry();

    /**
     * ex. trail of 10(length) x 3(num)
     * ----------
     * ----------
     * ----------
     */
    let pArray = new Float32Array(num * len * 3);  // size * xyz
    let indices = new Uint32Array((num * len - 1) * 3);
    let uv = new Float32Array(num * len * 2);  // size * xy

    for (let i = 0; i < num; i++) {
        for (let j = 0; j < len; j++) {
            let c = i * len + j;
            let n = c * 3;
            pArray[n] = 0;
            pArray[n + 1] = 0;
            pArray[n + 2] = 0;

            uv[c * 2] = j / len;
            uv[c * 2 + 1] = i / num;

            indices[n] = c;
            indices[n + 1] = Math.min(c + 1, i * len + len - 1);
            indices[n + 2] = Math.min(c + 1, i * len + len - 1);
        }
    }

    geo.setAttribute("position", new THREE.BufferAttribute(pArray, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    geo.setIndex(new THREE.BufferAttribute(indices, 1));

    let mat = new THREE.ShaderMaterial({
        uniforms: uniform,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    });
    mat.wireframe = true;

    let mesh = new THREE.Mesh(geo, mat);
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();

    scene.add(mesh);
};

const render = () => {
    time += clock.getDelta();

    uniform.time.value = time;

    computeRenderer.compute();
    uniform.texturePosition.value = computeRenderer.getCurrentRenderTarget(computeShaderTex.position.texture).texture;
    uniform.textureVelocity.value = computeRenderer.getCurrentRenderTarget(computeShaderTex.velocity.texture).texture;

    renderer.render(scene, camera);

    requestAnimationFrame(render);
};

const onResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
};

initComputeRenderer();
createTrails();

onResize();
render();

window.addEventListener('resize', onResize);
