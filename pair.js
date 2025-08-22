const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

async function pairSystem() {
  console.log("🔗 Pair system loaded from pair.js!");

  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, qr } = update;

    if (qr) {
      console.log("📱 QR code එක terminal එකේ පෙන්වයි. WhatsApp app එකෙන් scan කරන්න.");
    }

    if (connection === 'open') {
      console.log("✅ WhatsApp සම්බන්ධතාවය සාර්ථකයි!");
    }

    if (connection === 'close') {
      console.log("❌ සම්බන්ධ වීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.");
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

module.exports = { pairSystem };
