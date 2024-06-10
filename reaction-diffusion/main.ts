import './style.css'
import p5 from 'p5'

const config = {
  width: 400,
  height: 400,
  dA: 1,
  dB: 0.5,
  feed: 0.055,
  k: 0.062,
  deltaT: 1,
}

enum KEYS {
  a = 'a',
  b = 'b',
}

let grid: Array<Array<{ a: number; b: number }>> = []
let next: Array<Array<{ a: number; b: number }>> = []

const swap = () => {
  let temp = grid
  grid = next
  next = temp
}

const getValue = (x: number, y: number, key: KEYS) => {
  if (x < 0 || x >= config.width || y < 0 || y >= config.height) {
    return 0
  }
  return grid[x][y][key]
}

const laplaceA = (x: number, y: number) => {
  let sumA = 0
  sumA += getValue(x, y, KEYS.a) * -1
  sumA += getValue(x - 1, y, KEYS.a) * 0.2 ?? 0
  sumA += getValue(x + 1, y, KEYS.a) * 0.2 ?? 0
  sumA += getValue(x, y - 1, KEYS.a) * 0.2 ?? 0
  sumA += getValue(x, y + 1, KEYS.a) * 0.2 ?? 0
  sumA += getValue(x - 1, y - 1, KEYS.a) * 0.05 ?? 0
  sumA += getValue(x + 1, y - 1, KEYS.a) * 0.05 ?? 0
  sumA += getValue(x + 1, y + 1, KEYS.a) * 0.05 ?? 0
  sumA += getValue(x - 1, y + 1, KEYS.a) * 0.05 ?? 0
  return sumA
}

const laplaceB = (x: number, y: number) => {
  let sumB = 0
  sumB += getValue(x, y, KEYS.b) * -1
  sumB += getValue(x - 1, y, KEYS.b) * 0.2 ?? 0
  sumB += getValue(x + 1, y, KEYS.b) * 0.2 ?? 0
  sumB += getValue(x, y - 1, KEYS.b) * 0.2 ?? 0
  sumB += getValue(x, y + 1, KEYS.b) * 0.2 ?? 0
  sumB += getValue(x - 1, y - 1, KEYS.b) * 0.05 ?? 0
  sumB += getValue(x + 1, y - 1, KEYS.b) * 0.05 ?? 0
  sumB += getValue(x + 1, y + 1, KEYS.b) * 0.05 ?? 0
  sumB += getValue(x - 1, y + 1, KEYS.b) * 0.05 ?? 0
  return sumB
}

const sketch = (p: p5) => {
  p.setup = () => {
    p.createCanvas(config.width, config.height)
    // p.noLoop()
    for (let i = 0; i < config.width; i++) {
      grid[i] = []
      next[i] = []
      for (let j = 0; j < config.height; j++) {
        grid[i][j] = {
          a: 1,
          b: 0,
        }
        next[i][j] = {
          a: 1,
          b: 0,
        }
      }
    }
    for (let i = 195; i < 205; i++) {
      for (let j = 195; j < 205; j++) {
        grid[i][j].b = 1
      }
    }
  }
  p.draw = () => {
    p.background(0)
    for (let i = 0; i < config.width; i++) {
      for (let j = 0; j < config.height; j++) {
        const a = grid[i][j].a
        const b = grid[i][j].b
        next[i][j].a = a + (config.dA * laplaceA(i, j) - a * b * b + config.feed * (1 - a)) * config.deltaT
        next[i][j].b = b + (config.dB * laplaceB(i, j) + a * b * b - (config.k + config.feed) * b) * config.deltaT
      }
    }

    p.loadPixels()
    for (let i = 0; i < config.width; i++) {
      for (let j = 0; j < config.height; j++) {
        const index = (i + j * config.width) * 4
        const concentration = ~~((grid[i][j].a - grid[i][j].b) * 255)
        p.pixels[index + 0] = concentration
        p.pixels[index + 1] = concentration
        p.pixels[index + 2] = concentration
        p.pixels[index + 3] = 255
        // p.pixels[index + 0] = 255 * grid[i][j].a - 255 * grid[i][j].b
      }
    }
    p.updatePixels()
    swap()
  }
}

new p5(sketch)
