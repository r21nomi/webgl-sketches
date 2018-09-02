import * as THREE from 'three';

let TWEEN = require('@tweenjs/tween.js');

const vertexShader = require('webpack-glsl-loader!./shader/vertexShader.vert');
const fragmentShader = require('webpack-glsl-loader!./shader/fragmentShader.frag');

const clock = new THREE.Clock();
const scene = new THREE.Scene();

const backgroundColor = 0x000000;
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
    height: 250
};

const createMesh = (radius) => {
    const geometry = new THREE.SphereBufferGeometry(radius, 100, 100);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: uniform.time,
            resolution: {
                type: "v2",
                value: new THREE.Vector2(radius, radius)
            }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
    });
    material.side = THREE.DoubleSide;

    return new THREE.Mesh(geometry, material);
};

const createMeshes = (radius, count) => {
    for (let i = 0; i < count; i++) {
        const degree = 2 * Math.PI * i / count;
        const mesh = createMesh(objSize.width);
        const x = radius * Math.cos(degree);
        const y = radius * Math.sin(degree);

        mesh.position.x = x;
        mesh.position.y = 0;
        mesh.position.z = y;
        mesh.rotation.y = Math.PI / 2 - (Math.atan2(y, x));

        objectGroup.add(mesh);
    }

    return objectGroup;
};

scene.add(createMeshes(objRadius, 8));
scene.add(createMeshes(objRadius * 2.0, 16));
scene.add(createMeshes(objRadius * 3.0, 24));

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(3000, 3000, 32, 32),
    new THREE.MeshBasicMaterial({
        color: 0x222222,
        transparent: true,
        opacity: 1.0
    })
);
floor.position.y = -objSize.height / 2;
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Camera
const cameraDistance = objRadius * 3.0;
const fov = 45;
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(fov, aspect);
const cameraLookAt = new THREE.Vector3(0, 0, 0);
camera.position.set(0, 100, cameraDistance);
camera.lookAt(cameraLookAt);

const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(backgroundColor);
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);

const render = (t) => {
    TWEEN.update(t);

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

    camera.position.x = cameraDistance * Math.sin(time * 0.3);
    camera.position.z = cameraDistance * Math.cos(time * 0.3);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    renderer.render(scene, camera);

    requestAnimationFrame(render);
};

const tween = (mesh, delay) => {
    const position1 = {
        y: mesh.position.y,
        scaleY: mesh.scale.y
    };
    new TWEEN.Tween(position1)
        .delay(delay)
        .to({y: 100, scaleY: 1.2}, 400)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onUpdate(function () {
            mesh.position.y = position1.y;
            mesh.scale.y = position1.scaleY;
        })
        .onComplete(function () {
            const position2 = {
                y: mesh.position.y,
                scaleY: mesh.scale.y
            };
            new TWEEN.Tween(position2)
                .to({y: 0, scaleY: 1}, 700)
                .easing(TWEEN.Easing.Bounce.Out)
                .onUpdate(function () {
                    mesh.position.y = position2.y;
                    mesh.scale.y = position2.scaleY;
                })
                .onComplete(function () {
                    tween(mesh, delay);
                })
                .start();
        })
        .start();
};

onResize();
render();

for (let i = 0, len = objectGroup.children.length; i < len; i++) {
    const mesh = objectGroup.children[i];
    tween(mesh, i * 100);
}

window.addEventListener("resize", onResize);

function onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
}
