// 🩸 MENU JAMISON MD Version 2.0 + AUDIO

import fs from "fs";

export const name = "menu";  // OBLIGATOIRE pour ton index.js

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

export async function execute(sock, msg, args) {   // OBLIGATOIRE pour ton index.js
  try {
    const from = msg.key.remoteJid;
    const uptime = formatUptime(process.uptime());

    // Réaction 🩸
    await sock.sendMessage(from, {
      react: { text: "🩸", key: msg.key }
    });

    // Media (image + audio)
    const image = fs.readFileSync("./media/menu.jpg");
    const audio = fs.readFileSync("./media/menu.mp3");

    // Texte principal du menu
    const menuText = `
╔════════════════════╗
     🩸JAMISON MD 🩸
╚════════════════════╝

🥷🏾 *Utilisateur* : ${msg.pushName || "Invité"}
⚙️ *Mode*        : 🔒 Privé
⏱️ *Uptime*      : ${uptime}
📱 *Version*     : 2.0
🧎🏾 *Développeur* : REN TECH 

╔───── UTILITY ─────╗

➤ 𝙳𝙴𝙻𝙴𝚃𝙴
➤ 𝙳𝙴𝚅𝙸𝙲𝙴
➤ 𝙿𝙸𝙽𝙶


╚──────────────────╝

╔───── GROUPS ─────╗
➤ 𝙰𝙳𝙳 @
➤ 𝙳𝙴𝙼𝙾𝚃𝙴 @
➤ 𝙳𝙴𝙼𝙾𝚃𝙴𝙰𝙻𝙻
➤ 𝙸𝙽𝚅𝙸𝚃𝙴
➤ 𝙺𝙸𝙲𝙺 @
➤ 𝙺𝙸𝙲𝙺𝙰𝙻𝙻
➤ 𝙻𝙴𝙰𝚅𝙴
➤ 𝙼𝚄𝚃𝙴
➤ 𝙿𝚁𝙾𝙼𝙾𝚃𝙴 @
➤ 𝙿𝚁𝙾𝙼𝙾𝚃𝙴𝙰𝙻𝙻
➤ 𝙿𝚄𝚁𝙶𝙴
➤ 𝚂𝙴𝚃𝙿𝙿𝙶
➤ 𝚃𝙰𝙶
➤ 𝚃𝙰𝙶𝙰𝙻𝙻
➤ 𝚄𝙽𝙼𝚄𝚃𝙴
➤ 𝙶𝙿𝙿

╚──────────────────╝

╔──── DOWNLOAD ────╗
➤ 𝙸𝙼𝙰𝙶𝙴
➤ 𝙿𝙻𝙰𝚈
╚──────────────────╝

╔───── SECURITY ─────╗
➤ 𝙰𝙽𝚃𝙸𝙻𝙸𝙽𝙺
╚───────────────────╝

╔────── OWNER ──────╗
➤ 𝙾𝚆𝙽𝙴𝚁
╚──────────────────╝

╔───── MEDIAS ─────╗
➤ 𝙿𝙷𝙾𝚃𝙾
➤ vv
➤ 𝚂𝚃𝙸𝙲𝙺𝙴𝚁
➤ 𝙿𝙿
➤ 𝚂𝙰𝚅𝙴
╚──────────────────╝

> 𝙳𝙴𝚅 𝙱𝚈 REN TECH 

 ╔═══◆◆◆═══╗

 𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 REN TECH 

╚═══◆◆◆═══╝
`;

    // Envoi de l’image + menu
    await sock.sendMessage(from, {
      image: "https://files.catbox.moe/s3d33z.jpg"
      caption: menuText
    });

    // Envoi audio (note vocale)
    await sock.sendMessage(from, {
      audio: audio,
      mimetype: "audio/mp4",
      ptt: true
    });

  } catch (e) {
    console.error("Erreur dans le menu :", e);
  }
}
