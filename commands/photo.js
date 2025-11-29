import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export const name = "photo";
export const description = "Transforme une image, sticker ou vidéo en photo avec le sceau JAMISON ";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    // Détecte le type de média (image / sticker / vidéo)
    const type = quoted
      ? Object.keys(quoted)[0]
      : Object.keys(msg.message)[0];

    if (
      type !== "imageMessage" &&
      type !== "stickerMessage" &&
      type !== "videoMessage"
    ) {
      await sock.sendMessage(
        from,
        { text: "📸 Réponds à une *image, sticker ou vidéo* pour la transformer en photo." },
        { quoted: msg }
      );
      return;
    }

    // Sélection du message contenant le média
    const mediaMessage = quoted ? { message: quoted } : msg;

    // Détermine le bon type de contenu
    const contentType =
      type === "stickerMessage"
        ? "sticker"
        : type === "imageMessage"
        ? "image"
        : "video";

    // Téléchargement du média
    const stream = await downloadContentFromMessage(
      mediaMessage.message[type],
      contentType
    );

    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    // Envoi de l’image convertie avec nouvelle légende
    const caption = `
> 🩸 *?? ?��???????? ?? ?��?????? ?��?????? On n����chappe pas �� l��?il de l��ombre....*

> 🩸 𝙥𝙤𝙬𝙚𝙧𝙚𝙙 𝙗𝙮 𝘾𝙍𝙄𝙈𝙄𝙉𝘼𝙇 𝙓𝙈𝘿 BOT 🩸*
`.trim();

    await sock.sendMessage(
      from,
      {
        image: buffer,
        caption
      },
      { quoted: msg }
    );
  } catch (err) {
    console.error("�? Erreur photo :", err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: "⚠️ Une erreur est survenue pendant la transformation en photo.",
    });
  }
}