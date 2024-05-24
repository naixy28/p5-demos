import p5 from 'p5'

export class Fluid {
  static N = 256
  static iter = 4

  size: number
  dt: number
  diffusion: number
  viscosity: number

  s: number[]
  density: number[]

  Vx: number[]
  Vy: number[]
  Vx0: number[]
  Vy0: number[]

  constructor(dt: number, diffusion: number, viscosity: number, N: number = Fluid.N) {
    this.size = N
    this.dt = dt
    this.diffusion = diffusion
    this.viscosity = viscosity

    this.s = Array.from({ length: N * N }, () => 0)
    this.density = Array.from({ length: N * N }, () => 0)

    this.Vx = Array.from({ length: N * N }, () => 0)
    this.Vy = Array.from({ length: N * N }, () => 0)
    this.Vx0 = Array.from({ length: N * N }, () => 0)
    this.Vy0 = Array.from({ length: N * N }, () => 0)
  }

  addDensity = (x: number, y: number, amount: number) => {
    this.density[this.IX(x, y)] += amount
  }

  addVelocity = (x: number, y: number, amountX: number, amountY: number) => {
    const index = this.IX(x, y)

    this.Vx[index] += amountX
    this.Vy[index] += amountY
  }
  IX = (x: number, y: number) => {
    return x + y * this.size
  }
  setBound = (b: number, x: number[], N: number) => {
    for (let i = 1; i < N - 1; i++) {
      x[this.IX(i, 0)] = b === 2 ? -x[this.IX(i, 1)] : x[this.IX(i, 1)]
      x[this.IX(i, N - 1)] = b === 2 ? -x[this.IX(i, N - 2)] : x[this.IX(i, N - 2)]
    }
    for (let j = 1; j < N - 1; j++) {
      x[this.IX(0, j)] = b === 1 ? -x[this.IX(1, j)] : x[this.IX(1, j)]
      x[this.IX(N - 1, j)] = b === 1 ? -x[this.IX(N - 2, j)] : x[this.IX(N - 2, j)]
    }
    x[this.IX(0, 0)] = 0.5 * (x[this.IX(1, 0)] + x[this.IX(0, 1)])
    x[this.IX(0, N - 1)] = 0.5 * (x[this.IX(1, N - 1)] + x[this.IX(0, N - 2)])
    x[this.IX(N - 1, 0)] = 0.5 * (x[this.IX(N - 2, 0)] + x[this.IX(N - 1, 1)])
    x[this.IX(N - 1, N - 1)] = 0.5 * (x[this.IX(N - 2, N - 1)] + x[this.IX(N - 1, N - 2)])
  }
  linSolver = (b: number, x: number[], x0: number[], a: number, c: number, iter: number, N: number) => {
    const cRecip = 1.0 / c
    for (let k = 0; k < iter; k++) {
      for (let j = 1; j < N - 1; j++) {
        for (let i = 1; i < N - 1; i++) {
          x[this.IX(i, j)] =
            (x0[this.IX(i, j)] +
              a * (x[this.IX(i + 1, j)] + x[this.IX(i - 1, j)] + x[this.IX(i, j + 1)] + x[this.IX(i, j - 1)])) *
            cRecip
        }
      }
      this.setBound(b, x, N)
    }
  }

  diffuse = (b: number, x: number[], x0: number[], diff: number, dt: number, iter: number, N: number) => {
    const a = dt * diff * (N - 2) * (N - 2)
    this.linSolver(b, x, x0, a, 1 + 6 * a, iter, N)
  }

