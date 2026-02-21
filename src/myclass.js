import * as THREE from 'three';

class Planet {

  static G = 6.6743e-11
  static DT = 86400
  
  constructor(){
    this.proCheckDate = '01/01/2100'
    this.checkDate = '01/01/2100'
    this.proFdt = 0.1
    this.fdt = 0.1
  }

  createStandardDateString(itaDateString) {
    let tok = itaDateString.split('/')
    let day = tok[0];
    let month = tok[1];
    let year = tok[2];
    let stringDate = year+'/'+month+'/'+day;
    return stringDate
}

  change_values() {
    let standProCheckDate = this.createStandardDateString(this.proCheckDate);
    this.checkDate = standProCheckDate;

    this.fdt = this.proFdt;
  }
  
  update_position (bodies) {
    for (var body of bodies) {
      let fx = 0
      let fy = 0
      let fz = 0
      for (const other of bodies) {
        if (other.name != body.name) {
          if (body.t == 0) {
            body.dist_min = 1e-9*Math.sqrt(body.x**2 + body.y**2 + body.z**2)
            body.dist_max = 0
            body.vel_min = 1e-3*Math.sqrt(body.vx**2+body.vy**2+body.vz**2)
            body.vel_max = 0
          }
          let dx = other.x - body.x
          let dy = other.y - body.y
          let dz = other.z - body.z
          let r = Math.sqrt(dx**2 + dy**2 + dz**2)
          if (other.name == 'Sun') {
            body.r_tosun = r
          }
          let f = Planet.G * body.mass * other.mass / r**2
          fx += f * dx / r
          fy += f * dy / r
          fz += f * dz / r
        }   
      } 
      let ax = fx / body.mass
      let ay = fy / body.mass
      let az = fz / body.mass
      body.vx += ax * (Planet.DT) * this.fdt
      body.vy += ay * (Planet.DT) * this.fdt
      body.vz += az * (Planet.DT) * this.fdt
      let vel = 1e-3*Math.sqrt(body.vx**2+body.vy**2+body.vz**2)
      if (vel > body.vel_max) {
        body.vel_max = vel
      }
      if (vel < body.vel_min) {
        body.vel_min = vel
      }
      let dist_tosun= Math.abs(body.r_tosun*1e-9)
      if (dist_tosun< body.dist_min) {
        body.dist_min = dist_tosun
      }
      if (dist_tosun> body.dist_max) {
        body.dist_max = dist_tosun
      }

      body.x += body.vx * (Planet.DT) * this.fdt
      body.y += body.vy * (Planet.DT) * this.fdt
      body.z += body.vz * (Planet.DT) * this.fdt

      body.t += (Planet.DT) * this.fdt
      if (body.y_old <= 0 && body.y > 0) {
        let period = (body.t - body.prev_t)/60/60/24/365.25
        body.period = period
        body.prev_t = body.t
      }
      body.y_old = body.y
    }
  
  } 

  calc_properties (bodies) {
    let bodies_text = '';
    for (var body of bodies) {
      if (body.name != "Sun") {
        let name = body.name
        let myDist_min = body.dist_min.toFixed(0)
        let myDist_max = body.dist_max.toFixed(0)
        let period = body.period
        let myPeriod = period.toFixed(4)
        let myVel_min = body.vel_min.toFixed(1)
        let myVel_max = body.vel_max.toFixed(1)
        let body_text = "Nome="+name+"\r"+"Dist min 1e6km="+myDist_min+"\r"+"Dist max 1e6km="+myDist_max
                    + "\r"+"Revol anni="+myPeriod+"\r"+"Vel min km/s="+myVel_min+"\r"+"Vel max km/s="+myVel_max+"\r";
      bodies_text += body_text + "\r";
      }
    }
    return bodies_text                      
  }

} // end of class

class Body {
  constructor(cod, x, y, z, vx, vy, vz, mass, radius, color, name) {
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
  }

}
 
export {Planet, Body}
  