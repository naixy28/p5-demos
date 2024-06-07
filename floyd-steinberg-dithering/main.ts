import './style.css'
import p5 from 'p5'
// import image from '../assets/gloria.jpeg'
import image from '../assets/the-Statue-of-David.jpg'

const MAX_FACTOR = 4
let factor = 1

let img: p5.Image
let originalImage: p5.Image
const sketch = (p: p5) => {
  p.preload = () => {
    img = p.loadImage(image)
  }
  p.setup = () => {
    p.createCanvas(img.width, img.height * 2)
    p.noLoop()
    p.frameRate(1)
    originalImage = p.createImage(img.width, img.height)
    originalImage.copy(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height)
  }
  /**
 * for each y from top to bottom do
    for each x from left to right do
        oldpixel := pixels[x][y]
        newpixel := find_closest_palette_color(oldpixel)
        pixels[x][y] := newpixel
        quant_error := oldpixel - newpixel
        pixels[x + 1][y    ] := pixels[x + 1][y    ] + quant_error × 7 / 16
        pixels[x - 1][y + 1] := pixels[x - 1][y + 1] + quant_error × 3 / 16
        pixels[x    ][y + 1] := pixels[x    ][y + 1] + quant_error × 5 / 16
        pixels[x + 1][y + 1] := pixels[x + 1][y + 1] + quant_error × 1 / 16
 */

  const index = (x: number, y: number) => (x + y * img.width) * 4

  p.draw = () => {
    if (factor >= MAX_FACTOR) {
      p.noLoop()
      console.log('done')
    } else {
      factor++
    }
    originalImage.filter(p.GRAY)
    img = p.createImage(originalImage.width, originalImage.height)
    img.copy(
      originalImage,
      0,
      0,
      originalImage.width,
      originalImage.height,
      0,
      0,
      originalImage.width,
      originalImage.height
    )
    p.background(0)
    img.filter(p.GRAY)
    p.image(originalImage, 0, 0)
    // img.copy(0, 0, img.width, img.height, 0, img.height, img.width, img.height)
    img.loadPixels()

    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const pixelIndex = index(x, y)
        const r = img.pixels[pixelIndex]
        const g = img.pixels[pixelIndex + 1]
        const b = img.pixels[pixelIndex + 2]

        // const factor = 2

        const newR = ~~((~~((factor * r) / 255) * 255) / factor)
        const newG = ~~((~~((factor * g) / 255) * 255) / factor)
        const newB = ~~((~~((factor * b) / 255) * 255) / factor)

        const errorR = r - newR
        const errorG = g - newG
        const errorB = b - newB

        const p0Index = index(x + 1, y)
        const p1Index = index(x - 1, y + 1)
        const p2Index = index(x, y + 1)
        const p3Index = index(x + 1, y + 1)

        img.pixels[pixelIndex] = newR
        img.pixels[pixelIndex + 1] = newG
        img.pixels[pixelIndex + 2] = newB

        img.pixels[p0Index] = img.pixels[p0Index] + (errorR * 7) / 16
        img.pixels[p0Index + 1] = img.pixels[p0Index + 1] + (errorG * 7) / 16
        img.pixels[p0Index + 2] = img.pixels[p0Index + 2] + (errorB * 7) / 16

        img.pixels[p1Index] = img.pixels[p1Index] + (errorR * 3) / 16
        img.pixels[p1Index + 1] = img.pixels[p1Index + 1] + (errorG * 3) / 16
        img.pixels[p1Index + 2] = img.pixels[p1Index + 2] + (errorB * 3) / 16

        img.pixels[p2Index] = img.pixels[p2Index] + (errorR * 5) / 16
        img.pixels[p2Index + 1] = img.pixels[p2Index + 1] + (errorG * 5) / 16
        img.pixels[p2Index + 2] = img.pixels[p2Index + 2] + (errorB * 5) / 16

        img.pixels[p3Index] = img.pixels[p3Index] + (errorR * 1) / 16
        img.pixels[p3Index + 1] = img.pixels[p3Index + 1] + (errorG * 1) / 16
        img.pixels[p3Index + 2] = img.pixels[p3Index + 2] + (errorB * 1) / 16
      }
    }
    img.updatePixels()

    p.image(img, 0, img.height)
  }
}

new p5(sketch)
