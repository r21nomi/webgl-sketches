import * as THREE from 'three';
import OrbitControls from "three-orbitcontrols";
let camera, light, scene, renderer;

function init() {
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
    document.body.appendChild(renderer.domElement);

    const fov = 45;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 10000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(-3, 3, 5);

    const _controls = new OrbitControls(camera, renderer.domElement);

    const color = 0xFFFFFF;
    const intensity = 1;
    light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 10);
    scene.add(light);

    const vertices = [
        // front
        { pos: [-1, -1,  1], norm: [ 0,  0,  1], uv: [0, 1], },
        { pos: [ 1, -1,  1], norm: [ 0,  0,  1], uv: [1, 1], },
        { pos: [-1,  1,  1], norm: [ 0,  0,  1], uv: [0, 0], },

        { pos: [-1,  1,  1], norm: [ 0,  0,  1], uv: [0, 0], },
        { pos: [ 1, -1,  1], norm: [ 0,  0,  1], uv: [1, 1], },
        { pos: [ 1,  1,  1], norm: [ 0,  0,  1], uv: [1, 0], },
        // right
        { pos: [ 1, -1,  1], norm: [ 1,  0,  0], uv: [0, 1], },
        { pos: [ 1, -1, -1], norm: [ 1,  0,  0], uv: [1, 1], },
        { pos: [ 1,  1,  1], norm: [ 1,  0,  0], uv: [0, 0], },

        { pos: [ 1,  1,  1], norm: [ 1,  0,  0], uv: [0, 0], },
        { pos: [ 1, -1, -1], norm: [ 1,  0,  0], uv: [1, 1], },
        { pos: [ 1,  1, -1], norm: [ 1,  0,  0], uv: [1, 0], },
        // back
        { pos: [ 1, -1, -1], norm: [ 0,  0, -1], uv: [0, 1], },
        { pos: [-1, -1, -1], norm: [ 0,  0, -1], uv: [1, 1], },
        { pos: [ 1,  1, -1], norm: [ 0,  0, -1], uv: [0, 0], },

        { pos: [ 1,  1, -1], norm: [ 0,  0, -1], uv: [0, 0], },
        { pos: [-1, -1, -1], norm: [ 0,  0, -1], uv: [1, 1], },
        { pos: [-1,  1, -1], norm: [ 0,  0, -1], uv: [1, 0], },
        // left
        { pos: [-1, -1, -1], norm: [-1,  0,  0], uv: [0, 1], },
        { pos: [-1, -1,  1], norm: [-1,  0,  0], uv: [1, 1], },
        { pos: [-1,  1, -1], norm: [-1,  0,  0], uv: [0, 0], },

        { pos: [-1,  1, -1], norm: [-1,  0,  0], uv: [0, 0], },
        { pos: [-1, -1,  1], norm: [-1,  0,  0], uv: [1, 1], },
        { pos: [-1,  1,  1], norm: [-1,  0,  0], uv: [1, 0], },
        // top
        { pos: [ 1,  1, -1], norm: [ 0,  1,  0], uv: [0, 1], },
        { pos: [-1,  1, -1], norm: [ 0,  1,  0], uv: [1, 1], },
        { pos: [ 1,  1,  1], norm: [ 0,  1,  0], uv: [0, 0], },

        { pos: [ 1,  1,  1], norm: [ 0,  1,  0], uv: [0, 0], },
        { pos: [-1,  1, -1], norm: [ 0,  1,  0], uv: [1, 1], },
        { pos: [-1,  1,  1], norm: [ 0,  1,  0], uv: [1, 0], },
        // bottom
        { pos: [ 1, -1,  1], norm: [ 0, -1,  0], uv: [0, 1], },
        { pos: [-1, -1,  1], norm: [ 0, -1,  0], uv: [1, 1], },
        { pos: [ 1, -1, -1], norm: [ 0, -1,  0], uv: [0, 0], },

        { pos: [ 1, -1, -1], norm: [ 0, -1,  0], uv: [0, 0], },
        { pos: [-1, -1,  1], norm: [ 0, -1,  0], uv: [1, 1], },
        { pos: [-1, -1, -1], norm: [ 0, -1,  0], uv: [1, 0], },
    ];

    const positions = [];
    const normals = [];
    const uvs = [];
    for (const vertex of vertices) {
        positions.push(...vertex.pos);
        normals.push(...vertex.norm);
        uvs.push(...vertex.uv);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.addAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.addAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

    const material = new THREE.MeshPhongMaterial({color: 0x88FF88});
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    light.position.copy( camera.getWorldPosition() );

    renderer.render(scene, camera);
}

init();
animate();
onWindowResize();