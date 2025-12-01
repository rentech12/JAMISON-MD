//==============================================================//
//                        JAMISON XMD                           //
//          Handler Principal — Build Clean Ren Tech            //
//==============================================================//

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsDir = path.join(__dirname, "commands");

//==============================================================//
//                     Auto-load des commandes
//==============================================================//
const commands = new Map();

for (const file of fs.readdirSync(commandsDir)) {
  if (file.endsWith(".js")) {
    const cmdModule = await import(path.join(commandsDir, file));
    if (!cmdModule.default || !cmdModule.name) continue;

    commands.set(cmdModule.name.toLowerCase(), cmdModule.default);
    console.log(`🧩 Commande chargée : ${cmdModule.name}`);
  }
}

//==============================================================//
//              Fonction globale : contextInfo Auto Ren Tech
//==============================================================//
global.sendRen = async (sock, jid, message) => {
  return sock.sendMessage(jid, {
    ...message,
    contextInfo: {
      externalAdReply: {
        title: "Ren Tech - Channel Officiel",
        body: "view channel",
        mediaType: 1,
        sourceUrl: "https://whatsapp.com/channel/0029VbBjwT52f3ELVPsK6V2K"
      }
    }
  });
};

//==============================================================//
//                       Handler Principal
//==============================================================//
export async function handler(sock, m) {
  try {
    const text =
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      "";

    if (!text) return;

    const prefix = ".";
    if (!text.startsWith(prefix)) return;

    const args = text.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!commands.has(commandName)) return;

    const execute = commands.get(commandName);

    console.log(`➡️ Commande exécutée : ${commandName}`);

    await execute(sock, m, args);

  } catch (err) {
    console.error("❌ Erreur Handler :", err);
  }
}