  project = (velocX: number[], velocY: number[], p: number[], div: number[], iter: number, N: number) => {
    for (let j = 1; j < N - 1; j++) {
      for (let i = 1; i < N - 1; i++) {
        div[this.IX(i, j)] =
          (-0.5 *
            (velocX[this.IX(i + 1, j)] -
              velocX[this.IX(i - 1, j)] +
              velocY[this.IX(i, j + 1)] -
              velocY[this.IX(i, j - 1)])) /
          N
        p[this.IX(i, j)] = 0
      }
    }
    this.setBound(0, div, N)
    this.setBound(0, p, N)
    this.linSolver(0, p, div, 1, 6, iter, N)
    for (let j = 1; j < N - 1; j++) {
      for (let i = 1; i < N - 1; i++) {
        velocX[this.IX(i, j)] -= 0.5 * (p[this.IX(i + 1, j)] - p[this.IX(i - 1, j)]) * N
        velocY[this.IX(i, j)] -= 0.5 * (p[this.IX(i, j + 1)] - p[this.IX(i, j - 1)]) * N
      }
    }
    this.setBound(1, velocX, N)
    this.setBound(2, velocY, N)
  }
  advect = (b: number, d: number[], d0: number[], velocX: number[], velocY: number[], dt: number, N: number) => {
    let i0, i1, j0, j1

    let dtx = dt * (N - 2)
    let dty = dt * (N - 2)

    let s0, s1, t0, t1
    let tmp1, tmp2, x, y

    let Nfloat = N - 2
    let ifloat, jfloat
    let i, j

    for (j = 1, jfloat = 1; j < N - 1; j++, jfloat++) {
      for (i = 1, ifloat = 1; i < N - 1; i++, ifloat++) {
        tmp1 = dtx * velocX[this.IX(i, j)]
        tmp2 = dty * velocY[this.IX(i, j)]
        x = ifloat - tmp1
        y = jfloat - tmp2

        if (x < 0.5) x = 0.5
        if (x > Nfloat + 0.5) x = Nfloat + 0.5
        i0 = Math.floor(x)
        i1 = i0 + 1.0
        if (y < 0.5) y = 0.5
        if (y > Nfloat + 0.5) y = Nfloat + 0.5
        j0 = Math.floor(y)
        j1 = j0 + 1.0

        s1 = x - i0
        s0 = 1.0 - s1
        t1 = y - j0
        t0 = 1.0 - t1

        let i0i = ~~i0
        let i1i = ~~i1
        let j0i = ~~j0
        let j1i = ~~j1

        d[this.IX(i, j)] =
          s0 * (t0 * d0[this.IX(i0i, j0i)] + t1 * d0[this.IX(i0i, j1i)]) +
          s1 * (t0 * d0[this.IX(i1i, j0i)] + t1 * d0[this.IX(i1i, j1i)])
      }
    }

    this.setBound(b, d, N)
  }

  step = () => {
    const visc = this.viscosity
    const diff = this.diffusion
    const dt = this.dt
    const N = this.size
    const Vx = this.Vx
    const Vy = this.Vy
    const Vx0 = this.Vx0
    const Vy0 = this.Vy0
    const s = this.s
    const density = this.density
    const iter = Fluid.iter

    this.diffuse(1, Vx0, Vx, visc, dt, iter, N)
    this.diffuse(2, Vy0, Vy, visc, dt, iter, N)

    this.project(Vx0, Vy0, Vx, Vy, iter, N)

    this.advect(1, Vx, Vx0, Vx0, Vy0, dt, N)
    this.advect(2, Vy, Vy0, Vx0, Vy0, dt, N)

    this.project(Vx, Vy, Vx0, Vy0, iter, N)

    this.diffuse(0, s, density, diff, dt, iter, N)
    this.advect(0, density, s, Vx, Vy, dt, N)
  }
  renderD = (p: p5, scale = 1) => {
    const N = this.size
    const density = this.density
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const d = density[this.IX(i, j)]
        p.fill(d)
        p.noStroke()
        p.square(i * scale, j * scale, scale)
      }
    }
  }
  renderV = (p: p5, scale = 1) => {
    const N = this.size
    const Vx = this.Vx
    const Vy = this.Vy
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const x = i * scale
        const y = j * scale
        const vx = Vx[this.IX(i, j)]
        const vy = Vy[this.IX(i, j)]
        p.stroke(255)
        p.line(x, y, x + vx * scale, y + vy * scale)
      }
    }
  }
  renderDyedV = (p: p5, scale = 1) => {
    const N = this.size
    const Vx = this.Vx
    const Vy = this.Vy
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const x = i * scale
        const y = j * scale
        const vx = Vx[this.IX(i, j)]
        const vy = Vy[this.IX(i, j)]
        const d = this.density[this.IX(i, j)]
        const vel = p.mag(vx, vy)
        p.colorMode(p.HSB)
        // p.fill((p.map(vel, 0, 0.1, 0, 255) + 0) % 255, p.map(d, 0, 500, 0, 255), p.map(d, 0, 500, 0, 255))

        // Play around with the color
        p.fill((p.map(vel, 0, 0.1, 228, 254, true) + 0) % 255, p.map(d, 0, 500, 0, 255), p.map(d, 0, 500, 0, 255))
        p.noStroke()
        p.square(x, y, scale)
        // p.stroke(255)
        // p.line(x, y, x + vx * scale, y + vy * scale)
      }
    }
  }
}
