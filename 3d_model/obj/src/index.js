/* jshint node: true */
/* globals THREE */

window.THREE = require("three");
require("three/examples/js/controls/OrbitControls.js");
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";

let camera, directionalLight, controls, scene, renderer, clock;
const bgColor = "#88E8F2";
const groundColor = "#F26D85";
const isDebugMode = false;

const init = () => {
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    clock = new THREE.Clock();

    // Directional Light
    directionalLight = new THREE.DirectionalLight("#ffffff");
    directionalLight.position.set(0, 80, 0);
    directionalLight.intensity = 2;
    scene.add(directionalLight);
    if (isDebugMode) {
        const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 10);
        scene.add(directionalLightHelper);
    }

    // Spot Light
    const spotLightIntensity = 1.0;
    const spotLight1 = new THREE.SpotLight("#ffffff", spotLightIntensity, 100, Math.PI / 4, 1);
    spotLight1.castShadow = true;
    spotLight1.position.set(0, 60, 50);
    scene.add(spotLight1);

    const spotLight2 = new THREE.SpotLight("#ffffff", spotLightIntensity, 100, Math.PI / 4, 1);
    spotLight2.castShadow = true;
    spotLight2.position.set(50, 60, 0);
    scene.add(spotLight2);

    if (isDebugMode) {
        // For debug
        // const spotLightShadowHelper = new THREE.CameraHelper(spotLight1.shadow.camera);
        // scene.add(spotLightShadowHelper);
        const spotLightHelper1 = new THREE.SpotLightHelper(spotLight1);
        scene.add(spotLightHelper1);
        const spotLightHelper2 = new THREE.SpotLightHelper(spotLight2);
        scene.add(spotLightHelper2);
    }

    // Camera
    const cameraPos = new THREE.Vector3(0, 35, 100);
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight);
    camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enabled = true;
    controls.screenSpacePanning = true;
    controls.target.set(0, cameraPos.y, 0);

    // Ground
    const groundSize = 1000;
    const groundGeometry = new THREE.PlaneBufferGeometry(groundSize, groundSize, 1, 1);
    groundGeometry.rotateX(-Math.PI / 2);
    const ground = new THREE.Mesh(groundGeometry, new THREE.MeshPhongMaterial({
        color: groundColor
    }));
    ground.receiveShadow = true;
    scene.add(ground);

    // obj and the material
    const mtlLoader = new MTLLoader();
    mtlLoader.load("asset/tree/Prunus_Pendula.mtl", (materials) => {
        materials.preload();
        const loader = new OBJLoader();
        loader.setMaterials(materials);
        loader.load("asset/tree/Prunus_Pendula.obj", obj => {
            scene.add(obj);
            console.log(obj);
        }, (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + "% loaded");
        }, error => {
            console.error(error);
        });
    });
};

const animate = () => {
    clock.getDelta();
    const bg = new THREE.Color(bgColor);
    scene.background = bg;
    scene.fog = new THREE.FogExp2(bg, 0.005);

    // directionalLight.intensity = 0.8 + 1.2 * (1.0 - ratio);

    controls.update();
    renderer.render(scene, camera);

    requestAnimationFrame(animate);
};

const onResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
};
window.addEventListener("resize", onResize);

init();
animate();
onResize();