import * as THREE from 'three';

const G = 6.6743e-11
const DT = 0.4*86400

class Planet {
  constructor(cod, x, y, z, vx, vy, vz, mass, radius, color, name, pix) {
    this.cod = cod
    this.x = x
    this.y = y
    this.z = z
    this.vx = vx
    this.vy = vy
    this.vz = vz
    this.mass = mass
    this.radius = radius
    this.color = color
    this.name = name
    this.pix = pix
    this.y_old = 0
    this.prev_t = 0
    this.t = 0
    this.period = 0
    this.r_tosun = 0
    this.dist_min = 0
    this.dist_max = 0
    this.vel_min = 0
    this.vel_max = 0
    this.points = []
    this.checkDate = '01/01/2100'
  }

  update_position () {
    var fx = 0
    var fy = 0
    var fz = 0
    for (const other of bodies) {
      if (other.name != this.name) {
        if (this.t == 0) {
          this.dist_min = 1e-9*Math.sqrt(this.x**2 + this.y**2 + this.z**2)
          this.dist_max = 0
          this.vel_min = 1e-3*Math.sqrt(this.vx**2+this.vy**2+this.vz**2)
          this.vel_max = 0
        }
        var dx = other.x - this.x
        var dy = other.y - this.y
        var dz = other.z - this.z
        var r = Math.sqrt(dx**2 + dy**2 + dz**2)
        if (other.name == 'Sun') {
          this.r_tosun = r
        }
        var f = G * this.mass * other.mass / r**2
        fx += f * dx / r
        fy += f * dy / r
        fz += f * dz / r
      }   
    } 
    var ax = fx / this.mass
    var ay = fy / this.mass
    var az = fz / this.mass
    this.vx += ax * DT
    this.vy += ay * DT
    this.vz += az * DT
    let vel = 1e-3*Math.sqrt(this.vx**2+this.vy**2+this.vz**2)
    if (vel > this.vel_max) {
      this.vel_max = vel
    }
    if (vel < this.vel_min) {
      this.vel_min = vel
    }
    let dist_tosun= Math.abs(this.r_tosun*1e-9)
    if (dist_tosun< this.dist_min) {
      this.dist_min = dist_tosun
    }
    if (dist_tosun> this.dist_max) {
      this.dist_max = dist_tosun
    }

    this.x += this.vx * DT
    this.y += this.vy * DT
    this.z += this.vz * DT

    this.t += DT
    if (this.y_old <= 0 && this.y > 0) {
      let period = (this.t - this.prev_t)/60/60/24/365.25
      this.period = period
      this.prev_t = this.t
    }
    this.y_old = this.y
  } 

  calc_properties () {
    let name = this.name
    let myDist_min = this.dist_min.toFixed(0)
    let myDist_max = this.dist_max.toFixed(0)
    let period = this.period
    let myPeriod = period.toFixed(4)
    let myVel_min = this.vel_min.toFixed(1)
    let myVel_max = this.vel_max.toFixed(1)
    let text = "Nome="+name+"\r"+"Dist min 1e6km="+myDist_min+"\r"+"Dist max 1e6km="+myDist_max
                + "\r"+"Revol anni="+myPeriod+"\r"+"Vel min km/s="+myVel_min+"\r"+"Vel max km/s="+myVel_max+"\r";
    return text                      
  }

} // end of class

var lines = []
const loader = new THREE.FileLoader();
const data = await loader.loadAsync( '/src/data.txt' );
lines = data.split("\n")

var tok = []
var bodies = []
for (var i = 0; i < lines.length; i++) {
  tok = lines[i].split(",")
  if (tok[0] == '0') {
    continue
  }
  bodies.push(new Planet(tok[0], Number(tok[1]), Number(tok[2]), Number(tok[3]), Number(tok[4]), Number(tok[5]), Number(tok[6]),
                          Number(tok[7]), Number(tok[8]), tok[9], tok[10], tok[11]))
} 
 
export {bodies}
  