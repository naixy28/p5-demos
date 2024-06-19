import './style.css'
import p5 from 'p5'

let grid
const w = 5
let rows, cols

const config = {
  width: 300,
  height: 400,
}

let hueValue = 1

const make2DArray = (rows, cols) => {
  return new Array(rows).fill(0).map(() => new Array(cols).fill(-1))
}

const sketch = (p: p5) => {
  p.setup = () => {
    p.noStroke()
    p.colorMode(p.HSB)
    p.createCanvas(config.width, config.height)
    cols = p.floor(config.width / w)
    rows = p.floor(config.height / w)
    grid = make2DArray(rows, cols)

    // grid[20][10] = hueValue
  }
  p.draw = () => {
    p.background(0, 0, 0)
    p.fill(255, 0)
    // p.stroke(255)
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (grid[i][j] > 0) {
          const x = j * w
          const y = i * w
          p.fill(grid[i][j], 255, 255)
          p.square(x, y, w)
        }
      }
    }

    let nextGrid = make2DArray(rows, cols)
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const state = grid[i][j]
        if (state > 0) {
          const below = grid[i + 1]?.[j] ?? 1
          if (below <= 0 && i < rows - 1) {
            nextGrid[i + 1][j] = grid[i][j]
          } else if (below > 0) {
            const dir = p.random() > 0.5 ? -1 : 1
            const nextBelowA = grid[i + 1]?.[j + dir] ?? 1
            const nextBelowB = grid[i + 1]?.[j - dir] ?? 1
            if (nextBelowA <= 0 && i < rows - 1) {
              nextGrid[i + 1][j + dir] = grid[i][j]
            } else if (nextBelowB <= 0 && i < rows - 1) {
              nextGrid[i + 1][j - dir] = grid[i][j]
            } else {
              nextGrid[i][j] = grid[i][j]
            }
          } else {
            nextGrid[i][j] = grid[i][j]
          }
        }
      }
    }
    grid = nextGrid
    hueValue = (hueValue + 1) % 360
  }
  p.mouseDragged = () => {
    const mouseRow = p.floor(p.mouseY / w)
    const mouseCol = p.floor(p.mouseX / w)

    const matrix = 5
    const extent = ~~(matrix / 2)

    for (let i = -extent; i <= extent; i++) {
      for (let j = -extent; j <= extent; j++) {
        if (p.random(1) < 0.75) {
          const col = mouseCol + j
          const row = mouseRow + i
          if (row >= 0 && row < rows && col >= 0 && col < cols) {
            grid[row][col] = hueValue
          }
        }
      }
    }

    // if (i < 0 || i >= rows || j < 0 || j >= cols) return
    // grid[i][j] = hueValue
  }
}

new p5(sketch)
