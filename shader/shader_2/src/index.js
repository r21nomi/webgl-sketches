import * as THREE from 'three';

const vertexShader = require('webpack-glsl-loader!./shader/vertexShader.vert');
const fragmentShader = require('webpack-glsl-loader!./shader/fragmentShader.frag');

const clock = new THREE.Clock();
const scene = new THREE.Scene();

const backgroundColor = 0x666666;
scene.fog = new THREE.FogExp2(backgroundColor, 0.001);

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

const objectGroup = new THREE.Group();

const objRadius = window.innerWidth * 0.2;
const objSize = {
    width: 40,
    height: 200
};

const createMesh = function (width, height) {
    const geometry = new THREE.PlaneBufferGeometry(width, height);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: uniform.time,
            resolution: {
                type: "v2",
                value: new THREE.Vector2(objSize.width, objSize.height)
            }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
    });
    material.side = THREE.DoubleSide;

    return new THREE.Mesh(geometry, material);
};

const createMeshes = function () {
    const count = 8;

    for (let i = 0; i < count; i++) {
        const degree = 2 * Math.PI * i / count;
        const mesh = createMesh(objSize.width, objSize.height);
        const x = objRadius * Math.cos(degree);
        const y = objRadius * Math.sin(degree);

        mesh.position.x = x;
        mesh.position.y = 0;
        mesh.position.z = y;
        mesh.rotation.y = Math.PI / 2 - (Math.atan2(y, x));

        objectGroup.add(mesh);
    }

    return objectGroup;
};

scene.add(createMeshes());

// Floor
let floor = new THREE.Mesh(
    new THREE.PlaneGeometry(50000, 50000, 32, 32),
    new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 1.0
    })
);
floor.position.y = -objSize.height / 2;
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Camera
const fov = 45;
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(fov, aspect);
const cameraLookAt = new THREE.Vector3(0, 0, 0);
camera.position.set(0, 50, objRadius);
camera.lookAt(cameraLookAt);

const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(backgroundColor);
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);

const render = function () {
    clock.getDelta();
    const time = clock.elapsedTime;

    uniform.time.value = time;

    var len = objectGroup.children.length;
    for (var i = 0; i < len; i++) {
        var object = objectGroup.children[i];
        if (object.type !== "Mesh") {
            continue;
        }
    }

    camera.position.x = objRadius * Math.sin(time);
    camera.position.z = objRadius * Math.cos(time);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

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

    // uniform.resolution.value.x = renderer.domElement.width;
    // uniform.resolution.value.y = renderer.domElement.height;
}
