/* Example of a basic callback and what it does and does not do. */

function doWork(taskName, callback) {
  console.log(`Starting task: ${taskName}...`);

  // Simulate an asynchronous task (like fetching data)
  setTimeout(() => {
    console.log(`Finished task: ${taskName}`);
    callback(); // Call the provided function when done
  }, 10000);
}

function onDone() {
  console.log("All done! Callback executed.");
}

// Run it:
doWork("Load user profile", onDone);
