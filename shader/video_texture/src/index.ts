import * as THREE from 'three'
// @ts-ignore
import vertexShader from '~/shader/vertexShader.vert'
// @ts-ignore
import fragmentShader from '~/shader/fragmentShader.frag'

const clock = new THREE.Clock()
const scene = new THREE.Scene()
scene.background = new THREE.Color(0.1, 0.1, 0.1)

const PADDING = 0.0
const SHADER_QUALITY = 0.5

let geometry, mesh
let vertices: number[] = []
let uvs: number[] = []
let indices: number[] = []
let paddings: number[] = []
let size: number[] = []

let video
let colorArray: any[] = []
let textureImageSize = {
  w: 0,
  h: 0
}

const uniforms = {
  time: {
    type: "f",
    value: 1.0
  },
  resolution: {
    type: "v2",
    value: new THREE.Vector2()
  },
  texture: {
    type: "t",
    value: null
  }
}

const getWindowSize = () => {
  return {
    w: window.innerWidth,
    h: window.innerHeight
  }
}

// Camera
const fov = 45
const aspect = getWindowSize().w / getWindowSize().h
const camera = new THREE.PerspectiveCamera(fov, aspect, 1, 10000)
const stageHeight = getWindowSize().h
// Make camera distance same as actual pixel value.
const z = stageHeight / Math.tan(fov * Math.PI / 360) / 2
camera.position.z = z

const canvas = document.getElementById("canvas") as any
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})

const render = () => {
  const delta = clock.getDelta()
  const time = clock.elapsedTime

  if (video) {
    uniforms.texture.value = createTexture(video)
  }

  uniforms.time.value = time

  renderer.render(scene, camera)

  requestAnimationFrame(render)
}

const onResize = () => {
  const width = getWindowSize().w
  const height = getWindowSize().h

  camera.aspect = width / height
  camera.updateProjectionMatrix()

  uniforms.resolution.value = new THREE.Vector2(width, height)

  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(width * SHADER_QUALITY, height * SHADER_QUALITY, false)
}

const getPositionAndSize = (vertexIndex) => {
  const windowSize = getWindowSize()
  const w = windowSize.w - PADDING * 2
  const h = windowSize.h - PADDING * 2
  const originX = -windowSize.w / 2
  const originY = -windowSize.h / 2
  const x = (vertexIndex === 0 || vertexIndex === 3) ? originX + PADDING : originX + PADDING + w
  const y = (vertexIndex === 0 || vertexIndex === 1) ? originY + PADDING : originY + PADDING + h
  const z = 0

  return {
    x,
    y,
    z,
    w,
    h
  }
}

const initVideo = async () => {
  video = document.getElementById("video")
  video.autoplay = true

  return new Promise((resolve, reject) => {
    video.addEventListener('loadeddata', () => {
      resolve('')
    }, false)
    video.src = "asset/video.mp4"
  })
}

const createTexture = (video): any => {
  const windowSize = getWindowSize()
  const winWidth = windowSize.w
  const winHeight = windowSize.h
  const imgWidth = video.videoWidth
  const imgHeight = video.videoHeight
  const isWinLandscape = winWidth > winHeight
  const isImgLandscape = imgWidth > imgHeight
  let imgW = 0
  let imgH = 0
  const alignVertical = () => {
    imgH = winHeight
    imgW = imgH * (imgWidth / imgHeight)
  }
  const alignHorizontal = () => {
    imgW = winWidth
    imgH = imgW * (imgHeight / imgWidth)
  }
  if (isWinLandscape) {
    if (isImgLandscape) {
      alignHorizontal()
      if (imgH > winHeight) {
        alignVertical()
      }
    } else {
      alignVertical()
    }
  } else if (isImgLandscape) {
    alignHorizontal()
  } else {
    alignVertical()
    if (imgW > winWidth) {
      alignHorizontal()
    }
  }

  const canvas = document.createElement("canvas")
  canvas.width = windowSize.w
  canvas.height = windowSize.h

  const context: any = canvas.getContext("2d")
  context.fillStyle = "rgb(0, 0, 0)"
  context.fillRect(0, 0, canvas.width, canvas.height)

  // Flip upside down
  context.translate(0, canvas.height)
  context.scale(1, -1)

  context.drawImage(
    video,
    0,
    0,
    imgWidth,
    imgHeight,
    canvas.width / 2 - imgW / 2,
    canvas.height / 2 - imgH / 2,
    imgW,
    imgH
  )

  const data = context.getImageData(0, 0, canvas.width, canvas.height)
  const colors = data.data
  const size = colors.length * 4
  const _colorArray = new Uint8Array(size)

  for (let i = 0; i < colors.length; i += 4) {
      _colorArray[i] = colors[i]
      _colorArray[i + 1] = colors[i + 1]
      _colorArray[i + 2] = colors[i + 2]
      _colorArray[i + 3] = colors[i + 3]
  }
  textureImageSize = {
    w: canvas.width,
    h: canvas.height
  }

  const dataTexture = new THREE.DataTexture(_colorArray, canvas.width, canvas.height, THREE.RGBAFormat)
  dataTexture.needsUpdate = true

  return dataTexture
}

const init = async () => {
  await initVideo()

  for (let j = 0; j < 4; j++) {
    const {  x, y, z, w, h } = getPositionAndSize(j)
    vertices.push(x, y, z)
    size.push(w, h)
  }

  for (let j = 0; j < 4; j++) {
    paddings.push(PADDING, PADDING)
  }

  uvs.push(
    0, 0,
    1, 0,
    1, 1,
    0, 1
  )

  // polygon order
  // 3 -- 2
  // |    |
  // 0 -- 1
  const vertexIndex = 0
  indices.push(
    vertexIndex + 0, vertexIndex + 1, vertexIndex + 2,
    vertexIndex + 2, vertexIndex + 3, vertexIndex + 0
  )

  geometry = new THREE.BufferGeometry()
  geometry.setIndex(indices)
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setAttribute('uv', new THREE.Uint16BufferAttribute(uvs, 2))
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(size, 2))
  geometry.setAttribute('padding', new THREE.Float32BufferAttribute(paddings, 2))

  const material = new THREE.RawShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
    blending: THREE.NormalBlending,
    depthTest: true,
    wireframe: false,
    side: THREE.DoubleSide,
    glslVersion: THREE.GLSL1
  })

  mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  render()

  window.addEventListener("resize", onResize)
}

init()
onResize()