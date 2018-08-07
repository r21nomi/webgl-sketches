"use strict";
/* jshint node: true */

var THREE = require("three");

var clock = new THREE.Clock();
var scene = new THREE.Scene();

var colorsPerFace = [
    0xffcc00, 0xFF5A5A, 0x845BFF, 0x113ec1, 0x5AFF29, 0xFFA949, 0x302fea, 0xfda321, 0xccef3f, 0x00F1F2,
    0x123fed, 0xccef3f, 0xfda321, 0x302fea, 0x09f23d, 0xeeddcc, 0x113ec1, 0xfced3f, 0x00eecc, 0xFF4BBC
];

// Object
var originalVertices = [];
var geometry = new THREE.IcosahedronGeometry(20);

for (var i = 0, len = geometry.faces.length; i < len; i++) {
    var face = geometry.faces[i];
    face.color.setHex(colorsPerFace[i]);
}

for (var i = 0, len = geometry.vertices.length; i < len; i++) {
    var vertex = geometry.vertices[i];

    originalVertices.push({
        x: vertex.x,
        y: vertex.y
    });
}

var material = new THREE.MeshBasicMaterial({
    vertexColors: THREE.FaceColors
});

var obj = new THREE.Mesh(geometry, material);
obj.position.y = 5;
obj.castShadow = true;
scene.add(obj);

// Floor
var floor = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100, 32, 32),
    new THREE.ShadowMaterial({
        opacity : 0.3
    })
);
floor.position.y = -40;
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
floor.opacity = 0.9;
scene.add(floor);

// Light
var light = new THREE.SpotLight(0xffffff);
light.position.set(0, 400, 0);
light.castShadow = true;
scene.add(light);

// Camera
var fov = 45;
var aspect = window.innerWidth / window.innerHeight;
var cameraDistance = 100;
var camera = new THREE.PerspectiveCamera(fov, aspect);
camera.position.set(0, 50, cameraDistance);
camera.lookAt(new THREE.Vector3(0, 0, 0));

var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xED82FF);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);

var render = function() {
    var delta = clock.getDelta();
    var time = clock.elapsedTime;

    geometry.verticesNeedUpdate = true;
    for (var i = 0, len = geometry.vertices.length; i < len; i++) {
        var t = time * 8 + i * 300;
        var offset = 3;
        geometry.vertices[i].x = originalVertices[i].x + Math.sin(t) * offset;
        geometry.vertices[i].y = originalVertices[i].y + Math.sin(t * 0.8) * offset;
    }

    camera.position.x = cameraDistance * Math.sin(time);
    camera.position.z = cameraDistance * Math.cos(time);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    renderer.render(scene, camera);

    requestAnimationFrame(render);
};

onResize();
render();

window.addEventListener("resize", onResize);

function onResize() {
    var width = window.innerWidth;
    var height = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
}
