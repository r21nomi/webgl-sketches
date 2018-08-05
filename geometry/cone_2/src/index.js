"use strict";
/* jshint node: true */
/* globals THREE */

window.THREE = require("three");
require("three/examples/js/effects/OutlineEffect.js");

var vertexShader = require('webpack-glsl-loader!./shader/vertexShader.vert');
var fragmentShader = require('webpack-glsl-loader!./shader/fragmentShader.frag');
var mainBallFragmentShader = require('webpack-glsl-loader!./shader/mainBall.frag');

var clock = new THREE.Clock();
var scene = new THREE.Scene();

var uniforms = {
    time: { type: "f", value: 1.0 },
    resolution: { type: "v2", value: new THREE.Vector2() }
};

var boxRowCount = 8;
var boxSize = window.innerWidth / boxRowCount;
var windowWidth = window.innerWidth;
var radius = boxSize * 0.6 / 2;
var geometry = new THREE.ConeBufferGeometry(radius, 50, 32);

var totalBoxCount = boxRowCount * boxRowCount;
var count = 0.0;
var boxGroup = new THREE.Group();
for (var x = 0; x < boxRowCount; x++) {
    for (var z = 0; z < boxRowCount; z++) {
        var material = new THREE.ShaderMaterial({
            uniforms: {
                time: uniforms.time,
                resolution: uniforms.resolution,
                id: { type: "f", value: count++ },
                totalBoxCount: { type: "f", value: totalBoxCount }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        });

        var boxMesh = new THREE.Mesh(geometry, material);
        var meshX = x * boxSize - windowWidth / 2 + boxSize / 2;
        var meshZ = z * boxSize - windowWidth / 2 + boxSize / 2;
        boxMesh.position.x = meshX;
        boxMesh.position.y = 0;
        boxMesh.position.z = meshZ;

        boxGroup.add(boxMesh);
    }
}

scene.add(boxGroup);

// Camera
var fov = 45;
var aspect = window.innerWidth / window.innerHeight;
var camera = new THREE.PerspectiveCamera(fov, aspect);
camera.position.set(0, 500, 1000);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Point　Light
var mainBallMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: uniforms.time,
        resolution: uniforms.resolution,
        id: { type: "f", value: count++ },
        totalBoxCount: { type: "f", value: totalBoxCount }
    },
    vertexShader: vertexShader,
    fragmentShader: mainBallFragmentShader
});
var ball = new THREE.Mesh(
    new THREE.SphereBufferGeometry(150, 150, 150),
    mainBallMaterial
);
ball.position.y = 160;
scene.add(ball);

var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xeeeeee);
renderer.setPixelRatio(window.devicePixelRatio);

console.log(THREE);

document.body.appendChild(renderer.domElement);

var map = function(value, beforeMin, beforeMax, afterMin, afterMax) {
    return (
        afterMin +
        (afterMax - afterMin) * ((value - beforeMin) / (beforeMax - beforeMin))
    );
};

var render = function() {
    // Get time diff since last update.
    // https://threejs.org/docs/#api/core/Clock.getDelta
    var delta = clock.getDelta();
    var time = clock.elapsedTime;

    boxGroup.rotation.y += delta * 0.5;

    var len = boxGroup.children.length;
    for (var i = 0; i < len; i++) {
        var object = boxGroup.children[i];
        if (object.type !== "Mesh") {
            continue;
        }
        var scale = map(Math.sin(time * 10.0 + i % 5 * 300), -1, 1, 0.5, 5.0);
        object.scale.y = scale;
        object.position.y = object.geometry.parameters.height / 2 * scale;

        object.material.uniforms.id.value = i + 1;
    }

    uniforms.time.value = time;

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

    uniforms.resolution.value.x = renderer.domElement.width;
    uniforms.resolution.value.y = renderer.domElement.height;
}
