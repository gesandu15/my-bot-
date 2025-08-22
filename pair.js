const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

async function pairSystem() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true, // terminal එකට print වෙනවා
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, qr } = update;

    if (qr) {
      console.log("📱 QR code එක terminal එකේ පෙන්වයි. WhatsApp app එකෙන් scan කරන්න.");
      // 👉 මෙතැනින් UI එකට QR එක pass කරන්න
      // උදා: save to file, emit via socket, or inject to HTML
    }

    if (connection === 'open') {
      console.log("✅ WhatsApp සම්බන්ධතාවය සාර්ථකයි!");
    }

    if (connection === 'close') {
      console.log("❌ සම්බන්ධ වීම අසාර්ථකයි.");
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

module.exports = { pairSystem };
