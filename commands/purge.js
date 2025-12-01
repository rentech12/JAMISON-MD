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

  // Protection SUDO (propre)
  const sudoList = [
    ...(global.owners || []),
    ...(global.sudo || []) // défini dans handler ou index
  ].map((n) => n.replace(/[^0-9]/g, "") + "@s.whatsapp.net");

  try {
    // Infos groupe
    const group = await sock.groupMetadata(from);
    const participants = group.participants || [];

    const botJid = (sock.user.id || "").split(":")[0] + "@s.whatsapp.net";

    // --- Vérifier si bot est admin ---
    const isBotAdmin = participants.some(
      (p) =>
        p.id === botJid &&
        (p.admin === "admin" || p.admin === "superadmin")
    );

    if (!isBotAdmin) {
      return await sock.sendMessage(
        from,
        { text: "❌ Je dois être *admin* pour effectuer la purge !" },
        { quoted: msg }
      );
    }

    // --- Détection admins ---
    const admins = participants
      .filter((p) => p.admin === "admin" || p.admin === "superadmin")
      .map((p) => p.id);

    // --- Détection kick ---
    const toKick = participants
      .filter(
        (p) =>
          !admins.includes(p.id) &&
          p.id !== botJid &&
          !sudoList.includes(p.id)
      )
      .map((p) => p.id);

    if (toKick.length === 0) {
      return await sock.sendMessage(
        from,
        { text: "『 🩸 JAMISON 𝐌𝐃 🩸 』\n😼 Tous les membres sont protégés. Rien à purifier." },
        { quoted: msg }
      );
    }

    // Message esthétique
    const announce = `
╔════════════════════════╗
      🩸 𝐏𝐔𝐑𝐆𝐄 JAMISON 🩸
╚════════════════════════╝

🔥 *Le jugement tombe sur les indignes...*
⚡ *JAMISON MD exécute la purge totale.*
💀 *Aucun pardon. Aucune évasion.*

📡 *Chaîne :* ${global.channel || "Aucune chaîne définie."}
`;

    // Envoi image + annonce
    try {
      await sock.sendMessage(from, {
        image: { url: "https://files.catbox.moe/um1spx.jpg" },
        caption: announce
      });
    } catch {
      await sock.sendMessage(from, { text: announce });
    }

    // Lancement purge
    await sock.groupParticipantsUpdate(from, toKick, "remove");

    await sock.sendMessage(
      from,
      {
        text: `
『 🩸 JAMISON 𝐌𝐃 🩸 』

⚔️ *Purge accomplie avec succès !*
➡️ *${toKick.length} membres éliminés.*

🛡️ Admins, owners, sudo & bot protégés automatiquement.
`
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
