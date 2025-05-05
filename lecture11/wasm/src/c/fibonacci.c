#include <emscripten.h>

/**
 * Computes the nth Fibonacci number using recursion
 * 
 * @param n The position in the Fibonacci sequence (0-based)
 * @return The nth Fibonacci number
 */
EMSCRIPTEN_KEEPALIVE
unsigned long long fibonacci(unsigned int n) {
    // Base cases
    if (n == 0) {
        return 0;
    }
    if (n == 1) {
        return 1;
    }
    
    // Recursive case: F(n) = F(n-1) + F(n-2)
    return fibonacci(n - 1) + fibonacci(n - 2);
}
