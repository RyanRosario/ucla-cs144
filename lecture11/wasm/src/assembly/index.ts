// A simple pseudo-random number generator (LCG)
let seed: u32 = 42;

function randomDouble(): f64 {
  seed = <u32>((1664525 * seed + 1013904223) % 4294967296);
  return f64(seed) / 4294967296.0;
}


// Monte Carlo method to estimate pi
export function compute_pi(samples: i32): f64 {
  let countInsideCircle: i32 = 0;

  for (let i: i32 = 0; i < samples; i++) {
    let x: f64 = randomDouble();
    let y: f64 = randomDouble();

    if (x * x + y * y <= 1.0) {
      countInsideCircle++;
    }
  }

  return 4.0 * f64(countInsideCircle) / f64(samples);
}

