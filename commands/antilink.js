// 🩸 Commande : antilink
// 👨‍💻 Dev : Ren Tech
// 📌 Active ou désactive l’Anti-Link dans un groupe

import fs from "fs";

export const name = "antilink";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  // === Vérification : dans un groupe ===
  if (!from.endsWith("@g.us")) {
    return sock.sendMessage(
      from,
      { text: "🩸 *Commande utilisable uniquement dans un groupe.*" },
      { quoted: msg }
    );
  }

  // === Vérification permissions ===
  const sender = msg.key.fromMe ? sock.user.id : msg.key.participant;
  const senderNum = sender.split("@")[0].replace(/[^0-9]/g, "");
  const allowed = [...(global.owners || [])];

  if (!allowed.includes(senderNum)) {
    return sock.sendMessage(
      from,
      { text: "🩸 *Tu n’as pas la permission d’utiliser antilink.*" },
      { quoted: msg }
    );
  }

  // === ON / OFF ? ===
  const state = (args[0] || "").toLowerCase();

  if (!["on", "off"].includes(state)) {
    return sock.sendMessage(
      from,
      { text: "🩸 *Usage :* .antilink on / off" },
      { quoted: msg }
    );
  }

  // === Chargement fichier ===
  const file = "./antilink.json";
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({ status: "off" }, null, 2));
  }

  const config = JSON.parse(fs.readFileSync(file));

  // === Mise à jour ===
  config.status = state;
  fs.writeFileSync(file, JSON.stringify(config, null, 2));

  // === Confirmation ===
  return sock.sendMessage(
    from,
    {
      text: `🩸 *AntiLink mis à jour !*\n➡️ État : *${state.toUpperCase()}*`,
    },
    { quoted: msg }
  );
}
