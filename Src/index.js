require('dotenv').config();
const { initializeWhatsApp } = require('./whatsapp/client');
const { initializeTelegram } = require('./telegram/bot');
const SessionManager = require('./sessions/manager');
const logger = require('./utils/logger');

class RenTechBot {
    constructor() {
        this.sessionManager = new SessionManager();
        this.telegramBot = null;
        this.whatsappClient = null;
        this.pairedUsers = new Map();
    }

    async initialize() {
        try {
            logger.info('🚀 Initialisation de Ren Tech Bot...');
            
            // Initialiser Telegram
            this.telegramBot = await initializeTelegram(this);
            logger.info('✅ Telegram Bot initialisé');
            
            // Initialiser WhatsApp
            this.whatsappClient = await initializeWhatsApp(this);
            logger.info('✅ WhatsApp Client initialisé');
            
            // Démarrer les services
            await this.startServices();
            
            logger.info('🎉 Ren Tech Bot est opérationnel!');
            
        } catch (error) {
            logger.error('❌ Erreur lors de l\'initialisation:', error);
            process.exit(1);
        }
    }

    async startServices() {
        // Service de nettoyage des sessions
        setInterval(() => {
            this.sessionManager.cleanupOldSessions();
        }, 3600000); // Toutes les heures
    }

    // Méthode pour pairing
    pairUser(telegramId, phoneNumber) {
        this.pairedUsers.set(telegramId, phoneNumber);
        return true;
    }

    // Méthode pour obtenir le statut
    getStatus() {
        return {
            whatsapp: this.whatsappClient ? 'connected' : 'disconnected',
            telegram: this.telegramBot ? 'running' : 'stopped',
            pairedUsers: this.pairedUsers.size,
            sessions: this.sessionManager.getSessionCount()
        };
    }
}

// Démarrer le bot
const bot = new RenTechBot();
bot.initialize();

// Gestion des erreurs non capturées
process.on('unhandledRejection', (error) => {
    logger.error('Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});
