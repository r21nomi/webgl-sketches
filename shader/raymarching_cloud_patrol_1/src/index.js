import * as THREE from 'three';

const vertexShader = require('webpack-glsl-loader!./shader/vertexShader.vert');
const fragmentShader = require('webpack-glsl-loader!./shader/fragmentShader.frag');

const clock = new THREE.Clock();
const scene = new THREE.Scene();

const wallSize = window.innerWidth;

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

const createShaderMaterial = () => {
    const material = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(2, 2),
        new THREE.ShaderMaterial({
            uniforms: {
                time: uniform.time,
                resolution: {
                    type: "v2",
                    value: new THREE.Vector2(wallSize, wallSize)
                },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
        })
    );

    return material;
};
scene.add(createShaderMaterial());

// Camera
const camera = new THREE.Camera();
camera.position.z = 1;

const renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);

const render = (t) => {
    const delta = clock.getDelta();
    const time = clock.elapsedTime;

    uniform.time.value = time;
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
