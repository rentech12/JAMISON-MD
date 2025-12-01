// 🩸 MENU JAMISON MD v2 — FANCY

import fs from "fs";

export const name = "menu";
export const description = "Affiche le menu principal du bot avec audio";

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

function getMode() {
  try {
    const file = JSON.parse(fs.readFileSync("./mode.json"));
    return file.mode || "private";
  } catch {
    return "private";
  }
}

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;
    const uptime = formatUptime(process.uptime());
    const username = msg.pushName || "Utilisateur";
    const mode = getMode();
    const channel = global.channel || "Aucune chaîne définie";

    // Réaction emoji
    await sock.sendMessage(from, { react: { text: "🩸", key: msg.key } });

    // Audio menu
    const audioPath = "./media/menu.mp3";
    if (!fs.existsSync(audioPath)) throw new Error("Audio menu.mp3 introuvable !");
    const audio = fs.readFileSync(audioPath);

    // Texte du menu
    const menuText = `
╔══════════════════════╗
         🩸✨ JAMISON MD ✨🩸
╚══════════════════════╝

👤 *Utilisateur* : ${username}
⚙️ *Mode*        : ${mode === "public" ? "🌍 Public" : "🔒 Privé"}
⏱️ *Uptime*      : ${uptime}
📱 *Version*     : 2.0
🧎🏾‍♂️ *Développeur* : REN TECH

╔═══ 🌟 COMMANDES 🌟 ═══╗
🗑️ .delete
📱 .device
🏓 .ping
╚══════════════════════╝

🔗 *Chaîne officielle WhatsApp* :
${channel}
`;

    // Essayer d'envoyer image
    try {
      await sock.sendMessage(from, {
        image: { url: "https://files.catbox.moe/s3d33z.jpg" },
        caption: menuText
      });
    } catch {
      // fallback si l’image plante
      await sock.sendMessage(from, { text: menuText });
    }

    // Envoi audio en note vocale
    await sock.sendMessage(from, {
      audio: audio,
      mimetype: "audio/mpeg",
      ptt: true
    });

  } catch (e) {
    console.error("Erreur menu :", e);
    await sock.sendMessage(
      msg.key.remoteJid,
      { text: `❌ Erreur menu : ${e.message}` },
      { quoted: msg }
    );
  }
}
