const vertexShaderSource = require('webpack-glsl-loader!./shader/vertexShader.vert');
const fragmentShaderSource = require('webpack-glsl-loader!./shader/fragmentShader.frag');

const canvas = document.getElementById("canvas");
const gl = canvas.getContext('experimental-webgl', {preserveDrawingBuffer: true});
const startTime = Date.now();
let currentProgram;

const animate = () => {
    requestAnimationFrame(animate.bind(this));
    updateCanvas();
};

const updateCanvas = () => {
    if (!gl) {
        console.error('webgl is not available.');
        return;
    }

    if (!currentProgram) {
        let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

        if (!vertexShader || !fragmentShader) {
            // Could not compile program.
            console.error('Could not compile program.');
        }
        currentProgram = createProgram(gl, vertexShader, fragmentShader);
    }

    gl.useProgram(currentProgram);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let positions = [
        -1, -1, 0,
        1, -1, 0,
        -1, 1, 0,
        1, 1, 0
    ];

    let index = [
        0, 1, 2,
        1, 2, 3
    ];

    // position
    let vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    let positionAttributeLocation = gl.getAttribLocation(currentProgram, 'position');
    gl.enableVertexAttribArray(positionAttributeLocation);

    let size = 3;  // xyz
    let type = gl.FLOAT;
    let normalize = false;
    let stride = 0;
    let offset = 0;
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

    let ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(index), gl.STATIC_DRAW);

    // resolution
    let resolutionLocation = gl.getUniformLocation(currentProgram, 'resolution');
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    // time
    let timeLocation = gl.getUniformLocation(currentProgram, 'time');
    let time = (Date.now() - startTime) / 1000;
    gl.uniform1f(timeLocation, time);

    let primitiveType = gl.TRIANGLES;
    let vertexCount = index.length;
    gl.drawElements(primitiveType, vertexCount, gl.UNSIGNED_SHORT, 0);
    gl.flush();
};

const createShader = (gl, type, source) => {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);

        return null;
    }

    return shader;
};

const createProgram = (gl, vertexShader, fragmentShader) => {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        console.error(gl.getParameterInfoLog(program));
        gl.deleteProgram(program);
        return;
    }
    return program;
};

const onResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.setAttribute("width", width);
    canvas.setAttribute("height", height);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
};

window.addEventListener("resize", onResize);

onResize();
animate();