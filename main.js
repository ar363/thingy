import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
  antialias: true,
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

const loadingManager = new THREE.LoadingManager();
loadingManager.onProgress = function (url, loaded, total) {
  console.log(`Loading file: ${url}\nLoaded ${loaded} of ${total} files.`);
};

const loadingElement = document.createElement("div");
loadingElement.style.position = "fixed";
loadingElement.style.top = "50%";
loadingElement.style.left = "50%";
loadingElement.style.transform = "translate(-50%, -50%)";
loadingElement.style.fontSize = "2rem";
loadingElement.style.color = "white";
loadingElement.style.zIndex = "100";
loadingElement.textContent = "Loading 3D model...";
document.body.appendChild(loadingElement);

let model;

const loader = new GLTFLoader(loadingManager);
loader.load(
  "/models/scene.glb",

  function (gltf) {
    model = gltf.scene;

    model.scale.set(10, 10, 16);

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.x = center.x - center.x * 1.1;

    model.position.y = -center.y / 6.5;
    model.position.z = center.z - center.z * 0.9;

    scene.add(model);

    document.body.removeChild(loadingElement);
  },

  function (xhr) {
    const progress = ((xhr.loaded / xhr.total) * 100).toFixed(0);
    loadingElement.textContent = `Loading 3D model... ${progress}%`;
  },
  function (error) {
    console.error("An error happened while loading the model:", error);
    loadingElement.textContent =
      "Error loading model. Using fallback geometry.";

    const geometry = new THREE.DodecahedronGeometry(10, 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0x8844ff,
      roughness: 0.5,
      metalness: 0.7,
      wireframe: true,
    });

    model = new THREE.Mesh(geometry, material);
    scene.add(model);

    setTimeout(() => {
      document.body.removeChild(loadingElement);
    }, 2000);
  }
);


const pointLight = new THREE.PointLight(0xf4f0e8, 1);
pointLight.position.set(20, 20, 20);

const ambientLight = new THREE.AmbientLight(0xf4f0e8, 0.5);
scene.add(pointLight, ambientLight);

const spaceTexture = new THREE.Color(0x210c2e);
scene.background = spaceTexture;

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;

  if (model) {
    model.rotation.y = t * 0.0002;
  }

  camera.position.z = t * +0.01 + 30;
  camera.position.x = t * +0.0002;
  camera.position.y = t * +0.0002;
}

document.body.onscroll = moveCamera;
moveCamera();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}

animate();
