import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import Stats from 'three/examples/jsm/libs/stats.module.js'
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min.js'

const canvas = document.querySelector('canvas.threejs');
const gui = new GUI();
const stats = new Stats();
stats.dom.style.cssText = 'position:absolute;top:225px;right:0px;';
document.body.appendChild(stats.dom);

import { Planet, Body } from './myclass';
import { createText } from './text2D';
const scale = 0.5*0.5*0.5*1.5e-11
const startDate = new Date('25 Apr 2025');
const startMillis = startDate.getTime();
let bodies = []
  
// initialize scene
const scene = new THREE.Scene()
// const axesHelper = new THREE.AxesHelper(10);
// scene.add(axesHelper );
const gridHelper = new THREE.GridHelper(100, 100);
scene.add(gridHelper );
const geo = new THREE.SphereGeometry( 0.00005, 16, 16 );
const mat = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const point = new THREE.Mesh( geo, mat );
point.position.set(0, 0, 0)
scene.add( point );

// initialize meshLine
const lineGeometry = new MeshLineGeometry();
const lineMaterial = new MeshLineMaterial({
  color: new THREE.Color(0x0000ff),
  lineWidth: 0.02,
  resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
});
const meshLine = new THREE.Mesh(lineGeometry, lineMaterial);
scene.add(meshLine);
 
// initialize camera
const camera = new THREE.PerspectiveCamera( 50, window.innerWidth /window.innerHeight, 0.0001, 6000 );
camera.position.z = 5

// initialize controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = false

// create meshes function
function createMeshes(size, color) {
  const geo = new THREE.SphereGeometry(size, 16, 16);
  const mat = new THREE.MeshBasicMaterial({color: new THREE.Color(color)});
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh)
  return mesh
}

// create trails function
function createMeshLines(color) {
  const lineGeometry = new MeshLineGeometry();
  const lineMaterial = new MeshLineMaterial({
    color: new THREE.Color(color),
    lineWidth: 0.04,
    resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
  });
  const meshLine = new THREE.Mesh(lineGeometry, lineMaterial);
  scene.add(meshLine);
  return meshLine
}

// create current string date function
function createCurrentDateString(date) {
  var d = date.getDate();
  var m = date.getMonth() + 1; //Month from 0 to 11
  var y = date.getFullYear();
  return d+"/"+m+"/"+y;
}

// read planets data
let lines = []
const loader = new THREE.FileLoader();
const data = await loader.loadAsync( '/src/data.txt' );
lines = data.split("\n")

// create planet bodies
let items = []
for (let i = 0; i < lines.length; i++) {
  items = lines[i].split(",")
  if (items[0] == '0') {
    continue
  }
  let body = new Body(items[0], Number(items[1]), Number(items[2]), Number(items[3]), Number(items[4]), 
            Number(items[5]), Number(items[6]), Number(items[7]), Number(items[8]), items[9], items[10]);
  bodies.push(body);
}

let planet = new Planet();

// create meshes
var myMeshes = []
for (var i = 0; i < bodies.length; i++) {
  myMeshes.push(createMeshes(bodies[i].radius, bodies[i].color))
}
myMeshes[0].material.wireframe = true
myMeshes[0].material.transparent = true
myMeshes[0].material.opacity = 0.0

// create trails
var myMeshLines = []
for (var i = 0; i < bodies.length; i++) {
  myMeshLines.push(createMeshLines(bodies[i].color))
}
myMeshLines[0].material.lineWidth = 0.0001
myMeshLines[0].material.color = new THREE.Color(0xff0000)

// create text icons
let planes = []
for (let i = 0; i < bodies.length; i++) {
  let plane = createText(bodies[i].name, 0.07)
  scene.add(plane)
  planes.push(plane);
}

// initialize renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setAnimationLoop( animate );

// animate function
function animate() {
    controls.update()  
    stats.update();
    
    for (var i = 0; i < bodies.length; i++) {
      var loc_x = scale*bodies[i].x
      var loc_y = scale*bodies[i].z
      var loc_z = -scale*bodies[i].y

      myMeshes[i].position.set(loc_x, loc_y, loc_z)
      planes[i].position.set(loc_x, loc_y+0.1, loc_z)
      planes[i].lookAt(camera.position)

      bodies[i].points.push(new THREE.Vector3(loc_x, loc_y, loc_z))
      if (bodies[i].points.length === 1000) {
         bodies[i].points.shift()
      }
      myMeshLines[i].geometry.setPoints(bodies[i].points)
      planet.update_position(bodies)
      
    }

    let anni = bodies[3].t/60/60/24/365.25;
    let myAnni = anni.toFixed(0)
    let text = "Anni="+myAnni+"\r"

    const str = planet.checkDate;
    const checkDate = new Date(str);
    const checkMillis = checkDate.getTime();
    let currentMillis = startMillis + bodies[3].t*1000;
    let currentStringDate = createCurrentDateString(new Date(currentMillis));
    if (currentMillis > checkMillis) {
      renderer.setAnimationLoop( null );
    }
    
    text += "Date= "+currentStringDate+"\r"+"\r"
    text += planet.calc_properties(bodies)+"\r";
    document.getElementById("properties").value = text
    
    renderer.render( scene, camera );
  }   

// window resize event listener
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight)
})

// pause and unpause event listener
document.addEventListener('keydown', onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode === 80) { // P key
        renderer.setAnimationLoop( null );
    }
    if (keyCode === 85) { // U key
        renderer.setAnimationLoop( animate );
        planet.change_values();
    } 
}

const orbitFolder = gui.addFolder('Orbit');
orbitFolder.add(planet, 'proCheckDate').name('Check Date');
orbitFolder.add(planet, 'proFdt').name('Delta time factor');
orbitFolder.add(planet, 'change_values').name('Change Values');
