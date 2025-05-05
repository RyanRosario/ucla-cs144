// server.js - Minimal Express server
const express = require('express');
const app = express();
const port = 1919;

// Middleware to set MIME type for .wasm files
app.use((req, res, next) => {
  if (req.path.endsWith('.wasm')) {
    res.type('application/wasm');
  }
  next();
});

// Serve static files from current directory
app.use(express.static('./'));

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
