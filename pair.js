const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Server } = require('socket.io');
const http = require('http');

// Create basic HTTP server for Socket.io
const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (adjust if needed)
  }
});

server.listen(3001, () => {
  console.log("🌐 Socket.io server ක්‍රියාත්මකයි: http://localhost:3001");
});

async function pairSystem() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, qr } = update;

    if (qr) {
      console.log("📱 QR code එක ලැබුණා. UI එකට emit කරනවා...");
      io.emit("qr", qr); // Send QR string to frontend
    }

    if (connection === 'open') {
      console.log("✅ WhatsApp සම්බන්ධතාවය සාර්ථකයි!");
      io.emit("connected");
    }

    if (connection === 'close') {
      console.log("❌ සම්බන්ධ වීම අසාර්ථකයි.");
      io.emit("error");
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

module.exports = { pairSystem };
