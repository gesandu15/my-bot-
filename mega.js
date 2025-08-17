const makeWASocket = require("@whiskeysockets/baileys").default;
const { useMultiFileAuthState } = require("@whiskeysockets/baileys");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session");
  const sock = makeWASocket({ auth: state });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection } = update;
    if (connection === "open") {
      console.log("🤖 M.R.Gesa Bot Connected!");

      // Target number
      const targets = ["94784525290@s.whatsapp.net"]; // ඔබේ WhatsApp number

      // Message content
      const msg = {
        image: { 
          url: "https://github.com/gesandu1111/ugjv/blob/main/Create%20a%20branding%20ba.png?raw=true" 
        },
        caption: `*📡 Smart Tech News Channel*  
✨ නවතම තාක්ෂණික පුවත්, AI tools, App updates, Tips & Tricks — හැමදෙයක්ම එකම තැනක!

🔗 Join now:  
https://whatsapp.com/channel/0029Vb5dXIrBKfi7XjLb8g1S

🔋 Stay updated. Stay smart.  
Powered by *M.R.Gesa ⚡*`
      };

      for (let jid of targets) {
        await sock.sendMessage(jid, msg);
      }
    }
  });
}

module.exports = { startBot };
