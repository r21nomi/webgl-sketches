"use strict";
/* jshint node: true */
/* globals THREE */

window.THREE = require("three");
require("three/examples/js/effects/OutlineEffect.js");

var clock = new THREE.Clock();
var scene = new THREE.Scene();

var boxCount = 5;
var boxSize = window.innerWidth / boxCount;
var windowWidth = window.innerWidth;
var radius = boxSize * 0.6 / 2;
var geometry = new THREE.SphereBufferGeometry(radius, 30, 15);

var boxGroup = new THREE.Group();
for (var x = 0; x < boxCount; x++) {
    for (var y = 0; y < boxCount; y++) {
        for (var z = 0; z < boxCount; z++) {

            var material = new THREE.MeshToonMaterial({
                color: 0xffcc00
            });

            var boxMesh = new THREE.Mesh(geometry, material);
            var meshX = x * boxSize - windowWidth / 2 + boxSize / 2;
            var meshY = y * boxSize - windowWidth / 2 + boxSize / 2;
            var meshZ = z * boxSize - windowWidth / 2 + boxSize / 2;
            boxMesh.position.x = meshX;
            boxMesh.position.y = meshY;
            boxMesh.position.z = meshZ;

            boxGroup.add(boxMesh);
        }
    }
}

scene.add(boxGroup);

// Camera
var fov = 45;
var aspect = window.innerWidth / window.innerHeight;
var camera = new THREE.PerspectiveCamera(fov, aspect);
camera.position.set(0, 0, 1000);

// Point　Light
var particleLight = new THREE.Mesh(
    new THREE.SphereBufferGeometry(180, 180, 180),
    new THREE.MeshBasicMaterial({color: 0xff0066})
);
scene.add(particleLight);
var pointLight = new THREE.PointLight(0xFFFFFF, 2, 300);
particleLight.add(pointLight);

// Directional Light
var directionalLight = new THREE.DirectionalLight(0xFFFFFF);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xdddddd);
renderer.setPixelRatio(window.devicePixelRatio);

console.log(THREE);

var effect = new THREE.OutlineEffect( renderer, {
    defaultThickness: 0.01,
    defaultColor: [0, 0, 0],
	defaultAlpha: 0.8,
 	defaultKeepAlive: true
});

document.body.appendChild(renderer.domElement);

var map = function(value, beforeMin, beforeMax, afterMin, afterMax) {
    return afterMin + (afterMax - afterMin) * ((value - beforeMin) / (beforeMax - beforeMin));
};

var render = function () {
    // Get time diff since last update.
    // https://threejs.org/docs/#api/core/Clock.getDelta
    var delta = clock.getDelta();
    var time = clock.elapsedTime;

    boxGroup.rotation.y += delta * 0.5;
    boxGroup.rotation.z += delta * 0.5;

    var len = boxGroup.children.length;
    for (var i = 0; i < len; i++) {
        var object = boxGroup.children[i];
        if (object.type !== "Mesh") {
            continue;
        }
        var scale = map(Math.sin(time * 10.0 + i * 300), -1, 1, 0.5, 1.0);
        object.scale.x = scale;
        object.scale.y = scale;
        object.scale.z = scale;
        object.rotation.x += delta * 0.5;
        object.rotation.y += delta * 0.5;
    }

    effect.render(scene, camera);

    requestAnimationFrame(render);
};

onResize();
render();

window.addEventListener('resize', onResize);

function onResize() {
    var width = window.innerWidth;
    var height = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
}