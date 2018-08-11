const THREE = require("three");

let clock = new THREE.Clock();
let scene = new THREE.Scene();

let colorsPerFace = [
    // 0x2185BF, 0x16587F, 0x2DB1FF, 0x0B2C40, 0x289FE5
    // 0x043B40, 0x276A73, 0x20A69A, 0xA1BEB4, 0xF1E2CB,
    // 0x4CFFFA, 0x459CFF, 0x8900FF, 0x73FFAE, 0xCECDCD,
    // 0x286B47, 0xACFFD2, 0x58EB9C, 0x486B58, 0x45B87A,
    0xC16B86, 0x6C5B7D, 0x325D7F, 0xF2727F, 0xF8B195
];

let originalVerticesArray = [];
let objectGroup = new THREE.Group();

function createObject(radius, position) {
    // Object
    let originalVertices = [];
    let geometry = new THREE.IcosahedronGeometry(radius);

    for (let i = 0, len = geometry.faces.length; i < len; i++) {
        let face = geometry.faces[i];
        face.color.setHex(colorsPerFace[Math.floor(Math.random() * colorsPerFace.length)]);
    }

    for (let i = 0, len = geometry.vertices.length; i < len; i++) {
        let vertex = geometry.vertices[i];

        originalVertices.push({
            x: vertex.x,
            y: vertex.y
        });
    }

    let material = new THREE.MeshBasicMaterial({
        vertexColors: THREE.FaceColors
    });

    let obj = new THREE.Mesh(geometry, material);
    obj.position.x = position.x;
    obj.position.y = position.y;
    obj.position.z = position.z;
    obj.castShadow = true;

    originalVerticesArray.push(originalVertices);

    return obj;
}

let windowWidth = window.innerWidth;
let objectRowCount = 5;
let objectRadius = windowWidth / objectRowCount / 2;

for (let x = 0; x < objectRowCount; x++) {
    for (let z = 0; z < objectRowCount; z++) {
        let meshX = x * objectRadius * 2 - windowWidth / 2 + objectRadius;
        let meshZ = z * objectRadius * 2 - windowWidth / 2 + objectRadius;

        let object = createObject(objectRadius, {
            x: meshX,
            y: Math.floor(Math.random() * 300),
            z: meshZ
        });

        objectGroup.add(object);
    }
}

scene.add(objectGroup);

// Floor
let floor = new THREE.Mesh(
    new THREE.PlaneGeometry(5000, 5000, 32, 32),
    new THREE.ShadowMaterial({
        opacity : 0.1
    })
);
floor.position.y = -40;
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
floor.opacity = 0.9;
scene.add(floor);

// Light
let light = new THREE.SpotLight(0xffffff);
light.position.set(0, 450, 0);
light.castShadow = true;
scene.add(light);

// Camera
let fov = 45;
let aspect = window.innerWidth / window.innerHeight;
let cameraDistance = 1000;
let camera = new THREE.PerspectiveCamera(fov, aspect);
camera.position.set(0, 600, cameraDistance);
camera.lookAt(new THREE.Vector3(0, 0, 0));

let renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xE3DACD);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);

let render = function() {
    let delta = clock.getDelta();
    let time = clock.elapsedTime;

    let len = objectGroup.children.length;
    for (let i = 0; i < len; i++) {
        let object = objectGroup.children[i];

        object.position.y += Math.sin(time * 2 + i * 500) * 5;

        let geometry = object.geometry;
        geometry.verticesNeedUpdate = true;

        let originalVertices = originalVerticesArray[i];

        for (let i = 0, len = geometry.vertices.length; i < len; i++) {
            let t = time * 8 + i * 300;
            let offset = 20;
            geometry.vertices[i].x = originalVertices[i].x + Math.sin(t) * offset;
            geometry.vertices[i].y = originalVertices[i].y + Math.sin(t * 0.8) * offset;
        }
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
    let width = window.innerWidth;
    let height = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
}
