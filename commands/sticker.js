import fs from "fs";
import { exec } from "child_process";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export const name = "sticker";
export const description = "Transforme une image ou vidéo en sticker avec watermark JAMISON MD";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = (msg.pushName || "Anonyme").replace(/'/g, "\\'");

  let inputPath = "";
  let outputPath = "";

  try {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const type = quoted ? Object.keys(quoted)[0] : Object.keys(msg.message)[0];

    if (!["imageMessage", "videoMessage"].includes(type)) {
      await sock.sendMessage(from, {
        text: "📸 *Réponds à une image ou une courte vidéo pour en faire un sticker.*",
      }, { quoted: msg });
      return;
    }

    // Téléchargement
    const message = quoted ? quoted[type] : msg.message[type];
    const stream = await downloadContentFromMessage(message, type === "imageMessage" ? "image" : "video");

    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    // Fichiers temporaires
    inputPath = `./temp_${Date.now()}.${type === "imageMessage" ? "jpg" : "mp4"}`;
    outputPath = `./sticker_${Date.now()}.webp`;
    fs.writeFileSync(inputPath, buffer);

    // Commande FFmpeg sécurisée
    const watermark = `${sender} ✦ JAMISON MD`;
    await new Promise((resolve, reject) => {
      exec(
        `ffmpeg -y -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,drawtext=text='${watermark}':x=(w-text_w)-10:y=(h-text_h)-10:fontcolor=white:fontsize=18:borderw=1:bordercolor=black,fps=15,pad=512:512:-1:-1:color=black" -loop 0 -an -vsync 0 -s 512x512 -f webp "${outputPath}"`,
        (err) => err ? reject(err) : resolve()
      );
    });

    const stickerBuffer = fs.readFileSync(outputPath);

    // Envoi sticker
    await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });

  } catch (err) {
    console.error("❌ Erreur sticker.js :", err);
    await sock.sendMessage(from, {
      text: "⚠️ Une erreur est survenue. Assure-toi que *ffmpeg* est installé et la vidéo/image est compatible.",
    }, { quoted: msg });
  } finally {
    // Nettoyage fichiers temporaires
    try { if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch {}
    try { if (outputPath && fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
  }
}
