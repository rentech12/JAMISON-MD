// 🩸 Commande Kick — Criminal MD BOT
// Répond par emoji + kick la personne dont tu réponds au message

export const name = "kick";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  const isGroup = from.endsWith("@g.us");

  if (!isGroup) {
    await sock.sendMessage(from, { text: "❌ Cette commande fonctionne uniquement en groupe." }, { quoted: msg });
    return;
  }

  // Vérification cible via réponse
  const quoted = msg.message?.extendedTextMessage?.contextInfo;
  const cible = quoted?.participant;

  if (!cible) {
    await sock.sendMessage(from, { text: "📌 Répond au message de la personne que tu veux *kick*." }, { quoted: msg });
    return;
  }

  // — Réaction automatique 🩸 —
  try {
    await sock.sendMessage(from, {
      react: {
        key: msg.key,
        text: "🩸",
      }
    });
  } catch {}

  // — Envoi d’un message avant kick —
  try {
    await sock.sendMessage(from, {
      text: `🩸 *Exécution en cours...*\n➡️ Expulsion de @${cible.split("@")[0]}`,
      mentions: [cible]
    }, { quoted: msg });
  } catch {}

  // — Kick réel —
  try {
    await sock.groupParticipantsUpdate(from, [cible], "remove");

    await sock.sendMessage(from, {
      text: `☠️ L’utilisateur @${cible.split("@")[0]} a été expulsé.`,
      mentions: [cible]
    });
  } catch (e) {
    await sock.sendMessage(from, {
      text: "❌ Impossible de kick cet utilisateur (permissions insuffisantes ?)",
    }, { quoted: msg });
  }
}