// 🩸 PURGE — JAMISON MD

export const name = "purge";
export const description = "Expulse tous les non-admins sauf owner, sudo et bot";

export async function execute(sock, msg, args) {
  const from = msg?.key?.remoteJid;

  // Réaction
  try {
    await sock.sendMessage(from, { react: { text: "🩸", key: msg.key } });
  } catch {}

  // Vérification groupe
  if (!from || !from.endsWith("@g.us")) {
    return await sock.sendMessage(
      from,
      { text: "『 🩸 JAMISON 𝐌𝐃 🩸 』\n🚫 Cette commande est réservée aux *groupes*." },
      { quoted: msg }
    );
  }

  // Charger SUDO depuis ton index
  const sudoList = (global.owners || [])
    .concat((global.sudo || []))
    .map((n) => n.replace(/[^0-9]/g, "") + "@s.whatsapp.net");

  try {
    // Metadata
    const group = await sock.groupMetadata(from);
    const participants = group.participants || [];

    // Bot JID
    const botJid = (sock.user.id || "")
      .split(":")[0]
      .replace("@lid", "@s.whatsapp.net");

    // Admins
    const admins = participants
      .filter((p) => p.admin)
      .map((p) => p.id);

    // Membres à kick
    const toKick = participants
      .filter(
        (p) =>
          !p.admin &&               // pas admin
          p.id !== botJid &&        // pas le bot
          !sudoList.includes(p.id)  // pas sudo ni owner
      )
      .map((p) => p.id);

    if (toKick.length === 0) {
      return await sock.sendMessage(
        from,
        { text: "『 🩸 JAMISON 𝐌𝐃 🩸 』\n😼 Tous les membres sont protégés. Rien à purifier." },
        { quoted: msg }
      );
    }

    const announce = `╔═══『 🩸 𝐏𝐔𝐑𝐆𝐄 𝐉𝐀𝐌𝐈𝐒𝐎𝐍 🩸 』═══╗

🔥 *Le jugement tombe sur les indignes...*
⚡ *JAMISON MD exécute la purge totale.*
💀 *Aucun pardon. Aucune évasion.*

📡 *Chaîne Officielle* :
${global.channel}

╚══════════════════════════╝`;

    // Envoi image + message
    await sock.sendMessage(from, {
      image: { url: "https://files.catbox.moe/um1spx.jpg" },
      caption: announce,
      mentions: participants.map((p) => p.id)
    });

    // Kick
    await sock.groupParticipantsUpdate(from, toKick, "remove");

    // Résultat final
    await sock.sendMessage(
      from,
      {
        text: `『 🩸 JAMISON 𝐌𝐃 🩸 』

⚔️ *Purge accomplie avec succès !*
➡️ *${toKick.length} membres éliminés.*

🛡️ Admins, owners, sudo & bot protégés automatiquement.`
      },
      { quoted: msg }
    );
  } catch (err) {
    console.error("❌ Erreur purge :", err);
    await sock.sendMessage(
      from,
      {
        text: "『 🩸 JAMISON 𝐌𝐃 』\n❌ Une erreur est survenue.\n⚠️ Vérifie que je suis admin."
      },
      { quoted: msg }
    );
  }
}
