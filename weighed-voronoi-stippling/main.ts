import './style.css'
import p5, { Vector } from 'p5'
import { Delaunay, Voronoi } from 'd3-delaunay'
import img from './gloria.jpeg'

let image: p5.Image

const config = {
  width: 500,
  height: 500,
}
let points: Vector[] = []
let centroids: Vector[] = []
let weights: number[] = []
let delaunay: Delaunay<number> = null
let voronoi: Voronoi = null

const sketch = (p: p5) => {
  p.preload = () => {
    image = p.loadImage(img)
  }
  p.setup = () => {
    config.width = image.width
    config.height = image.height
    p.createCanvas(config.width, config.height)
    // p.noLoop()
    for (let i = 0; i < 10000; i++) {
      const x = p.random(config.width)
      const y = p.random(config.height)
      const b = p.brightness(image.get(x, y))
      if (b < p.random(100)) {
        points.push(p.createVector(x, y))
      } else {
        i--
      }
    }
  }
  p.draw = () => {
    p.background(255)
    p.strokeWeight(3)
    p.fill(0, 0)

    points.forEach((point) => {
      p.point(point.x, point.y)
    })

    delaunay = Delaunay.from(points.map((point) => [point.x, point.y]))
    voronoi = delaunay.voronoi([0, 0, config.width, config.height])

    const polygons = voronoi.cellPolygons()
    const cells = Array.from(polygons)

    centroids = Array.from({ length: cells.length }, () => p.createVector(0, 0))
    weights = Array.from({ length: cells.length }, () => 0)

    image.loadPixels()
    let delaunayIndex = 0
    for (let i = 0; i < config.width; i++) {
      for (let j = 0; j < config.height; j++) {
        const index = (i + j * config.width) * 4
        const r = image.pixels[index]
        const g = image.pixels[index + 1]
        const b = image.pixels[index + 2]
        const bright = p.brightness([r, g, b])
        const weight = 1 - bright / 255
        delaunayIndex = delaunay.find(i, j, delaunayIndex)
        centroids[delaunayIndex].x += i * weight
        centroids[delaunayIndex].y += j * weight
        weights[delaunayIndex] += weight
      }
    }

    for (let i = 0; i < centroids.length; i++) {
      if (weights[i] > 0) {
        centroids[i].div(weights[i])
      } else {
        centroids[i] = points[i].copy()
      }
    }

    for (let i = 0; i < points.length; i++) {
      points[i].lerp(centroids[i], 0.1)
    }
  }
}

new p5(sketch)
