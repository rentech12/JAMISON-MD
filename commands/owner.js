export const name = "owner";

export async function execute(sock, msg, args) {
    const from = msg.key.remoteJid;

    // --- Réaction 🩸 ---
    await sock.sendMessage(from, { 
        react: { 
            text: "🩸", 
            key: msg.key 
        } 
    });

    // Récupération du OWNER depuis .env
    const ownerNumber = process.env.OWNER_NUMBER
        ? process.env.OWNER_NUMBER.replace(/[^0-9]/g, "")
        : "Aucun défini";

    const ownerJid = ownerNumber + "@s.whatsapp.net";

    // --- Message info owner ---
    const message = `
🩸 *JAMISON MD — OWNER INFO* 🩸

• 👑 *Propriétaire :* wa.me/${+14432452503}
• 🛡️ *Bot Name :* JAMISON MD
• ⚙️ *Mode actuel :* OWNER ONLY
`;

    await sock.sendMessage(from, { 
        text: message.trim() 
    }, { quoted: msg });
}