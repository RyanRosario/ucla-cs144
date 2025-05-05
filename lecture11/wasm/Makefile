DIST_DIR := dist
RUST_DIST_DIR := ../../dist
SRC_C_DIR := src/c
SRC_RUST_DIR := .
RUST_TARGET_DIR := target

# Define the success message
SUCCESS_MSG := @echo "See the dist/ directory for wasm and js glue files"

# Ensure the dist directory exists
$(DIST_DIR):
	mkdir -p $(DIST_DIR)

# C target: Compile pi.c to WebAssembly using Emscripten
c: $(DIST_DIR)
	emcc $(SRC_C_DIR)/pi.c  -o $(DIST_DIR)/c-pi.js -s EXPORTED_FUNCTIONS="['_approximate_pi']" -s EXPORTED_RUNTIME_METHODS="['ccall', 'cwrap']"
	# emcc $(SRC_C_DIR)/pi.c -O3 -o $(DIST_DIR)/c-pi.js -s SIDE_MODULE=1 -s EXPORTED_FUNCTIONS="['_approximate_pi']" -s EXPORTED_RUNTIME_METHODS="['ccall', 'cwrap']"
	$(SUCCESS_MSG)

# Rust target: Compile Rust code to WebAssembly using wasm-pack
rust: $(DIST_DIR)
	wasm-pack build src/rust --target web --out-name rust-pi --out-dir $(RUST_DIST_DIR) --release
	$(SUCCESS_MSG)

as: $(DIST_DIR)
	npx asc src/assembly/index.ts -b dist/as/pi.wasm --runtime stub -O3
	$(SUCCESS_MSG)

# All target: Build both C and Rust versions
all: c rust as

# Clean target: Remove the dist directory
clean:
	rm -rf $(DIST_DIR) $(RUST_TARGET_DIR)

.PHONY: c rust all clean
