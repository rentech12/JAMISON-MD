// 🩸 delete.js — Supprime un média
// === JAMISON XMD BOT ===
// Auteur : Ren Tech

export const name = "delete";
export const description = "Supprime un média (image, audio, vidéo, etc.) du chat.";
export const usage = ".delete (réponds à un média)";

export async function execute(sock, msg) {
  try {
    const from = msg.key.remoteJid;

    // Réaction
    try {
      await sock.sendMessage(from, { react: { text: "🩸", key: msg.key } });
    } catch {}

    // Récupérer les infos du message cité (tous types)
    const context = msg.message?.extendedTextMessage?.contextInfo;

    if (!context || !context.stanzaId) {
      await sock.sendMessage(
        from,
        { text: "⚠️ Réponds à un média ou message pour le supprimer." },
        { quoted: msg }
      );
      return;
    }

    const key = context.stanzaId;
    const participant = context.participant;

    // Suppression du message cité
    await sock.sendMessage(from, { 
      delete: {
        remoteJid: from,
        id: key,
        participant: participant,
        fromMe: false
      }
    });

    // Confirmation
    await sock.sendMessage(from, { text: "✅ Média supprimé avec succès !" });

  } catch (error) {
    console.error("Erreur delete.js :", error);

    await sock.sendMessage(
      msg.key.remoteJid,
      { text: "❌ Erreur : impossible de supprimer le média." },
      { quoted: msg }
    );
  }
}
