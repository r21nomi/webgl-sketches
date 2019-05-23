/* jshint node: true */
/* globals THREE */

window.THREE = require("three");
import SimplexNoise from "simplex-noise";

let renderer, camera, scene, clock, objectGroup;
let originalSizes = [];

const createObject = () => {
    const material = new THREE.MeshPhongMaterial({color: 0x00eedd});
    const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
    const mesh = new THREE.Mesh(geometry, material);

    return mesh;
};

const addObjects = () => {

    const count = 5;
    const simplex = new SimplexNoise();

    for (let x = -count; x < count; x++) {
        for (let y = -count; y < count; y++) {
            for (let z = -count; z < count; z++) {
                const object = createObject();
                const noise = simplex.noise3D(x, y, z);

                object.position.x = x + noise;
                object.position.y = y + noise;
                object.position.z = z + noise;

                // Do not make the value 0.
                // https://github.com/aframevr/aframe-inspector/issues/524
                const scale = THREE.Math.clamp(noise, 0.02, 1.0) * 1.2;  // Refer to https://github.com/mrdoob/three.js/blob/master/src/math/Math.js
                object.scale.x = scale;
                object.scale.y = scale;
                object.scale.z = scale;

                originalSizes.push({
                    x: scale,
                    y: scale,
                    z: scale
                });
                objectGroup.add(object);
            }
        }
    }
};

const addLights = () => {
    const particleLight = new THREE.Mesh(
        new THREE.SphereBufferGeometry(0.4, 16, 16),
        new THREE.MeshPhongMaterial({color: 0xff22dd})
    );
    const ambientLight = new THREE.AmbientLight(0x992266, 3, 100);
    const pointLight = new THREE.PointLight(0xff22dd, 4, 50);

    particleLight.position.x = 0;
    particleLight.position.y = 0;
    particleLight.position.z = 0;
    particleLight.add(ambientLight);
    particleLight.add(pointLight);

    scene.add(particleLight);
};

const init = () => {
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
    clock = new THREE.Clock();
    objectGroup = new THREE.Group();

    const fov = 45;
    const aspect = window.innerWidth / window.innerHeight;

    camera = new THREE.PerspectiveCamera(fov, aspect);
    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, 0);

    const pointLight = new THREE.PointLight(0xff4400, 2, 300);
    camera.add(pointLight);
    scene.add(camera);

    addLights();
    addObjects();

    scene.background = new THREE.Color(0x003366);
    scene.add(objectGroup);

    document.body.appendChild(renderer.domElement);

    onResize();
};

const render = () => {
    clock.getDelta();
    const time = clock.elapsedTime;

    for (let i = 0, len = objectGroup.children.length; i < len; i++) {
        const object = objectGroup.children[i];

        let s = Math.sin(time * 1.2 + (i % 7) * 4.3) * 0.4;
        const min = 0.01;
        const max = 1.5;

        if (i % 2 == 0) {
            object.scale.x = THREE.Math.clamp(originalSizes[i].x + s, min, max);
        } else {
            object.scale.z = THREE.Math.clamp(originalSizes[i].z + s, min, max);
        }
    }

    const t = time * 0.2;
    camera.position.x = 10 * Math.cos(t);
    camera.position.y = 10 * Math.sin(t);
    camera.position.z = 10 * Math.sin(t);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    renderer.render(scene, camera);

    requestAnimationFrame(render);
};

const onResize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);

    camera.aspect = w / h;
    camera.updateProjectionMatrix();
};

window.addEventListener("resize", onResize);

init();
render();
