import './style.css'
import p5 from 'p5'
import testImg from './assets/001.jpeg'
// import testImg from './assets/002.jpg'
// import testImg from './assets/003.png'
// import testImg from './assets/005.jpg'
// import testImg from './assets/006.jpg'

let img: p5.Image
const logicalWidth = 800
// const logicalWidth = 800
const logicalHeight = 800
const pixelRatio = 3

const canvasWidth = logicalWidth * pixelRatio
const canvasHeight = logicalHeight * pixelRatio
const pixelRadius = 3
const gap = 0.5

const coverPositionImage = (width: number, height: number, imageRatio: number, canvasRatio: number) => {
  let top, left, right, bottom, scaledWidth, scaledHeight
  if (imageRatio > canvasRatio) {
    top = 0
    bottom = height
    scaledWidth = height * canvasRatio
    scaledHeight = height
    left = (width - scaledWidth) / 2
    right = left + scaledWidth
  } else if (imageRatio < canvasRatio) {
    left = 0
    right = width
    scaledHeight = width / canvasRatio
    scaledWidth = width
    top = (height - scaledHeight) / 2
    bottom = top + scaledHeight
  } else {
    top = 0
    left = 0
    right = width
    bottom = height
    scaledWidth = width
    scaledHeight = height
  }
  return { top, left, right, bottom, scaledWidth, scaledHeight }
}

const kernel0 = [
  [1 / 9, 1 / 9, 1 / 9],
  [1 / 9, 1 / 9, 1 / 9],
  [1 / 9, 1 / 9, 1 / 9],
]

// const kernel2 = [
//   [0, 0, 0],
//   [0, 2, 0],
//   [0, 0, 0],
// ]
const kernel2 = [
  [1 / 16, 2 / 16, 1 / 16],
  [2 / 16, 14 / 16, 2 / 16],
  [1 / 16, 2 / 16, 1 / 16],
]
const kernel = [
  [0, 0, 0],
  [0, 1.1, 0],
  [0, 0, 0],
]

const applyKernel = (color: number[], kernel: number[][]) => {
  let r = 0
  let g = 0
  let b = 0
  for (let i = 0; i < kernel.length; i++) {
    for (let j = 0; j < kernel[i].length; j++) {
      // debugger
      r += color[0] * kernel[i][j]
      g += color[1] * kernel[i][j]
      b += color[2] * kernel[i][j]
    }
  }
  return [r, g, b]
}

const applyKernel2 = (img: p5.Image, centerX: number, centerY: number, step: number, kernel: number[][]) => {
  let r = 0
  let g = 0
  let b = 0
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const x = centerX + i * step
      const y = centerY + j * step
      const c = img.get(x, y)
      r += c[0] * kernel[i + 1][j + 1]
      g += c[1] * kernel[i + 1][j + 1]
      b += c[2] * kernel[i + 1][j + 1]
    }
  }
  return [r, g, b]
}

let flag = 1
const kernels = [kernel, kernel2]
const currentKernel = () => {
  return kernels[flag % kernels.length]
}

const sketch = (p: p5) => {
  p.preload = async () => {
    img = p.loadImage(testImg)
  }
  p.setup = () => {
    const root = document.querySelector('body')!
    root.style.setProperty('--logical-width', `${logicalWidth}px`)
    root.style.setProperty('--logical-height', `${logicalHeight}px`)
    p.createCanvas(canvasWidth, canvasHeight)
    p.noLoop()
  }

  p.keyPressed = (k: any) => {
    if (k.key === 's') {
      // save image
      p.saveCanvas('myCanvas', 'png')
    }
  }

  p.draw = () => {
    p.clear()
    p.background(255)
    p.frameRate(1)
    // let currentKernel = kernels[1]
    // if (p.mouseIsPressed) {
    //   console.log('draw', p.mouseIsPressed)
    //   currentKernel = kernels[1]
    // }
    flag += 1

    const { width, height } = img
    const imageRatio = width / height
    const canvasRatio = canvasWidth / canvasHeight

    const { top, left, scaledWidth, scaledHeight } = coverPositionImage(width, height, imageRatio, canvasRatio)

    const rows = Math.floor(logicalHeight / pixelRadius)
    const cols = Math.floor(logicalWidth / pixelRadius)
    p.background(0)

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = (canvasWidth / cols) * j + (pixelRadius / 2) * pixelRatio
        const y = (canvasHeight / rows) * i + (pixelRadius / 2) * pixelRatio
        const offsetX = (x / canvasWidth) * scaledWidth + left
        const offsetY = (y / canvasHeight) * scaledHeight + top
        // const c = applyKernel(img.get(offsetX, offsetY), currentKernel())
        const c = applyKernel2(img, offsetX, offsetY, 1, currentKernel())

        p.fill(c)
        p.noStroke()
        p.ellipse(x, y, pixelRadius * pixelRatio - gap * pixelRatio)
      }
    }
  }
}

new p5(sketch)
