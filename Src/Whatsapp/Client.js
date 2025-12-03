const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const logger = require('../utils/logger');
const fs = require('fs-extra');
const path = require('path');

async function initializeWhatsApp(renTechBot) {
    const sessionPath = path.join(__dirname, '../../sessions', process.env.WHATSAPP_SESSION_NAME);
    
    // Créer le dossier de session s'il n'existe pas
    await fs.ensureDir(sessionPath);
    
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    
    const socket = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: logger,
        browser: ['Ren Tech Bot', 'Chrome', '1.0.0']
    });

    socket.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            logger.info('📱 QR Code généré pour WhatsApp');
            qrcode.generate(qr, { small: true });
            
            // Envoyer le QR via Telegram si admin connecté
            if (renTechBot.telegramBot && process.env.TELEGRAM_ADMIN_ID) {
                renTechBot.telegramBot.sendMessage(
                    process.env.TELEGRAM_ADMIN_ID,
                    `Scan this QR Code to connect WhatsApp:\n\nQR will display in terminal.`
                );
            }
        }
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
            logger.warn('Connection closed, reconnecting:', shouldReconnect);
            if (shouldReconnect) {
                initializeWhatsApp(renTechBot);
            }
        } else if (connection === 'open') {
            logger.info('✅ WhatsApp connecté avec succès!');
            
            // Notifier Telegram
            if (renTechBot.telegramBot && process.env.TELEGRAM_ADMIN_ID) {
                renTechBot.telegramBot.sendMessage(
                    process.env.TELEGRAM_ADMIN_ID,
                    '✅ WhatsApp connecté avec succès!'
                );
            }
        }
    });

    socket.ev.on('creds.update', saveCreds);

    // Gérer les messages entrants
    socket.ev.on('messages.upsert', async (m) => {
        const message = m.messages[0];
        if (!message.message || message.key.fromMe) return;
        
        logger.info(`Nouveau message WhatsApp de: ${message.key.remoteJid}`);
        
        // Transférer le message à l'utilisateur Telegram appairé
        await handleIncomingMessage(message, renTechBot, socket);
    });

    return socket;
}

async function handleIncomingMessage(message, renTechBot, socket) {
    try {
        const sender = message.key.remoteJid;
        const text = message.message.conversation || 
                     message.message.extendedTextMessage?.text || 
                     '📎 Media message';
        
        // Trouver l'utilisateur Telegram appairé
        for (const [telegramId, phoneNumber] of renTechBot.pairedUsers) {
            if (sender.includes(phoneNumber.replace('+', ''))) {
                // Envoyer le message à Telegram
                await renTechBot.telegramBot.sendMessage(
                    telegramId,
                    `📱 Message WhatsApp de ${sender}:\n\n${text}`
                );
                break;
            }
        }
        
        // Réponse automatique
        await socket.sendMessage(sender, { 
            text: "🤖 Ren Tech Bot: Message reçu! Je le transfère à votre compte Telegram." 
        });
        
    } catch (error) {
        logger.error('Erreur lors du traitement du message:', error);
    }
}

module.exports = { initializeWhatsApp };
