// 🩸 Commande : add
// 👨‍💻 Dev : Ren Tech
// 📌 Ajoute un membre dans un groupe

export const name = "add";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;

  // === Vérification : message dans un groupe ===
  if (!from.endsWith("@g.us")) {
    return sock.sendMessage(
      from,
      { text: "🩸 *Commande utilisable uniquement dans un groupe.*" },
      { quoted: msg }
    );
  }

  // === Infos utilisateur ===
  const sender = msg.key.fromMe ? sock.user.id : msg.key.participant;
  const senderNum = sender.split("@")[0].replace(/[^0-9]/g, "");

  // === Permissions (owners définis dans index.js) ===
  const allowed = [...(global.owners || [])];

  if (!allowed.includes(senderNum)) {
    return sock.sendMessage(
      from,
      { text: "🩸 *Tu n’as pas la permission d’utiliser la commande add.*" },
      { quoted: msg }
    );
  }

  // === Vérification de l'argument du numéro ===
  if (!args[0]) {
    return sock.sendMessage(
      from,
      { text: "🩸 Usage : *.add 237XXXXXXXX*" },
      { quoted: msg }
    );
  }

  // Nettoyage du numéro
  let number = args[0].replace(/[^0-9]/g, "");

  if (number.length < 8) {
    return sock.sendMessage(
      from,
      { text: "🩸 *Numéro invalide.*" },
      { quoted: msg }
    );
  }

  // === Construction du JID ===
  const jid = `${number}@s.whatsapp.net`;

  try {
    // === Tentative d’ajout ===
    await sock.sendMessage(
      from,
      {
        text: `🩸 *Ajout du membre en cours…*\n➡️ @${number}`,
        mentions: [jid],
      },
      { quoted: msg }
    );

    await sock.groupParticipantsUpdate(from, [jid], "add");
  } catch (error) {
    console.log("Erreur add:", error);

    return sock.sendMessage(
      from,
      {
        text: "❌ *Impossible d’ajouter ce numéro.*\nPeut-être que :\n- Le numéro n’a pas WhatsApp\n- Le groupe empêche l’ajout\n- Le bot n’est pas admin",
      },
      { quoted: msg }
    );
  }
}
