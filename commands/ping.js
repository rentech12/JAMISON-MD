// === Commande Ping Compatible Criminal MD ===

import chalk from "chalk";

export const name = "ping";
export const description = "Vérifie la latence du bot et réagit avec 🩸";

export async function execute(sock, m) {
  try {
    await sock.sendMessage(m.key.remoteJid, {
      react: { text: "🩸", key: m.key },
    });

    const start = Date.now();

    const sent = await sock.sendMessage(
      m.key.remoteJid,
      { text: "🏓 *Pong...*" },
      { quoted: m }
    );

    const end = Date.now();
    const latency = end - start;

    await sock.sendMessage(
      m.key.remoteJid,
      {
        text: `*Pong!* 🩸\n⏱️ Latence : *${latency} ms*\n\nPowered by Criminal MD 🩸`,
      },
      { quoted: sent }
    );

    console.log(chalk.green(`[PING] ${latency} ms`));
  } catch (e) {
    console.log(chalk.red("[PING ERROR]"), e);
  }
}
