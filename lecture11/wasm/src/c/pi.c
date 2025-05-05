#include <stdlib.h>
#include <time.h>
#include <emscripten.h>

// Monte Carlo approximation of Pi
EMSCRIPTEN_KEEPALIVE
double approximate_pi(int num_samples) {
    // Seed the random number generator
    srand(time(NULL));
    
    int points_in_circle = 0;
    
    for (int i = 0; i < num_samples; i++) {
        // Generate random point in the square (-1,-1) to (1,1)
        double x = 2.0 * ((double)rand() / RAND_MAX) - 1.0;
        double y = 2.0 * ((double)rand() / RAND_MAX) - 1.0;
        
        // Check if the point is inside the circle of radius 1
        if (x*x + y*y <= 1.0) {
            points_in_circle++;
        }
    }
    
    // Calculate and return Pi approximation
    return 4.0 * (double)points_in_circle / num_samples;
}
