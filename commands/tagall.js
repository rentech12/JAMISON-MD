// 🩸 Criminal MD BOT
// === TAGALL COMMAND ===
// Auteur : ChatGPT X Criminal-MD

export const name = "tagall";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;

    // === Réaction 🩸 automatique ===
    await sock.sendMessage(from, {
      react: { text: "🩸", key: msg.key }
    });

    // Vérification si c’est un groupe
    if (!from.endsWith("@g.us")) {
      await sock.sendMessage(from, { text: "⚠️ Cette commande fonctionne seulement dans un groupe." }, { quoted: msg });
      return;
    }

    // Récupération des membres du groupe
    const metadata = await sock.groupMetadata(from);
    const participants = metadata.participants;

    let texte = `🩸 *CRIMINAL MD — TAGALL*\n\n`;

    for (const user of participants) {
      const id = user.id;
      texte += `👉 @${id.split("@")[0]}\n`;
    }

    // Message final avec mentions
    await sock.sendMessage(
      from,
      {
        text: texte,
        mentions: participants.map(p => p.id)
      },
      { quoted: msg }
    );

  } catch (err) {
    console.log("Erreur TAGALL :", err);
  }
}