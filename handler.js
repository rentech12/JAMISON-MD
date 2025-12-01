// === handler.js ===
// Gestionnaire principal des commandes ES Module

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsDir = path.join(__dirname, "commands");

// Collection des commandes
const commands = new Map();

// Charger toutes les commandes automatiquement
for (const file of fs.readdirSync(commandsDir)) {
  if (file.endsWith(".js")) {
    const cmd = await import(path.join(commandsDir, file));
    commands.set(cmd.name, cmd);
  }
}

export async function handler(sock, m) {
  try {
    // Vérifier si c’est un message texte
    const text =
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      "";

    if (!text) return;

    // Préfixe (modifie ici si tu veux)
    const prefix = ".";
    if (!text.startsWith(prefix)) return;

    // Extraire nom + arguments
    const args = text.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Vérifier si commande existe
    if (!commands.has(commandName)) {
      return;
    }

    const command = commands.get(commandName);

    console.log(`➡️ Commande exécutée : ${commandName}`);

    // Exécuter commande
    await command.execute(sock, m, args);

  } catch (e) {
    console.error("Erreur Handler :", e);
  }
}
