// 🩸 MENU JAMISON MD Version 2.0 + AUDIO (Fancy)

import fs from "fs";

export const name = "menu";  // Obligatoire pour ton index.js

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;
    const uptime = formatUptime(process.uptime());

    // Réaction
    await sock.sendMessage(from, { react: { text: "🩸", key: msg.key } });

    // Audio
    const audio = fs.readFileSync("./media/menu.mp3");

    // Texte menu fancy + emoji
    const menuText = `
╔══════════════════════╗
         🩸✨ JAMISON MD ✨🩸
╚══════════════════════╝

👤 *Utilisateur* : ${msg.pushName || "Invité"}
⚙️ *Mode*        : 🔒 Privé
⏱️ *Uptime*      : ${uptime}
📱 *Version*     : 2.0
🧎🏾‍♂️ *Développeur* : REN TECH

╔═══ 🌟 UTILITY 🌟 ═══╗
🗑️ DELETE
📱 DEVICE
🏓 PING
╚════════════════════╝

╔═══ 🏘️ GROUPS 🏘️ ═══╗
➕ ADD @
⬇️ DEMOTE @
⬇️ DEMOTEALL
📨 INVITE
👢 KICK @
👢 KICKALL
🚪 LEAVE
🔇 MUTE
⬆️ PROMOTE @
⬆️ PROMOTEALL
🧹 PURGE
🖼️ SETPPG
🏷️ TAG
🏷️ TAGALL
🔈 UNMUTE
📢 GPP
╚════════════════════╝

╔═══ 🎵 DOWNLOAD 🎵 ═══╗
🖼️ IMAGE
🎶 PLAY
╚════════════════════╝

╔═══ 🔒 SECURITY 🔒 ═══╗
🚫 ANTILINK
╚════════════════════╝

╔═══ 👑 OWNER 👑 ═══╗
🛡️ OWNER
╚════════════════════╝

╔═══ 🖼️ MEDIAS 🖼️ ═══╗
📷 PHOTO
📹 VV
🎨 STICKER
🖼️ PP
💾 SAVE
╚════════════════════╝

🔗 *Chaîne officielle WhatsApp* :
${global.channel}

> 𝙳𝙴𝚅 𝙱𝚈 REN TECH
`;

    // Envoi image + caption
    await sock.sendMessage(from, {
      image: { url: "https://files.catbox.moe/s3d33z.jpg" },
      caption: menuText
    });

    // Envoi audio en note vocale
    await sock.sendMessage(from, {
      audio: audio,
      mimetype: "audio/mp4",
      ptt: true
    });

  } catch (e) {
    console.error("Erreur dans le menu :", e);
  }
}
