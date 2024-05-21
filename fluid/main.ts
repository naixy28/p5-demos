import { Fluid } from './fluid'
import './style.css'
import p5 from 'p5'

const config = {
  scale: 10,
  N: 64,
  iter: 4,
}

let fluid: Fluid
let t = 0

const sketch = (p: p5) => {
  p.setup = () => {
    p.createCanvas(config.scale * config.N, config.scale * config.N)
    fluid = new Fluid(0.2, 0.0, 0.00001, config.N)
  }
  p.mouseDragged = () => {
    // debugger
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

    const angle = p.noise(t) * p.TWO_PI
    const v = p.createVector(p.cos(angle), p.sin(angle))

    p.background(0)
    fluid.step()
    fluid.addDensity(cx, cy, p.random(100, 500))
    fluid.addVelocity(cx, cy, v.x, v.y)
    fluid.renderD(p, config.scale)
    fadeD()
    t += 0.01
  }
}

new p5(sketch)
