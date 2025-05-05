use wasm_bindgen::prelude::*;

// Import JavaScript's Math.random function
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = Math)]
    fn random() -> f64;
}

#[wasm_bindgen]
pub fn approximate_pi(num_samples: u32) -> f64 {
    let mut points_in_circle = 0;
    
    for _ in 0..num_samples {
        // Generate random point in the square (-1,-1) to (1,1)
        let x: f64 = 2.0 * random() - 1.0;
        let y: f64 = 2.0 * random() - 1.0;
        
        // Check if the point is inside the circle of radius 1
        if x*x + y*y <= 1.0 {
            points_in_circle += 1;
        }
    }
    
    // Calculate pi approximation
    4.0 * (points_in_circle as f64) / (num_samples as f64)
}
