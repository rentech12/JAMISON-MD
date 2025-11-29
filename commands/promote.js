// 🩸 Criminal MD — PROMOTE (ADMIN)

export const name = "promote";

export async function execute(sock, msg, args) {

  const from = msg.key.remoteJid;

  // Réagir automatiquement par 🩸

  await sock.sendMessage(from, {

    react: { text: "🩸", key: msg.key }

  });

  const quoted = msg.message?.extendedTextMessage?.contextInfo;

  let target;

  // 1️⃣ Cible mentionnée

  if (quoted?.mentionedJid?.length) {

    target = quoted.mentionedJid[0];

  }

  // 2️⃣ Cible via message répondu

  else if (quoted?.participant) {

    target = quoted.participant;

  }

  // 3️⃣ Cible via numéro en argument → .promote 237XXXXXXXX

  else if (args[0]) {

    let num = args[0].replace(/[^0-9]/g, "");

    if (num.length < 5) {

      return await sock.sendMessage(from, {

        text: "❌ Numéro invalide."

      }, { quoted: msg });

    }

    target = `${num}@s.whatsapp.net`;

  }

  // 4️⃣ Aucune cible trouvée

  else {

    return await sock.sendMessage(from, {

      text: "🩸 *Usage correct :*\n- .promote @tag\n- .promote (en répondant)\n- .promote 2376XXXXXXXX"

    }, { quoted: msg });

  }

  // === Vérification groupe ===

  if (!from.endsWith("@g.us")) {

    return await sock.sendMessage(from, {

      text: "❌ Cette commande fonctionne uniquement dans un groupe."

    }, { quoted: msg });

  }

  // === Promouvoir la personne ===

  try {

    await sock.groupParticipantsUpdate(from, [target], "promote");

    await sock.sendMessage(from, {

      text: `🩸 *Promotion effectuée !*\n> ${target.split("@")[0]} est maintenant *ADMIN*.`

    }, { quoted: msg });

  } catch (error) {

    await sock.sendMessage(from, {

      text: "❌ Impossible de promouvoir cette personne."

    }, { quoted: msg });

  }

}