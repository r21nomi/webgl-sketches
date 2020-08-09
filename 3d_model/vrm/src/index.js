/* jshint node: true */
/* globals THREE */

window.THREE = require("three");
require("three/examples/js/controls/OrbitControls.js");
import {VRMLoader} from 'three-vrm';

let camera, controls, scene, renderer, clock, model;

const init = () => {
    renderer = new THREE.WebGLRenderer({antialias: true});
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xececec);

    clock = new THREE.Clock();

    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, 1, -2);
    scene.add(directionalLight);

    const gridHelper = new THREE.GridHelper(100, 100);
    scene.add(gridHelper);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight);
    camera.position.set(0, 1.5, -2.5);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.screenSpacePanning = true;
    controls.target.set(0, 0.75, 0);

    const vrmLoader = new VRMLoader();
    vrmLoader.crossOrigin = 'anonymous';
    vrmLoader.load(
        'asset/model.vrm',
        function (vrm) {
            model = vrm.scene;
            scene.add(model);
        },
        function (progress) {
            console.log('Loading model...', 100 * (progress.loaded / progress.total), '%');
        },
        function (error) {
            console.error(error);
        }
    );
};

const animate = () => {
    clock.getDelta();
    const time = clock.elapsedTime;

    if (model) {
        model.rotation.y = time * 0.5;

        const material = new THREE.MeshToonMaterial({
            color: Math.random() * 0xffffffff,
            bumpScale: 1,
            specular: new THREE.Color(2.0, 2.0, 2.0),
            reflectivity: 1.0,
            shininess: 1.0,
        });
        scene.overrideMaterial = material;
    }

    controls.update();
    renderer.render(scene, camera);

    requestAnimationFrame(animate);
};

const onResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
};
window.addEventListener("resize", onResize);

init();
animate();
onResize();