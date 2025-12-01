//==============================================================//
//                        JAMISON XMD                           //
//        WhatsApp Multi-Device Bot — Build Ren Tech            //
//==============================================================//
//   Index Principal — Version v3.0 (Handler ES Module Clean)   //
//==============================================================//

import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
} from "@whiskeysockets/baileys";

import pino from "pino";
import fs from "fs";
import chalk from "chalk";
import dotenv from "dotenv";
import readline from "readline";
import { Boom } from "@hapi/boom";
import { handler } from "./handler.js";

dotenv.config();

//==============================================================//
//                   CONTEXT INFO GLOBAL (Jamison MD)
//==============================================================//
global.jamisonContext = {
  externalAdReply: {
    title: "JAMISON MD — Official Build",
    body: "🔥 Powered by Ren Tech",
    mediaType: 1,
    renderLargerThumbnail: true,
    thumbnailUrl: "https://i.ibb.co/tJxq9n0/ren-tech-logo.jpg", // TU PEUX ME DONNER TON LOGO
    sourceUrl: "https://whatsapp.com/channel/0029VbBjwT52f3ELVPsK6V2K",
  }
};

//==============================================================//
//                      Console Input
//==============================================================//
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

//==============================================================//
//                      Helper Functions
//==============================================================//
function normalizeJid(jid) {
  if (!jid) return null;
  return jid.split(":")[0].replace("@lid", "@s.whatsapp.net");
}

function getBareNumber(jid) {
  if (!jid) return "";
  return String(jid).split("@")[0].replace(/[^0-9]/g, "");
}

const MODE_FILE = "./mode.json";
function getMode() {
  if (!fs.existsSync(MODE_FILE)) {
    fs.writeFileSync(MODE_FILE, JSON.stringify({ mode: "private" }, null, 2));
  }
  return JSON.parse(fs.readFileSync(MODE_FILE)).mode || "private";
}

function loadSudo() {
  const file = "./sudo.json";
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({ sudo: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(file)).sudo;
}

//==============================================================//
//                    MAIN BOT FUNCTION
//==============================================================//
async function startJamison() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    auth: state,
    version,
    printQRInTerminal: false,
    logger: pino({ level: "silent" }),
    browser: ["Ubuntu", "Chrome", "Jamison-XMD"],
  });

  //--------------------------------------------------------------//
  //                           Pairing
  //--------------------------------------------------------------//
  try {
    if (!state?.creds?.registered) {
      let number = (process.env.OWNER_NUMBER || "").trim();

      if (!number && process.stdin.isTTY) {
        number = (await ask(chalk.cyan("📱 Entre ton numéro WhatsApp (ex: 225xxxxxxxx): "))).trim();
      }

      if (number) {
        const resp = await sock.requestPairingCode(number);
        const code = typeof resp === "string" ? resp : resp?.code || null;

        if (code) {
          console.log(chalk.green("\n🔑 Code d'appairage : ") + code.split("").join(" "));
        }
      } else {
        console.log(chalk.red("❌ Aucun numéro fourni."));
      }
    }
  } catch (e) {
    console.log(chalk.red("❌ Erreur pairing:"), e);
  }

  //--------------------------------------------------------------//
  //                    Connection Updates
  //--------------------------------------------------------------//
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) console.log(chalk.yellow("📸 Scanne vite ce QR !"));

    if (connection === "open") {
      console.log(chalk.green("🩸 JAMISON XMD Connecté"));
      console.log(chalk.cyan("➡️ Handler ESModule activé"));

      const ownerJid = normalizeJid(sock.user.id);
      global.owners = [getBareNumber(ownerJid)];

      if (!fs.existsSync("./.firstboot")) {
        fs.writeFileSync("./.firstboot", "ok");
        console.log(chalk.magenta("↻ Premier lancement — redémarrage dans 3s..."));
        setTimeout(() => process.exit(1), 3000);
      }
    }

    if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      console.log(chalk.red("💀 Déconnecté :", reason));

      if (reason !== DisconnectReason.loggedOut) {
        console.log(chalk.yellow("🔄 Reconnexion dans 3s..."));
        setTimeout(startJamison, 3000);
      } else {
        console.log(chalk.red("🚫 Session expirée — supprime /session"));
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  //--------------------------------------------------------------//
  //                    Reception Messages
  //--------------------------------------------------------------//
  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message) continue;

      const sender = getBareNumber(msg.key.participant || msg.key.remoteJid);
      const mode = getMode();
      const sudo = loadSudo().map((x) => String(x).replace(/[^0-9]/g, ""));
      const allowed = [...(global.owners || []), ...sudo];

      if (mode === "private" && !allowed.includes(sender)) continue;

      try {
        await handler(sock, msg);
      } catch (err) {
        console.log("❌ Erreur Handler :", err);
      }
    }
  });
}

//==============================================================//
//                           START BOT
//==============================================================//
startJamison().catch((err) => {
  console.log(chalk.red("❌ Fatal Error:"), err);
  try { rl.close(); } catch {}
  process.exit(1);
});
