// 🩸 Criminal MD BOT — INDEX PRINCIPAL
// Version : v2.0.1 (Build Clean Handler ESModule)

import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
} from "@whiskeysockets/baileys";

import pino from "pino";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import chalk from "chalk";
import { Boom } from "@hapi/boom";
import readline from "readline";
import { handler } from "./handler.js";

dotenv.config();

// === Console Input ===
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

// === Helpers ===
function normalizeJid(jid) {
  if (!jid) return null;
  return jid.split(":")[0].replace("@lid", "@s.whatsapp.net");
}
function getBareNumber(jid) {
  if (!jid) return "";
  return String(jid).split("@")[0].replace(/[^0-9]/g, "");
}
function unwrapMessage(m) {
  return (
    m?.ephemeralMessage?.message ||
    m?.viewOnceMessageV2?.message ||
    m?.documentWithCaptionMessage?.message ||
    m
  );
}
function pickText(m) {
  return (
    m?.conversation ||
    m?.extendedTextMessage?.text ||
    m?.imageMessage?.caption ||
    m?.videoMessage?.caption ||
    null
  );
}

// === Mode (public/private) ===
const MODE_FILE = "./mode.json";
function getMode() {
  if (!fs.existsSync(MODE_FILE)) {
    fs.writeFileSync(MODE_FILE, JSON.stringify({ mode: "private" }, null, 2));
  }
  return JSON.parse(fs.readFileSync(MODE_FILE)).mode || "private";
}
function loadSudo() {
  const file = "./sudo.json";
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({ sudo: [] }, null, 2));
  return JSON.parse(fs.readFileSync(file)).sudo;
}

// === MAIN FUNCTION ===
async function startCriminal() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    auth: state,
    version,
    printQRInTerminal: false,
    logger: pino({ level: "silent" }),
    browser: ["Ubuntu", "Chrome", "Criminal-MD"],
  });

  // === Pairing ===
  try {
    if (!state?.creds?.registered) {
      let number = (process.env.OWNER_NUMBER || "").trim();

      if (!number && process.stdin.isTTY) {
        number = (await ask(chalk.cyan("📱 Entre ton numéro WhatsApp (ex: 225xxxxxxxx): "))).trim();
      }

      if (number) {
        const resp = await sock.requestPairingCode(number);
        const code = typeof resp === "string" ? resp : resp?.code || null;
        if (code) console.log(chalk.green("\n🔑 Code d’appairage : ") + code.split("").join(" "));
      } else {
        console.log(chalk.red("❌ Aucun numéro saisi."));
      }
    }
  } catch (e) {
    console.log(chalk.red("❌ Pairing Error:"), e);
  }

  // === Connexion WhatsApp ===
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) console.log(chalk.yellow("📸 Scanne vite le QR !"));

    if (connection === "open") {
      console.log(chalk.green("🩸 Criminal MD Connecté"));
      console.log(chalk.cyan("➡️ Handler ESModule activé"));

      // Owner global
      const ownerJid = normalizeJid(sock.user.id);
      const ownerNum = getBareNumber(ownerJid);
      global.owners = [ownerNum];

      // Marque premier démarrage
      if (!fs.existsSync("./.firstboot")) {
        fs.writeFileSync("./.firstboot", "ok");
        console.log(chalk.magenta("↻ Premier lancement → restart dans 3s"));
        setTimeout(() => process.exit(1), 3000);
      }
    }

    if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      console.log(chalk.red("💀 Déconnecté :", reason));

      if (reason !== DisconnectReason.loggedOut) {
        console.log(chalk.yellow("🔄 Reconnexion dans 3s..."));
        setTimeout(startCriminal, 3000);
      } else {
        console.log(chalk.red("🚫 Session expirée — Supprime /session"));
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // === Réception des messages ===
  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message) continue;

      // Mode privé
      const sender = getBareNumber(msg.key.participant || msg.key.remoteJid);
      const mode = getMode();
      const sudo = loadSudo().map((x) => String(x).replace(/[^0-9]/g, ""));
      const allowed = [...(global.owners || []), ...sudo];

      if (mode === "private" && !allowed.includes(sender)) continue;

      // Passer au handler.js
      try {
        await handler(sock, msg);
      } catch (err) {
        console.log("Erreur Handler :", err);
      }
    }
  });
}

// === START ===
startCriminal().catch((err) => {
  console.log(chalk.red("❌ Fatal Error:"), err);
  try { rl.close(); } catch {}
  process.exit(1);
});
