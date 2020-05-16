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

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);

const camera = new THREE.Camera();

let len = 300;
let num = 200;
let uni;
let time = 0;
let clock = new THREE.Clock();
let obj;
let comTexs = {
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

    initPosition(initPosTex);

    // Bind texture and shader to renderer
    comTexs.position.texture = computeRenderer.addVariable("texturePosition", comShaderPosition, initPosTex);
    comTexs.velocity.texture = computeRenderer.addVariable("textureVelocity", comShaderVelocity, intVelTex);

    computeRenderer.setVariableDependencies(comTexs.position.texture, [comTexs.position.texture, comTexs.velocity.texture] );
    comTexs.position.uniforms = comTexs.position.texture.material.uniforms;

    computeRenderer.setVariableDependencies(comTexs.velocity.texture, [comTexs.position.texture, comTexs.velocity.texture] );
    comTexs.velocity.uniforms = comTexs.velocity.texture.material.uniforms;
    comTexs.velocity.uniforms.time =  { type:"f", value : 0};

    computeRenderer.init();
}

const initPosition = (tex) => {
    const texArray = tex.image.data;  // length is (len * num * 4)
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
    // let indices = new Uint32Array((num * len - 1) * 3);
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

            // indices[n] = c;
            // indices[n + 1] = Math.min(c + 1, i * len + len - 1);
            // indices[n + 2] = Math.min(c + 1, i * len + len - 1);
        }
    }

    geo.setAttribute("position", new THREE.BufferAttribute(pArray, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    // geo.setIndex(new THREE.BufferAttribute(indices, 1));

    uni = {
        texturePosition: { value: null },
        textureVelocity: { value: null }
    }

    let mat = new THREE.ShaderMaterial({
        uniforms: uni,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    });
    mat.wireframe = true;

    obj = new THREE.Mesh(geo, mat);
    obj.matrixAutoUpdate = false;
    obj.updateMatrix();

    scene.add(obj);
};

const render = () => {
    time += clock.getDelta();
    computeRenderer.compute();
    comTexs.velocity.uniforms.time.value = time;
    uni.texturePosition.value = computeRenderer.getCurrentRenderTarget(comTexs.position.texture).texture;
    uni.textureVelocity.value = computeRenderer.getCurrentRenderTarget(comTexs.velocity.texture).texture;

    // uniforms.time.value += 0.05;
    renderer.render(scene, camera);

    requestAnimationFrame(render);
};

initComputeRenderer();
createTrails();

onResize();
render();

window.addEventListener('resize', onResize);

function onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    // uniforms.resolution.value.x = renderer.domElement.width;
    // uniforms.resolution.value.y = renderer.domElement.height;
}
