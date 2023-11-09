import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new GUI();
gui.close();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Galaxy
 */
// Parameters
const parameters = {};
parameters.count = 100000;
parameters.size = 0.01;
parameters.radius = 5;
parameters.branches = 3;
parameters.spin = 3;
parameters.randomness = 0.02;
parameters.randomnessPower = 3;
parameters.insideColor = "#270aff";
parameters.outsideColor = "#01ff45";
parameters.speedRotation = 0.05;

// init
let galaxyGeometry = null;
let galaxyMaterial = null;
let points = null;

const generateGalaxy = () => {
  if (points !== null) {
    // free memory, dispose is a Three Js function
    galaxyGeometry.dispose();
    galaxyMaterial.dispose();
    scene.remove(points);
  }

  /**
   * Geometry
   */

  galaxyGeometry = new THREE.BufferGeometry();
  // Positions
  const positions = new Float32Array(parameters.count * 3);
  // Colors
  const colors = new Float32Array(parameters.count * 3);
  // Inside Colors
  const insideColor = new THREE.Color(parameters.insideColor);
  const outsideColor = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;
    // Radius
    const radius = Math.random() * parameters.radius;
    const spinAngle = radius * parameters.spin;

    // Angle
    // we are using modulo because we want the points on branches
    // if 3 branches => %3
    // We are dividing by three so we have values between 0 and 1 0 0.33 0.66 0 0.33 0.66
    const branchAngle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

    // Randomness
    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    // Basic randomness
    // const randomX = (Math.random() - 0.5) * parameters.randomness;
    // const randomY = (Math.random() - 0.5) * parameters.randomness;
    // const randomZ = (Math.random() - 0.5) * parameters.randomness;

    // if (i < 20) {
    //   console.log(i, branchAngle);
    // }
    positions[i3] = radius * Math.cos(branchAngle + spinAngle) + randomX;
    positions[i3 + 1] = randomY * Math.random() * 2;
    positions[i3 + 2] = radius * Math.sin(branchAngle + spinAngle) + randomZ;

    // Basic randomness
    // positions[i3 + 0] = (Math.random() - 0.5) * 50;
    // positions[i3 + 1] = (Math.random() - 0.5) * 50;
    // positions[i3 + 2] = (Math.random() - 0.5) * 50;

    // Colors
    // we need to clone the original color
    const mixedColor = insideColor.clone();
    // lerp fucntion make a perfect mix between two colors
    mixedColor.lerp(outsideColor, radius / parameters.radius);
    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  galaxyGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  galaxyGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  /**
   * Material
   */
  galaxyMaterial = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  /**
   * Mesh
   */
  points = new THREE.Points(galaxyGeometry, galaxyMaterial);
  scene.add(points);
};

generateGalaxy();

/**
 * GUI
 */

const particlesFolder = gui.addFolder("Particles");
particlesFolder.close();
particlesFolder
  .add(parameters, "count")
  .min(100)
  .max(1000000)
  .step(100)
  .onFinishChange(generateGalaxy);
particlesFolder
  .add(parameters, "size")
  .min(0.01)
  .max(0.1)
  .step(0.001)
  .onFinishChange(generateGalaxy);

const galaxyFolder = gui.addFolder("Galaxy");
galaxyFolder.close();
galaxyFolder
  .add(parameters, "radius")
  .min(0.01)
  .max(20)
  .step(0.01)
  .onFinishChange(generateGalaxy);
galaxyFolder
  .add(parameters, "branches")
  .min(2)
  .max(20)
  .step(1)
  .onFinishChange(generateGalaxy);
galaxyFolder
  .add(parameters, "spin")
  .min(-5)
  .max(5)
  .step(1)
  .onFinishChange(generateGalaxy);

const randomnessFolder = gui.addFolder("Randomness");
randomnessFolder.close;
randomnessFolder
  .add(parameters, "randomness")
  .min(0)
  .max(2)
  .step(0.001)
  .onFinishChange(generateGalaxy);
randomnessFolder
  .add(parameters, "randomnessPower")
  .min(1)
  .max(10)
  .step(0.001)
  .onFinishChange(generateGalaxy);
const colorsFolder = gui.addFolder("Colors");
colorsFolder
  .addColor(parameters, "insideColor")

  .onFinishChange(generateGalaxy);
colorsFolder
  .addColor(parameters, "outsideColor")
  .onFinishChange(generateGalaxy);

const animationFolder = gui.addFolder("Animation");
animationFolder
  .add(parameters, "speedRotation")
  .min(-0.8)
  .max(0.8)
  .step(0.001)
  .onFinishChange(generateGalaxy);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // update galaxy
  points.rotation.y = -elapsedTime * parameters.speedRotation;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
