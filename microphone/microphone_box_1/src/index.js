import * as THREE from 'three';

const vertexShader = require('webpack-glsl-loader!./shader/vertexShader.vert');
const fragmentShader = require('webpack-glsl-loader!./shader/fragmentShader.frag');

const clock = new THREE.Clock();
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.Fog(0x000000, 1, 10000);

const objectGroup = new THREE.Group();
const uniforms = {
    time: {type: "f", value: 1.0},
    resolution: {type: "v2", value: new THREE.Vector2()}
};

let analyser;
let frequencyArray;

const hasGetUserMedia = () => {
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia);
};

const onMicrophoneAllowed = (stream) => {
    const audioContent = new AudioContext();
    audioContent.createMediaStreamSource(stream);
    analyser = audioContent.createAnalyser();
    const audioStream = audioContent.createMediaStreamSource(stream);
    audioStream.connect(analyser);
    analyser.fftSize = 1024;
    frequencyArray = new Uint8Array(analyser.frequencyBinCount);

    scene.add(createMeshes(400));
    render();
};

const showAlertMessage = (message) => {
    const newDiv = document.createElement("div");
    newDiv.setAttribute("style", "    color: white;\n" +
        "    position: absolute;\n" +
        "    top: 50%;\n" +
        "    width: 100%;\n" +
        "    text-align: center;");
    const textContent = document.createTextNode(message);
    newDiv.appendChild(textContent);
    document.body.appendChild(newDiv);
};

const onMicrophoneDisallowed = () => {
    showAlertMessage("Please allow access to your microphone.");
};

const init = () => {
    if (hasGetUserMedia()) {
        navigator.getUserMedia({audio: true}, onMicrophoneAllowed, onMicrophoneDisallowed);
    } else {
        showAlertMessage("This art is not shown in your browser");
    }
};

const cameraDistance = 5000;
const boxGeometry = new THREE.BoxBufferGeometry(100, 100, 100);

const createMeshes = (count) => {
    for (let i = 0; i < count; i++) {
        var shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: uniforms.time,
                resolution: uniforms.resolution,
                id: {type: "f", value: i + 1},
                totalBoxCount: {type: "f", value: count},
                colorOffset: {type: "f", value: 0.0},
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        });
        const mesh = new THREE.Mesh(boxGeometry, shaderMaterial);

        const x = Math.random() * cameraDistance - cameraDistance / 2;
        const y = Math.random() * cameraDistance - cameraDistance / 2;
        const z = Math.random() * cameraDistance - cameraDistance / 2;

        mesh.position.x = x;
        mesh.position.y = y;
        mesh.position.z = z;

        mesh.rotation.x = Math.random() * 2 * Math.PI;
        mesh.rotation.y = Math.random() * 2 * Math.PI;

        objectGroup.add(mesh);
    }

    return objectGroup;
};

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 1, 1);
directionalLight.castShadow = true;
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const light = new THREE.HemisphereLight(0xffffff, 0x333333, 0.5);
scene.add(light);

// Camera
const fov = 45;
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(fov, aspect, 1, 10000);

const renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);

const render = () => {
    const delta = clock.getDelta();
    const time = clock.elapsedTime;

    analyser.getByteFrequencyData(frequencyArray);

    const len = objectGroup.children.length;
    for (let i = 0; i < len; i++) {
        const object = objectGroup.children[i];
        if (object.type !== "Mesh") {
            continue;
        }
        const v = Math.max(Math.min(frequencyArray[10] / 255 * 2.0, 4.0), 0.1);
        object.scale.x = v;
        object.scale.y = v;
        object.scale.z = v;

        object.rotation.x += delta * v * 2.0;
        object.rotation.y += delta * v * 2.0;

        object.material.uniforms.id.value = i + 1;
        object.material.uniforms.colorOffset.value = v * 0.1;
    }

    camera.position.x = cameraDistance * Math.sin(time * 10 * (Math.PI / 180));
    camera.position.z = cameraDistance * Math.cos(time * 10 * (Math.PI / 180));
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    uniforms.time.value = time;

    renderer.render(scene, camera);

    requestAnimationFrame(render);
};

const onResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    uniforms.resolution.value.x = renderer.domElement.width;
    uniforms.resolution.value.y = renderer.domElement.height;
};

init();
onResize();

window.addEventListener("resize", onResize);
