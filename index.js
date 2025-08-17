const express = require("express");
const { startBot } = require("./mega");
const { pairSystem } = require("./pair");

const app = express();
const PORT = 3000;

// Static files serve කරන්න
app.use(express.static(__dirname));

// Pair.html run කරන්න
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/pair.html");
});

// Bot functions run කරන්න
startBot();
pairSystem();

// Server start
app.listen(PORT, () => {
  console.log(`🌐 Server running: http://localhost:${PORT}`);
});
