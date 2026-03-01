import * as THREE from 'three';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { Body } from './myclass';
import { createText } from './text2D';

export async function loadFile(filePath) {
    const loader = new THREE.FileLoader();    
    const data = await loader.loadAsync( filePath );
    const linesData = data.split("\n");
    return linesData;
}
    
export function initializeCamera() {
    const camera = new THREE.PerspectiveCamera( 50, window.innerWidth /window.innerHeight, 0.0001, 6000 );
    camera.position.z = 5
    return camera;
}

export function initializeControls(camera, canvas) {
    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = false
    return controls;
}

export function initializeRenderer(canvas){
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    return renderer;
}

export function create_scene() {
    // initialize scene
    const scene = new THREE.Scene()
    // 3D coordinates
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper );
    // horizontal grid
    const gridHelper = new THREE.GridHelper(100, 100);
    scene.add(gridHelper );
    // solar system barycenter
    const geo = new THREE.SphereGeometry( 0.00005, 16, 16 );
    const mat = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const point = new THREE.Mesh( geo, mat );
    point.position.set(0, 0, 0)
    scene.add( point );
    return scene;
}

export function createTrails(bodies, scene) {
    var myMeshLines = []
    for (var i = 0; i < bodies.length; i++) {
        const lineGeometry = new MeshLineGeometry();
        const lineMaterial = new MeshLineMaterial({
            color: new THREE.Color(bodies[i].color),
            lineWidth: 0.02,
            resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
        });
        const meshLine = new THREE.Mesh(lineGeometry, lineMaterial);
        scene.add(meshLine);
        myMeshLines.push(meshLine)
    }
    myMeshLines[0].material.lineWidth = 0.0001
    myMeshLines[0].material.color = new THREE.Color(0xff0000)
    return myMeshLines;
}

export function createBodies(lines) {
    let items = []
    let bodies = []
    for (let i = 0; i < lines.length; i++) {
        items = lines[i].split(",")
        if (items[0] == '0') {
            continue
        }
        let body = new Body(items[0], Number(items[1]), Number(items[2]), Number(items[3]), Number(items[4]), 
                    Number(items[5]), Number(items[6]), Number(items[7]), Number(items[8]), items[9], items[10]);
        bodies.push(body);
    }
    return bodies;
}

export function createMeshes(bodies, scene) {
    var myMeshes = []
    for (var i = 0; i < bodies.length; i++) {
        const geo = new THREE.SphereGeometry(bodies[i].radius, 32, 32);
        const mat = new THREE.MeshBasicMaterial({color: new THREE.Color(bodies[i].color)});
        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh)
        myMeshes.push(mesh)
    }
    myMeshes[0].material.wireframe = false
    myMeshes[0].material.transparent = true
    myMeshes[0].material.opacity = 0.4
    return myMeshes;
}

function createCurrentDateString(date) {
  var d = date.getDate();
  var m = date.getMonth() + 1; //Month from 0 to 11
  var y = date.getFullYear();
  return d+"/"+m+"/"+y;
}

export function createNamePlanes(bodies, scene) {
    let planes = []
    for (let i = 0; i < bodies.length; i++) {
        let plane = createText(bodies[i].name, 0.07)
        scene.add(plane)
        planes.push(plane);
    }
    return planes;
}

export function create_currentDate(str, startMillis, bodies) {
    const checkDate = new Date(str);
      const checkMillis = checkDate.getTime();
      let currentMillis = startMillis + bodies[3].t*1000;
      let currentStringDate = createCurrentDateString(new Date(currentMillis));
      return [checkMillis, currentMillis, currentStringDate];
}
