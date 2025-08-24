const express = require("express");
const fs = require("fs");
const { exec } = require("child_process");
let router = express.Router();
const pino = require("pino");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  delay,
  makeCacheableSignalKeyStore,
  Browsers,
  jidNormalizedUser,
} = require("@whiskeysockets/baileys");
const { upload } = require("./mega");

// Helper remove
function removeFile(FilePath) {
  if (!fs.existsSync(FilePath)) return false;
  fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get("/", async (req, res) => {
  let num = req.query.number;
  if (!num) return res.send({ error: "Please provide a WhatsApp number" });

  // clean & assign unique session folder for each number
  num = num.replace(/[^0-9]/g, "");
  const sessionFolder = `./sessions/${num}`;
  if (!fs.existsSync(sessionFolder)) fs.mkdirSync(sessionFolder, { recursive: true });

  async function MRGesaPair() {
    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);

    try {
      let GesaWeb = makeWASocket({
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(
            state.keys,
            pino({ level: "fatal" }).child({ level: "fatal" })
          ),
        },
        printQRInTerminal: false,
        logger: pino({ level: "fatal" }).child({ level: "fatal" }),
        browser: Browsers.macOS("Safari"),
      });

      if (!GesaWeb.authState.creds.registered) {
        await delay(1500);
        const code = await GesaWeb.requestPairingCode(num);
        if (!res.headersSent) return res.send({ code });
      }

      GesaWeb.ev.on("creds.update", saveCreds);

      GesaWeb.ev.on("connection.update", async (s) => {
        const { connection, lastDisconnect } = s;

        if (connection === "open") {
          try {
            await delay(5000);
            const credsPath = `${sessionFolder}/creds.json`;
            const user_jid = jidNormalizedUser(GesaWeb.user.id);

            const mega_url = await upload(
              fs.createReadStream(credsPath),
              `${num}-session.json`
            );

            const string_session = mega_url.replace("https://mega.nz/file/", "");

            const sid = `*M.R.Gesa [Powerful WA BOT]*\n\n👉 ${string_session} 👈\n\n*This is your Session ID for ${num}*\n\n🛑 *Do not share this code!*`;

            await GesaWeb.sendMessage(user_jid, {
              image: {
                url: "https://github.com/gesandu1111/ugjv/blob/main/WhatsApp%20Image%202025-08-14%20at%2020.56.15_d6d69dfa.jpg?raw=true",
              },
              caption: sid,
            });

            await GesaWeb.sendMessage(user_jid, { text: string_session });
          } catch (e) {
            exec("pm2 restart M.R.Gesa");
          }
        } else if (
          connection === "close" &&
          lastDisconnect?.error?.output?.statusCode !== 401
        ) {
          await delay(10000);
          MRGesaPair();
        }
      });
    } catch (err) {
      exec("pm2 restart M.R.Gesa");
      console.log("service restarted");
      await removeFile(sessionFolder);
      if (!res.headersSent) res.send({ code: "Service Unavailable" });
    }
  }

  return await MRGesaPair();
});

process.on("uncaughtException", function (err) {
  console.log("Caught exception: " + err);
  exec("pm2 restart M.R.Gesa");
});

module.exports = router;
