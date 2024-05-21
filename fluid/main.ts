import { Fluid } from './fluid'
import './style.css'
import p5 from 'p5'

const config = {
  scale: 4,
  N: 128,
  iter: 4,
}

let fluid: Fluid
let t = 0

const sketch = (p: p5) => {
  p.setup = () => {
    p.createCanvas(config.scale * config.N, config.scale * config.N)
    fluid = new Fluid(0.2, 0.0, 0.0000001, config.N)
  }
  p.mouseDragged = () => {
    fluid.addDensity(Math.floor(p.mouseX / config.scale), Math.floor(p.mouseY / config.scale), 150)
    const amtX = p.mouseX - p.pmouseX
    const amtY = p.mouseY - p.pmouseY
    fluid.addVelocity(Math.floor(p.mouseX / config.scale), Math.floor(p.mouseY / config.scale), amtX, amtY)
  }

  const fadeD = () => {
    for (let i = 0; i < fluid.density.length; i++) {
      fluid.density[i] *= 0.99
      // fluid.density[i] -= 0.1
    }
  }
  p.draw = () => {
    const cx = p.width / 2 / config.scale
    const cy = p.height / 2 / config.scale

    const angle = p.map(p.noise(t), 0, 1, -1, 1) * p.TWO_PI
    const v = p.createVector(p.cos(angle), p.sin(angle))
    v.mult(0.5)

    p.background('black')
    fluid.step()
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        fluid.addDensity(cx + i, cy + j, p.random(200, 500))
      }
    }
    // fluid.addDensity(cx, cy, p.random(200, 500))
    fluid.addVelocity(cx, cy, v.x, v.y)
    // fluid.renderD(p, config.scale)
    fluid.renderDyedV(p, config.scale)
    fadeD()
    t += 0.01
  }
}

new p5(sketch)
