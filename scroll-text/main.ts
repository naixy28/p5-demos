import './style.css'
import p5 from 'p5'

const text =
  'Proident velit reprehenderit dolore do ullamco id consectetur consequat Lorem qui adipisicing adipisicing ea reprehenderit.'

let font: p5.Font
let yOffset = 0

const sketch = (p: p5) => {
  p.preload = () => {
    font = p.loadFont('./MesloLGS NF Bold Italic.ttf')
  }
  p.setup = () => {
    p.createCanvas(600, 600, p.WEBGL)
    p.textFont(font)
    // p.textAlign(p.CENTER, p.CENTER)
    p.textSize(50)
  }
  p.draw = () => {
    p.background(0)
    p.rotateX(p.PI / 4)
    p.fill(255, 255, 0)
    // p.fill(255)
    p.textAlign(p.CENTER, p.TOP)
    p.text(text, -p.width / 2, p.height / 2 - yOffset, p.width, 1000)
    yOffset += 2
    // p.fill(255)
    // p.ellipse(p.width / 2, p.height / 2, 50, 50)
  }
}

new p5(sketch)
