import * as THREE from 'three'
// @ts-ignore
import vertexShader from '~/shader/vertexShader.vert'
// @ts-ignore
import fragmentShader from '~/shader/fragmentShader.frag'
import {util} from "~/util"

export const Anima = function (this: any) {
  const clock = new THREE.Clock()
  const scene = new THREE.Scene()
  let camera, mesh

  let geometry
  const vertices: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const paddings: number[] = []
  const size: number[] = []

  const PADDING = 0.0
  const SHADER_QUALITY = 0.25

  let currentTime = 0
  let material
  let initialized = false

  const uniforms = {
    // Second
    time: {type: 'f', value: 1.0},
    isDev: {type: 'f', value: util.isDev() ? 1.0 : 0.0},
    isThumbnail: {type: 'f', value: util.isThumbnail() ? 1.0 : 0.0},
    animaZOffset: {type: 'f', value: 0.0},
    resolution: {type: 'v2', value: new THREE.Vector2()},
    texture: { type: 't', value: null },
    textureResolution: { type: "v2", value: new THREE.Vector2() },
  }

  const getWindowSize = () => {
    return {
      w: window.innerWidth,
      h: window.innerHeight,
    }
  }

  const initCamera = () => {
    const windowSize = getWindowSize()
    const fov = 45
    const aspect = windowSize.w / windowSize.h
    camera = new THREE.PerspectiveCamera(fov, aspect, 1, 10000)

    const stageHeight = windowSize.h
    // Make camera distance same as actual pixel value.
    const z = stageHeight / Math.tan((fov * Math.PI) / 360) / 2
    camera.position.z = z
  }

  const initObjects = () => {
    for (let j = 0; j < 4; j++) {
      const {x, y, z, w, h} = getPositionAndSize(j)
      vertices.push(x, y, z)
      size.push(w, h)
    }

    for (let j = 0; j < 4; j++) {
      paddings.push(PADDING, PADDING)
    }

    uvs.push(0, 0, 1, 0, 1, 1, 0, 1)

    // polygon order
    // 3 -- 2
    // |    |
    // 0 -- 1
    const vertexIndex = 0
    indices.push(
      vertexIndex + 0,
      vertexIndex + 1,
      vertexIndex + 2,
      vertexIndex + 2,
      vertexIndex + 3,
      vertexIndex + 0
    )

    geometry = new THREE.BufferGeometry()
    geometry.setIndex(indices)
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    )
    geometry.setAttribute('uv', new THREE.Uint16BufferAttribute(uvs, 2))
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(size, 2))
    geometry.setAttribute(
      'padding',
      new THREE.Float32BufferAttribute(paddings, 2)
    )

    material = new THREE.RawShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.NormalBlending,
      depthTest: true,
      wireframe: false,
      side: THREE.DoubleSide,
      glslVersion: THREE.GLSL1,
    })

    mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
  }

  const canvas: any = document.getElementById('canvas')
  const renderer = new THREE.WebGLRenderer({
    canvas,
    preserveDrawingBuffer: true  // important for afterimage
  })
  renderer.autoClearColor = false  // important for afterimage

  const render = (t) => {
    clock.getDelta()
    const time = clock.elapsedTime

    currentTime = Date.now() / 1000

    uniforms.time.value = time

    renderer.render(scene, camera)

    requestAnimationFrame(render)
  }

  const onResize = () => {
    if (!initialized) {
      init()
    }

    const width = getWindowSize().w
    const height = getWindowSize().h

    if (camera) {
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    uniforms.resolution.value = new THREE.Vector2(width, height)

    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(width * SHADER_QUALITY, height * SHADER_QUALITY, false)
  }

  const getPositionAndSize = (vertexIndex): any => {
    const windowSize = getWindowSize()
    const w = windowSize.w - PADDING * 2
    const h = windowSize.h - PADDING * 2
    const originX = -windowSize.w / 2
    const originY = -windowSize.h / 2
    const x =
      vertexIndex === 0 || vertexIndex === 3
        ? originX + PADDING
        : originX + PADDING + w
    const y =
      vertexIndex === 0 || vertexIndex === 1
        ? originY + PADDING
        : originY + PADDING + h
    const z = 0

    return {
      x,
      y,
      z,
      w,
      h,
    }
  }

  const init = () => {
    if (initialized) {
      console.warn('already initialized')
      return
    }
    if (getWindowSize().w <= 0 || getWindowSize().h <= 0) {
      console.warn('window size is 0')
      return
    }

    initCamera()
    initObjects()

    requestAnimationFrame(render)

    initialized = true
  }

  window.addEventListener('resize', onResize)
  onResize()
}

new Anima()