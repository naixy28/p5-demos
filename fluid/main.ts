import { Fluid } from './fluid'
import './style.css'
import p5 from 'p5'

const config = {
  scale: 10,
  N: 64,
  iter: 4,
}

let fluid: Fluid

const sketch = (p: p5) => {
  p.setup = () => {
    p.createCanvas(config.scale * config.N, config.scale * config.N)
    fluid = new Fluid(0.2, 0.00001, 0.0000001, config.N)
  }
  p.mouseDragged = () => {
    // debugger
    fluid.addDensity(Math.floor(p.mouseX / config.scale), Math.floor(p.mouseY / config.scale), 100)
    const amtX = p.mouseX - p.pmouseX
    const amtY = p.mouseY - p.pmouseY
    fluid.addVelocity(Math.floor(p.mouseX / config.scale), Math.floor(p.mouseY / config.scale), amtX, amtY)
  }
  p.draw = () => {
    p.background(0)
    fluid.step()
    fluid.renderD(p, config.scale)
  }
}

new p5(sketch)
