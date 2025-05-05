# WebAssembly Demo

## C

First install emcc. The version in NPM is quite deprecated.

```
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

Build the Monte Carlo calculation of Pi:

`emcc src/c/pi.c -o c-pi.js -s WASM=1 -s EXPORTED_FUNCTIONS="['_approximate_pi']" -s EXPORTED_RUNTIME_METHODS="['ccall', 'cwrap']"`

Or use `make c`.

For Rust, you can use the `make rust` target. If you want to explore on your own, follow these steps:


##  Rust

1. **Install Rust using Rustup**:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

2. **Verify installation**

```
rustc --version
cargo --version
```

3. **Add WebAssembly Target**

`rustup target add wasm32-unknown-unknown`

4. **Install `wasm-pack` for Linux**

`curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh`

Verify installation:

`wasm-pack --version`

5. **Setup Rust Wasm Project**

```
cargo new --lib my-wasm-project
cd my-wasm-project
```

6. **Configure `Cargo.toml`**

```
[package]
name = "my-wasm-project"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "rlib"]

[dependencies]
wasm-bindgen = "0.2"
```

7. **Edit `src/lib.rs` with a simple example**

```
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = Math)]
    fn random() -> f64;
}

#[wasm_bindgen]
pub fn approximate_pi(num_samples: u32) -> f64 {
    let mut points_in_circle = 0;
    
    for _ in 0..num_samples {
        let x: f64 = 2.0 * random() - 1.0;
        let y: f64 = 2.0 * random() - 1.0;
        
        if x*x + y*y <= 1.0 {
            points_in_circle += 1;
        }
    }
    
    4.0 * (points_in_circle as f64) / (num_samples as f64)
}
```

8. **Build the Wasm module**

`wasm-pack build --target web`

9. **Create an HTML file**

```
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>WebAssembly Demo</title>
</head>
<body>
  <h1>WebAssembly Monte Carlo π Approximation</h1>
  <button id="calculate">Calculate π</button>
  <div id="result"></div>
  <script type="module">
    import init, { approximate_pi } from './pkg/my_wasm_project.js';
    
    async function run() {
      await init();
      
      document.getElementById('calculate').addEventListener('click', () => {
        const result = approximate_pi(1000000);
        document.getElementById('result').textContent = `π ≈ ${result}`;
      });
    }
    
    run();
  </script>
</body>
</html>
```

10. **Serve the project**

## AssemblyScript

1. Setup your project directory:

```
project-root/
├── assembly/
│   └── index.ts
├── index.html
├── index.js
├── asconfig.json
```

2. Install AssemblyScript

`npm intall --save-dev assemblyscript`

3. Create an `asconfig.json` file.

```
{
  "targets": {
    "release": {
      "outFile": "build/optimized.wasm",
      "optimizeLevel": 3,
      "shrinkLevel": 1
    }
  },
  "entries": ["assembly/index.ts"]
}
```

4. Write your code under `assembly/index.ts`

4. Compile the Wasm

`npx asc --config asconfig.json`

5. Add to a Web Page

`index.html`

```
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Monte Carlo π (AssemblyScript)</title>
</head>
<body>
  <h1>π Estimate: <span id="result">...</span></h1>
  <script type="module" src="index.js"></script>
</body>
</html>
```

`index.js`
```
const wasm = await WebAssembly.instantiateStreaming(
  fetch('./dist/as-pi.wasm')
);

const computePi = wasm.instance.exports.compute_pi;
const estimate = computePi(1000000);

document.getElementById("result").textContent = estimate.toFixed(6);
```


