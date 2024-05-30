import './style.css'
import p5, { Vector } from 'p5'
import { Delaunay, Voronoi } from 'd3-delaunay'
// import img from './gloria.jpeg'
// import img from './noise.jpg'
// import img from './The Weeknd Dawn FM Cover.jpg'
// import img from './Taylor Swift.jpg'
// import img from './bcs.jpg'
// import img from './sea.jpeg'
import img from './fujii.jpeg'

let image: p5.Image

enum Style {
  POINTS,
  PAINT,
}

const config = {
  width: 500,
  height: 500,
  maxBrightness: 255,
  iterate: 20,
  infinite: true,
  pointCount: 20000,
  pointMinSize: 10,
  pointMaxSize: 20,
  style: Style.PAINT,
}
let points: Vector[] = []
let centroids: Vector[] = []
let weights: number[] = []
let counts: number[] = []
let avgWeights: number[] = []
let maxWeight = 0
let delaunay: Delaunay<number>
let voronoi: Voronoi<number>
let iterate = 0

const sketch = (p: p5) => {
  p.preload = () => {
    image = p.loadImage(img)
  }
  p.setup = () => {
    // p.frameRate(10)
    config.width = image.width
    config.height = image.height
    p.createCanvas(config.width, config.height)
    image.loadPixels()
    // p.noLoop()
    for (let i = 0; i < config.pointCount; i++) {
      const x = p.random(config.width)
      const y = p.random(config.height)
      const b = p.brightness(image.get(x, y))
      if (b < p.random(config.maxBrightness)) {
        points.push(p.createVector(x, y))
      } else {
        i--
      }
    }
  }

  const resetCanvas = (p: p5) => {
    if (!config.infinite && iterate > config.iterate) {
      p.noLoop()
      console.log('done')
      // console.log('maxWeight', maxWeight, 'avgWeights', avgWeights)
      return
    }

    p.background(255)
    p.strokeWeight(1)
    p.fill(0, 0)
    iterate++
  }

  const drawPoints = (points: Vector[]) => {
    for (let i = 0; i < points.length; i++) {
      const v = points[i]
      const color = image.get(v.x, v.y)
      let sw
      switch (config.style) {
        case Style.POINTS:
          sw = 2
          p.stroke(0)
          break
        case Style.PAINT:
          sw = p.map(avgWeights[i], 0, maxWeight, config.pointMinSize, config.pointMaxSize, true)
          p.stroke(color)
      }
      p.strokeWeight(sw)
      p.point(v.x, v.y)
    }
  }

  const updatePoints = (points: Vector[], drawVoronoi = false) => {
    delaunay = Delaunay.from(points.map((point) => [point.x, point.y]))
    voronoi = delaunay.voronoi([0, 0, config.width, config.height])

    const polygons = voronoi.cellPolygons()
    const cells = Array.from(polygons)

    // draw vorinoi
    if (drawVoronoi) {
      for (let cell of cells) {
        p.beginShape()
        for (let point of cell) {
          p.vertex(point[0], point[1])
        }
        p.endShape(p.CLOSE)
      }
    }

    centroids = Array.from({ length: cells.length }, () => p.createVector(0, 0))
    weights = Array.from({ length: cells.length }, () => 0)

    // image.loadPixels()
    let delaunayIndex = 0
    for (let i = 0; i < config.width; i++) {
      for (let j = 0; j < config.height; j++) {
        const index = (i + j * config.width) * 4
        const r = image.pixels[index]
        const g = image.pixels[index + 1]
        const b = image.pixels[index + 2]
        const bright = 0.2126 * r + 0.7152 * g + 0.0722 * b
        const weight = 1 - bright / 255
        delaunayIndex = delaunay.find(i, j, delaunayIndex)
        centroids[delaunayIndex].x += i * weight
        centroids[delaunayIndex].y += j * weight
        weights[delaunayIndex] += weight
        counts[delaunayIndex]++
      }
    }

    maxWeight = 0
    for (let i = 0; i < centroids.length; i++) {
      if (weights[i] > 0) {
        centroids[i].div(weights[i])
        avgWeights[i] = weights[i] / (counts[i] || 1)
        if (avgWeights[i] > maxWeight) {
          maxWeight = avgWeights[i]
        }
      } else {
        centroids[i] = points[i].copy()
      }
    }

    for (let i = 0; i < points.length; i++) {
      points[i].lerp(centroids[i], 1)
    }
  }

  p.draw = () => {
    resetCanvas(p)

    updatePoints(points, false)
    drawPoints(points)
  }
}

new p5(sketch)
