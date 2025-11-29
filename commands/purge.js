export default {

  name: "purge",

  description: "Expulse tous les non-admins du groupe sauf owner, sudo et bot",

  async execute(sock, msg, args) {

    const from = msg?.key?.remoteJid;

    // 🩸 Réaction automatique

    try {

      await sock.sendMessage(from, { react: { text: "🩸", key: msg.key } });

    } catch {}

    const ownerNumber = (process.env.OWNER_NUMBER || "")

      .replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    // Vérif groupe

    if (!from || !from.endsWith("@g.us")) {

      await sock.sendMessage(from || msg.key.remoteJid, {

        text: "『 🩸 JAMISON 𝐗𝐌𝐃 🩸 』\n🚫 Cette commande est réservée aux *groupes*."

      }, { quoted: msg });

      return;

    }

    try {

      // Métadonnées du groupe

      const groupData = await sock.groupMetadata(from);

      const participants = groupData.participants || [];

      // Bot JID (nettoyé)

      const botJid =

        (sock?.user?.id || sock?.user?.jid || "")

          .split(":")[0]

          .replace("@lid", "@s.whatsapp.net");

      // Liste SUDO

      const sudoList = (global.sudo || []).map(n => n + "@s.whatsapp.net");

      // Récupération admins

      const admins = participants

        .filter(p => p.admin)

        .map(p => p.id);

      // Filtrage : kick *TOUS* les non-admins sauf owner, sudo et bot

      const toKick = participants

        .filter(p =>

          !p.admin &&

          p.id !== botJid &&

          p.id !== ownerNumber &&

          !sudoList.includes(p.id)

        )

        .map(p => p.id);

      if (toKick.length === 0) {

        await sock.sendMessage(from, {

          text: "『 🩸 JAMISON 𝐌𝐃 🩸 』\n😼 Aucun membre à purifier."

        }, { quoted: msg });

        return;

      }

      const allMembers = participants.map(p => p.id);

      // 🩸 Texte dramatique

      const purgeText = `╔═══『 🩸 𝐏𝐔𝐑𝐆𝐄 JAMISON 🩸 』═══╗

🔥 Le voile sanglant s’abat sur le groupe…

💀 Les indignes sont arrachés des ombres.

⚔️ Aucun pardon. Aucun refuge.

🌑 Le jugement est déjà scellé.

> Exécuté par JAMISON MD 🩸

╚══════════════════════════╝`;

      // Image + légende

      await sock.sendMessage(from, {

        image: {"https://files.catbox.moe/um1spx.jpg" },

        caption: purgeText,

        mentions: allMembers

      });

      // Exécution du kick

      await sock.groupParticipantsUpdate(from, toKick, "remove");

      // Confirmation

      await sock.sendMessage(from, {

        text: `『 🩸 JAMISON 𝐌𝐃 🩸 』

⚔️ Purge exécutée :

➡️ *${toKick.length}* membres éliminés.

🔮 Admins, owner, sudo et bot protégés automatiquement.`

      }, { quoted: msg });

    } catch (err) {

      console.error("❌ Erreur purge :", err);

      await sock.sendMessage(from, {

        text: "『 JAMISON 𝐌𝐃  』\n❌ Erreur lors de la purge.\n⚠️ Vérifie que je suis admin."

      }, { quoted: msg });

    }

  }

};