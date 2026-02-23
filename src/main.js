import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js'
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min.js'
import { Planet} from './myclass';
import * as UTI from './util.js'

const gui = new GUI();
const stats = new Stats();
stats.dom.style.cssText = 'position:absolute;top:225px;right:0px;';
document.body.appendChild(stats.dom);

const scale = 1.875e-12
const startDate = new Date('25 Apr 2025');
const startMillis = startDate.getTime();

// read planets data
const loader = new THREE.FileLoader();
const data = await loader.loadAsync( '/src/data.txt' );
const linesData = data.split("\n")

const canvas = document.querySelector('canvas.threejs');
const scene = UTI.create_scene();
const camera = UTI.initializeCamera();
const controls = UTI.initializeControls(camera, canvas);
const bodies = UTI.createBodies(linesData);
const myMeshes = UTI.createMeshes(bodies, scene);
const myMeshLines = UTI.createTrails(bodies, scene);
const planes = UTI.createNamePlanes(bodies, scene)
const renderer = UTI.initializeRenderer(canvas);
let planet = new Planet();

renderer.setAnimationLoop( animate );

// animate function
function animate() {

  controls.update()  
  stats.update();
  
  if (planet.fdt > 0) {
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
  }

  let anni = bodies[3].t/60/60/24/365.25;
  let myAnni = anni.toFixed(0)
  let text = "Anni="+myAnni+"\r"

  let [checkMillis, currentMillis, currentStringDate] = UTI.create_currentDate(planet.checkDateString, startMillis, bodies);
  if (currentMillis > checkMillis) {
    planet.fdt = 0;
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
        // renderer.setAnimationLoop( null );
        planet.fdt = 0;
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
