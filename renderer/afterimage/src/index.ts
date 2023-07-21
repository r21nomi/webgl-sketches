import * as THREE from 'three'

export const Anima = function (this: any) {
  const scene = new THREE.Scene()
  const scene_bg = new THREE.Scene()
  let camera, camera_bg, mesh
  let initialized = false

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

    camera_bg = new THREE.OrthographicCamera(0, windowSize.w, windowSize.h, 0, 0, 10000)
  }

  const initObjects = () => {
    const windowSize = getWindowSize()
    const boxSize = Math.min(windowSize.w, windowSize.h) * 0.4
    const boxGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize)
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true
    })
    mesh = new THREE.Mesh(boxGeometry, material)
    scene.add(mesh)

    const bgGeometry = new THREE.PlaneGeometry(windowSize.w, windowSize.h, 10, 10)
    const bgMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.04,
    })
    const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial)
    bgMesh.position.x = windowSize.w / 2
    bgMesh.position.y = windowSize.h / 2
    scene_bg.add(bgMesh)
  }

  const canvas: any = document.getElementById('canvas')
  const renderer = new THREE.WebGLRenderer({
    canvas,
    preserveDrawingBuffer: true  // important for afterimage
  })
  renderer.autoClearColor = false  // important for afterimage

  const render = (t) => {
    mesh.rotation.x += 0.01
    mesh.rotation.y += 0.02

    renderer.render(scene, camera)
    renderer.render(scene_bg, camera_bg)

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

    renderer.setPixelRatio(window.devicePixelRatio)
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