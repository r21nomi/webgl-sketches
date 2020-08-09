/* jshint node: true */
/* globals THREE */

window.THREE = require("three");
require("three/examples/js/controls/OrbitControls.js");
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";

let camera, spotLight, directionalLight, spotLightHelper, controls, scene, renderer, clock, model;
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
    directionalLight.position.set(0, 1, -2);
    directionalLight.intensity = 2;
    scene.add(directionalLight);

    // Spot Light
    spotLight = new THREE.SpotLight("#ffffff", 1.2, 20, Math.PI / 4, 1);
    spotLight.castShadow = true;
    // Shadow size
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    spotLight.position.y = 7;
    spotLight.target.position.set(0, 2, 0);
    scene.add(spotLight.target);
    scene.add(spotLight);
    if (isDebugMode) {
        // For debug
        spotLightHelper = new THREE.SpotLightHelper(spotLight);
        scene.add(spotLightHelper);
    }

    // Camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight);
    camera.position.set(0, 4.5, -6.0);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enabled = isDebugMode;
    controls.screenSpacePanning = true;
    controls.target.set(1, 2.5, 0);

    // Ground
    const groundSize = 1000;
    const groundGeometry = new THREE.PlaneBufferGeometry(groundSize, groundSize, 1, 1);
    groundGeometry.rotateX(-Math.PI / 2);
    const ground = new THREE.Mesh(groundGeometry, new THREE.MeshPhongMaterial({
        color: groundColor
    }));
    ground.receiveShadow = true;
    scene.add(ground);

    const loader = new GLTFLoader();
    loader.load("asset/cocktail.gltf", gltf => {
        model = gltf.scene;
        model.position.y = 2.5;
        scene.add(model);

        // Change material
        // https://stackoverflow.com/questions/56660584/how-to-override-gltf-materials-in-three-js
        let colorsPerFace = [
            "#FFFF05", "#2ABFB0", "#ffcc00", "#998844"
        ];
        let count = 0;
        model.traverse((o) => {
            if (o.isMesh) {
                o.material = new THREE.MeshPhongMaterial({
                    color: colorsPerFace[count]
                });
                o.castShadow = true;
                count++;
            }
        });
        console.log(gltf);
    }, null, error => {
        console.error(error);
    });
};

const animate = () => {
    clock.getDelta();
    const time = clock.elapsedTime;

    if (model) {
        model.rotation.y = time * 0.1;
    }

    const lightDistance = 6.0;
    const lightTime = 4 + time * 0.2;
    spotLight.position.x = lightDistance * Math.sin(lightTime);
    spotLight.position.z = lightDistance * Math.cos(lightTime);
    if (spotLightHelper) {
        spotLightHelper.update();
    }

    // Change color gradually.
    const ratio = Math.sin(lightTime) * 0.5 + 0.5;
    const bg = new THREE.Color(bgColor);
    bg.lerp(new THREE.Color("#222233"), ratio);
    scene.background = bg;
    scene.fog = new THREE.FogExp2(bg, 0.005);

    directionalLight.intensity = 0.8 + 1.2 * (1.0 - ratio);

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